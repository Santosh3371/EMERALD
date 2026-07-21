require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, default: null },
  category: {
    type: String,
    enum: ['women', 'men', 'accessories', 'footwear', 'bags', 'jewelry'],
    required: true
  },
  brand: { type: String, required: true, trim: true },
  tags: [String],
  images: [{ url: String, alt: String }],
  sizes: [String],
  colors: [{ name: String, hex: String }],
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true },
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  onSale: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: { type: Array, default: [] }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const BRANDS = [
  'Aurelia Sarto', 'Bespoke Atelier', 'L’Horizon', 'Sovereign Style',
  'Elysium Tailors', 'Monarch Label', 'Verdant Fashion', 'Opus Noir',
  'Nomad & Co.', 'Heritage Wear', 'Velasquez Studio', 'Aura Minimalist',
  'Drape & Stitch', 'Meridian Classics'
];

const CATEGORIES_DATA = {
  women: {
    adjectives: ['Tailored', 'Silk', 'Linen', 'Pleated', 'Draped', 'Knit', 'Cashmere', 'Chiffon', 'Velvet', 'Satin', 'Crepe', 'Organza', 'Lace', 'Boho', 'Structured', 'Minimalist'],
    materials: ['Gown', 'Blazer', 'Trousers', 'Midi Dress', 'Wrap Dress', 'Camisole', 'Cardigan', 'Trench Coat', 'Blouse', 'Jumpsuit', 'Maxi Skirt', 'Slip Dress'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Emerald', hex: '#065f46' }, { name: 'Cream', hex: '#fef9c3' },
      { name: 'Classic Black', hex: '#0a0a0a' }, { name: 'Camel', hex: '#b45309' },
      { name: 'Sage Green', hex: '#86efac' }, { name: 'Ivory', hex: '#f5f5dc' },
      { name: 'Blush Pink', hex: '#fecdd3' }
    ],
    imagePool: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
      'https://images.unsplash.com/photo-1509319117193-57bab727e09d',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91',
      'https://images.unsplash.com/photo-1618220179428-22790b461013',
      'https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5',
      'https://images.unsplash.com/photo-1554412933-514a83d2f3c8',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1'
    ],
    tags: ['women', 'apparel', 'dresses', 'outerwear', 'classic']
  },
  men: {
    adjectives: ['Slim-Fit', 'Structured', 'Merino', 'Linen', 'Oxford', 'Flannel', 'Cashmere', 'Tailored', 'Minimalist', 'Sporty', 'Rugged', 'Smart'],
    materials: ['Turtleneck', 'Chino Pants', 'Dress Shirt', 'Blazer Jacket', 'Wool Sweater', 'Car Coat', 'Polo Shirt', 'Cardigan', 'Trench', 'Suit Jacket'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Navy Blue', hex: '#1e3a8a' }, { name: 'Charcoal Grey', hex: '#374151' },
      { name: 'Forest Green', hex: '#14532d' }, { name: 'Sand Beige', hex: '#d4b483' },
      { name: 'Classic Black', hex: '#0a0a0a' }, { name: 'White', hex: '#ffffff' }
    ],
    imagePool: [
      'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      'https://images.unsplash.com/photo-1608234808654-2a8875faa7fd',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8',
      'https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee',
      'https://images.unsplash.com/photo-1561731216-c3a4d99437d5',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf'
    ],
    tags: ['men', 'apparel', 'tailored', 'shirts', 'suiting']
  },
  accessories: {
    adjectives: ['Silk Twill', 'Full-Grain Leather', 'Suede', 'Fine Wool', 'Polarized', 'Cashmere Knit', 'Monogram', 'Signature'],
    materials: ['Scarf', 'Belt', 'Sunglasses', 'Fedora Hat', 'Driving Gloves', 'Bifold Wallet', 'Silk Tie', 'Pocket Square'],
    sizes: ['One Size'],
    colors: [
      { name: 'Tan Leather', hex: '#92400e' }, { name: 'Classic Black', hex: '#0a0a0a' },
      { name: 'Burgundy', hex: '#7f1d1d' }, { name: 'Forest Green', hex: '#065f46' }
    ],
    imagePool: [
      'https://images.unsplash.com/photo-1601924921557-45e6dea0a157',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
      'https://images.unsplash.com/photo-1583292650898-7d2282a76fbf',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0',
      'https://images.unsplash.com/photo-1568252542512-901b51865e61'
    ],
    tags: ['accessories', 'leather', 'details', 'classic']
  },
  footwear: {
    adjectives: ['Handcrafted', 'Full-Grain', 'Suede', 'Calfskin', 'Burnished', 'Nappa', 'Patent Leather', 'Minimalist'],
    materials: ['Oxfords', 'Chelsea Boots', 'Derby Shoes', 'Penny Loafers', 'Stiletto Heels', 'Leather Sandals', 'Ankle Boots'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: [
      { name: 'Cognac', hex: '#7c2d12' }, { name: 'Classic Black', hex: '#0a0a0a' },
      { name: 'Chestnut Brown', hex: '#78350f' }, { name: 'White', hex: '#ffffff' }
    ],
    imagePool: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
      'https://images.unsplash.com/photo-1614252369475-531eba835eb1',
      'https://images.unsplash.com/photo-1549298916-c41d501d3772',
      'https://images.unsplash.com/photo-1535043834123-b1d7fe899c1d',
      'https://images.unsplash.com/photo-1595950653102-2356c914d7c3',
      'https://images.unsplash.com/photo-1512374382531-4be141a59a99'
    ],
    tags: ['footwear', 'shoes', 'leather', 'boots', 'heels']
  },
  bags: {
    adjectives: ['Structured', 'Pebbled Leather', 'Vegan Suede', 'Nappa Leather', 'Crocodile-Embossed', 'Canvas & Leather'],
    materials: ['Tote Bag', 'Crossbody Bag', 'Top-Handle Satchel', 'Duffle Travel Bag', 'Clutch', 'Backpack', 'Hobo Shoulder Bag'],
    sizes: ['One Size'],
    colors: [
      { name: 'Emerald Green', hex: '#065f46' }, { name: 'Black Noir', hex: '#000000' },
      { name: 'Tan Camel', hex: '#b45309' }, { name: 'Ivory Cream', hex: '#f5f5dc' }
    ],
    imagePool: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e',
      'https://images.unsplash.com/photo-1566150905-110824157aa2',
      'https://images.unsplash.com/photo-1584917865442-700df9648b6d',
      'https://images.unsplash.com/photo-1600857544200-b18472870377'
    ],
    tags: ['bags', 'leather', 'travel', 'handbags']
  },
  jewelry: {
    adjectives: ['18K Gold-Plated', 'Sterling Silver', 'Emerald-Cut Malachite', 'Baroque Pearl', 'Rose Gold', 'Diamond-Accented'],
    materials: ['Pendant Necklace', 'Hoop Earrings', 'Signet Ring', 'Tennis Bracelet', 'Choker Chain', 'Drop Earrings', 'Bangle Cuff'],
    sizes: ['One Size'],
    colors: [
      { name: 'Polished Gold', hex: '#ca8a04' }, { name: 'Sterling Silver', hex: '#9ca3af' },
      { name: 'Rose Gold', hex: '#fda4af' }
    ],
    imagePool: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e',
      'https://images.unsplash.com/photo-1611591437289-055479040aa9',
      'https://images.unsplash.com/photo-1598560917505-e3621415df8e'
    ],
    tags: ['jewelry', 'gold', 'silver', 'pearls', 'gemstones']
  }
};

