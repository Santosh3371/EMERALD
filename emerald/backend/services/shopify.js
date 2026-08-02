const axios = require('axios');

const API_VERSION = '2024-01';

function client() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!domain || !token) {
    throw new Error('SHOPIFY_STORE_DOMAIN / SHOPIFY_ACCESS_TOKEN not set in .env');
  }
  return axios.create({
    baseURL: `https://${domain}/admin/api/${API_VERSION}`,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    timeout: 20000
  });
}

// Shopify product_type / tags -> our storefront nav categories. Anything
// unrecognized falls back to 'accessories' rather than failing the sync.
//
// DSers-imported products consistently leave product_type and tags EMPTY —
// verified against all 12 live products, 0/12 had either field populated —
// so title is the only field that actually carries category signal, and
// must be included in the match haystack or every product falls through
// to the 'accessories' fallback regardless of what it actually is.
//
// Order matters: unambiguous product-type words (shoes, bags, jewelry) are
// checked before the broader women/men clothing words, since a title can
// contain both (e.g. "Men's ... Patent Leather Shoes" must resolve to
// footwear, not "men" clothing — it would with the reverse order, since
// "Men's" appears in that title too). Regexes use \b word boundaries so
// bare "Men"/"Women" (no trailing 's) still match, not just "Men's".
const CATEGORY_MAP = [
  { match: /\b(boots?|heels?|loafers?|sneakers?|sandals?|oxfords?|shoes?|footwear)\b/i, category: 'footwear' },
  { match: /\b(bag|tote|backpack|clutch|satchel|duffle)\b/i, category: 'bags' },
  { match: /\b(rings?|necklaces?|earrings?|bracelets?|bangles?|jewel(le)?ry)\b/i, category: 'jewelry' },
  { match: /\b(scarf|belts?|sunglass(es)?|hats?|gloves?|wallets?|ties?|accessor\w*)\b/i, category: 'accessories' },
  { match: /\b(dress|gown|blouse|skirt|jumpsuit|women'?s?|lady|ladies)\b/i, category: 'women' },
  { match: /\b(shirts?|t-?shirts?|suits?|blazers?|men'?s?|trousers?|chinos?|jackets?|sweaters?|pullovers?|jumpers?|hoodies?|polos?|coats?)\b/i, category: 'men' }
];

function mapCategory(shopifyProduct) {
  const haystack = `${shopifyProduct.product_type || ''} ${shopifyProduct.tags || ''} ${shopifyProduct.title || ''}`;
  for (const rule of CATEGORY_MAP) {
    if (rule.match.test(haystack)) return rule.category;
  }
  return 'accessories';
}

function slugify(str) {
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// AliExpress-sourced listings typically bury real marketing copy between a
// leading key:value spec dump ("Brand Name: NONE Certification: CPNP...")
// and a trailing one ("Product Details: Net Weight..."/fake Q&A/emoji tip
// spam). The genuine copy in between is usually marked by an emoji bullet
// (🌟 ✨ etc.) — a common convention across these listings, not specific to
// one product — so find that instead of just truncating from byte zero,
// then still hard-cap length as a safety net for listings that don't
// follow this pattern at all.
function cleanDescription(html, maxLen = 400) {
  let text = String(html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();

  // Marketing copy start markers seen across different supplier listing
  // templates: an emoji bullet (🌟 ✨), a "Features:" label, or fullwidth
  // 【bracket】 bullets (common in listings translated from Chinese).
  const marketingMarker = /(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}])|(?:\bFeatures\s*:\s*)|(?:【)/u;
  const startMatch = text.match(marketingMarker);
  if (startMatch && startMatch.index < 600) {
    text = text.slice(startMatch.index + startMatch[0].length)
      .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}【】\s]+/u, '')
      .trim();
  }

  const trailingJunkMarker = /\b(Product Details:|Net Weight:|Package Includes:|SPECIFICATIONS?|Q:|FAQ:|Warm Tip)\b/i;
  const cut = text.match(trailingJunkMarker);
  if (cut && cut.index > 40) text = text.slice(0, cut.index).trim();

  if (text.length > maxLen) {
    text = text.slice(0, maxLen);
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > maxLen * 0.6) text = text.slice(0, lastSpace);
    text = text.trim() + '…';
  }
  return text;
}