const generateProducts = () => {
  const list = [];
  const nameTracker = new Set();

  for (const [cat, config] of Object.entries(CATEGORIES_DATA)) {
    let count = 0;
    
    // We want approximately 100 products per category
    for (let i = 0; i < 100; i++) {
      const adj = config.adjectives[i % config.adjectives.length];
      const mat = config.materials[(i + 3) % config.materials.length];
      const brand = BRANDS[(i + 7) % BRANDS.length];
      
      // Let's create a unique product name
      let name = `${adj} ${mat}`;
      // In case of duplicates, append a unique specifier
      if (nameTracker.has(name)) {
        const extra = ['Classic', 'Luxe', 'Heritage', 'Minimalist', 'Signature', 'Timeless', 'Urban', 'Elite', 'Vanguard', 'Reserve'][Math.floor(i / config.adjectives.length) % 10];
        name = `${extra} ${name}`;
      }
      nameTracker.add(name);

      const indexStr = String(count + 1).padStart(3, '0');
      const sku = `EM-${cat[0].toUpperCase()}-${indexStr}`;
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cat}-${indexStr}`;

      const shortDescription = `A premium quality ${name.toLowerCase()} designed by ${brand}, showcasing true luxury.`;
      const description = `Indulge in the finest craftsmanship with the ${name} from ${brand}. Exquisitely finished to showcase a polished style, this piece blends timeless fashion principles with modern design details. Created using high-quality materials and constructed to ensure outstanding comfort and longevity. A must-have addition to any sophisticated wardrobe.`;

      // Price ranges vary per category to be premium and realistic
      let basePrice = 120;
      if (cat === 'women') basePrice = 180 + (i * 12) % 450;
      else if (cat === 'men') basePrice = 140 + (i * 9) % 350;
      else if (cat === 'footwear') basePrice = 200 + (i * 15) % 400;
      else if (cat === 'bags') basePrice = 250 + (i * 20) % 600;
      else if (cat === 'jewelry') basePrice = 85 + (i * 8) % 300;
      else basePrice = 65 + (i * 5) % 150; // accessories

      const onSale = (i % 7 === 0);
      const salePrice = onSale ? Math.floor(basePrice * 0.8) : null;
      const newArrival = (i % 5 === 0);
      const featured = (i % 8 === 0);
      const bestSeller = (i % 6 === 0);

      const rating = parseFloat((4.2 + (i % 9) * 0.1).toFixed(1));
      const numReviews = 5 + (i * 3) % 95;

      // Select multiple images (2 to 3 per product)
      const images = [];
      const imageCount = 2 + (i % 2); // alternating 2 or 3 images
      for (let j = 0; j < imageCount; j++) {
        const poolIndex = (i + j * 3) % config.imagePool.length;
        const baseUrl = config.imagePool[poolIndex];
        // Append query parameter to ensure uniqueness if needed or just use multiple from pool
        images.push({
          url: `${baseUrl}?w=600&auto=format&fit=crop&q=80&sig=${sku}-${j}`,
          alt: `${name} View ${j + 1}`
        });
      }

      // Sizes where applicable (accessories, bags, jewelry usually One Size)
      let productSizes = ['One Size'];
      if (['women', 'men', 'footwear'].includes(cat)) {
        const sizeStart = i % 3;
        productSizes = config.sizes.slice(sizeStart, sizeStart + 3 + (i % 2));
      }

      // Colors
      const colorStart = i % config.colors.length;
      const productColors = config.colors.slice(colorStart, colorStart + 2 + (i % 2));
      if (productColors.length === 0) productColors.push(config.colors[0]);

      const stock = Math.floor(10 + (i * 11) % 90);
      const tags = [...config.tags, adj.toLowerCase(), brand.toLowerCase().split(' ')[0]];

      list.push({
        name,
        slug,
        description,
        shortDescription,
        price: basePrice,
        salePrice,
        category: cat,
        brand,
        tags,
        images,
        sizes: productSizes,
        colors: productColors,
        stock,
        sku,
        featured,
        newArrival,
        bestSeller,
        onSale,
        rating,
        numReviews,
        reviews: []
      });

      count++;
    }
  }
  return list;
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('\n❌ STOP: MONGODB_URI env variable is not set!\n');
    process.exit(1);
  }
  try {
    const dns = require('dns');
    try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) { /* ignore */ }
    
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ Connected to MongoDB Atlas');
    
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');
    
    const products = generateProducts();
    const created = await Product.insertMany(products);
    console.log(`\n✅ Successfully seeded ${created.length} products! (100 per category)\n`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch(err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