function mapShopifyProduct(sp) {
  const variants = (sp.variants || []).map(v => ({
    shopifyVariantId: String(v.id),
    sku: v.sku || '',
    size: v.option1 || '',
    color: v.option2 || '',
    price: Number(v.price),
    stock: v.inventory_quantity != null ? v.inventory_quantity : 0
  }));

  const firstVariant = variants[0] || { price: 0, stock: 0 };
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))].map(name => ({ name, hex: '' }));

  return {
    name: sp.title,
    slug: `${slugify(sp.title)}-${sp.id}`,
    description: cleanDescription(sp.body_html) || sp.title,
    shortDescription: sp.title,
    price: firstVariant.price,
    salePrice: null,
    category: mapCategory(sp),
    brand: sp.vendor || 'EMERALD',
    tags: (sp.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    images: (sp.images || []).map(img => ({ url: img.src, alt: sp.title })),
    sizes,
    colors,
    stock: variants.reduce((sum, v) => sum + (v.stock || 0), 0),
    // Supplier-provided SKUs aren't guaranteed unique across different
    // Shopify products (confirmed live: two distinct products shared the
    // identical SKU string, which crashed the sync against our schema's
    // unique index). Suffixing with the Shopify product id — always unique
    // — guarantees no collision while keeping the original SKU visible.
    sku: firstVariant.sku ? `${firstVariant.sku}-${sp.id}` : `SHOPIFY-${sp.id}`,
    source: 'shopify',
    shopifyProductId: String(sp.id),
    shopifyHandle: sp.handle,
    variants
  };
}

// Fetch every product from Shopify, following cursor-based pagination.
async function fetchAllProducts() {
  const http = client();
  const all = [];
  let pageInfo = null;

  do {
    const params = pageInfo
      ? { limit: 250, page_info: pageInfo }
      : { limit: 250 };
    const res = await http.get('/products.json', { params });
    all.push(...res.data.products);

    const link = res.headers.link || res.headers.Link;
    const nextMatch = link && link.match(/<[^>]*[?&]page_info=([^&>]+)[^>]*>;\s*rel="next"/);
    pageInfo = nextMatch ? nextMatch[1] : null;
  } while (pageInfo);

  return all.map(mapShopifyProduct);
}

// Push a paid EMERALD order into Shopify so DSers picks it up for supplier fulfillment.
async function createShopifyOrder(order) {
  const http = client();

  const line_items = order.items.map(item => {
    if (!item.shopifyVariantId) {
      throw new Error(`Order item "${item.name}" has no shopifyVariantId — cannot forward to Shopify`);
    }
    return { variant_id: Number(item.shopifyVariantId), quantity: item.quantity };
  });

  const addr = order.shippingAddress || {};
  const [firstName, ...rest] = (addr.fullName || '').split(' ');

  const payload = {
    order: {
      line_items,
      email: order.guestEmail || undefined,
      financial_status: 'paid',
      shipping_address: {
        first_name: firstName || addr.fullName || '',
        last_name: rest.join(' ') || '',
        address1: addr.street,
        city: addr.city,
        province: addr.state,
        zip: addr.zip,
        country: addr.country,
        phone: addr.phone
      },
      note: `EMERALD order ${order.orderNumber}`,
      tags: 'emerald-storefront'
    }
  };

  const res = await http.post('/orders.json', payload);
  return res.data.order;
}

module.exports = { fetchAllProducts, mapShopifyProduct, createShopifyOrder, mapCategory };
