require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Verified (HTTP 200) Unsplash photo IDs, grouped by concrete product subtype.
const POOLS = {
  ring: ['1587467512961-120760940315', '1605100804763-247f67b3557e', '1611652022419-a9419f74343d'],
  necklace: ['1535632066927-ab7c9ab60908', '1573408301185-9146fe634ad0', '1599643478518-a784e5dc4c8f'],
  earrings: ['1524638431109-93d95c968f03', '1535632066927-ab7c9ab60908', '1587467512961-120760940315', '1615655406736-b37c4fabf923'],
  bracelet: ['1599643478518-a784e5dc4c8f', '1611652022419-a9419f74343d'],

  totebag: ['1590874103328-eac38a683ce7', '1591561954557-26941169b49e'],
  crossbody: ['1548036328-c9fa89d128fa', '1548863227-3af567fc3b27', '1553062407-98eeb64c6a62', '1560343090-f0409e92791a'],
  backpack: ['1548863227-3af567fc3b27', '1553062407-98eeb64c6a62', '1622560480605-d83c853bc5c3'],
  bag: ['1548036328-c9fa89d128fa', '1548863227-3af567fc3b27', '1553062407-98eeb64c6a62', '1560343090-f0409e92791a', '1576566588028-4147f3842f27', '1590874103328-eac38a683ce7', '1591561954557-26941169b49e', '1614179689702-355944cd0918'],

  boots: ['1520639888713-7851133b1ed0', '1638247025967-b4e38f787b76'],
  heels: ['1543163521-1bf539c55dd2', '1596703263926-eb0762ee17e4'],
  loafers: ['1533867617858-e7b97e060509'],
  sneakers: ['1542291026-7eec264c27ff', '1595341888016-a392ef81b7de'],
  shoes: ['1518894781321-630e638d0742', '1520256862855-398228c41684', '1542291026-7eec264c27ff', '1543163521-1bf539c55dd2', '1560769629-975ec94e6a86', '1595341888016-a392ef81b7de', '1600185365483-26d7a4cc7519', '1614252369475-531eba835eb1'],

  scarf: ['1520903920243-00d872a2d1c9', '1601924921557-45e6dea0a157'],
  belt: ['1553062407-98eeb64c6a62', '1591561954557-26941169b49e'],
  sunglasses: ['1473496169904-658ba7c44d8a', '1511499767150-a48a237f0083', '1572635196237-14b3f281503f'],
  hat: ['1521369909029-2afed882baee', '1533055640609-24b498dfd74c'],
  gloves: ['1516762689617-e1cffcef479d', '1544923246-77307dd654cb', '1607346256330-dee7af15f7c5'],
  wallet: ['1553062407-98eeb64c6a62', '1627123424574-724758594e93'],
  tie: ['1507679799987-c73779587ccf', '1589756823695-278bc923f962'],

  women: ['1445205170230-053b83016050', '1483985988355-763728e1935b', '1487222477894-8943e31ef7b2', '1490481651871-ab68de25d43d', '1494790108377-be9c29b29330', '1503342217505-b0a15ec3261c', '1508214751196-bcfd4ca60f91', '1509319117193-57bab727e09d', '1509631179647-0177331693ae', '1515886657613-9f3515b0c78f', '1524504388940-b1c1722653e1', '1529139574466-a303027c1d8b', '1539109136881-3be0616acf4b', '1544022613-e87ca75a784a', '1550639525-c97d455acf70', '1554412933-514a83d2f3c8', '1566207274740-0f8cf6b7d5a5', '1618220179428-22790b461013'],
  men: ['1490578474895-699cd4e2cf59', '1500648767791-00dcc994a43e', '1505678261036-a3fcc5e884ee', '1507003211169-0a1dd7228f2d', '1516257984-b1b4d707412e', '1519085360753-af0119f7cbe7', '1520975916090-3105956dac38', '1552374196-1ab2a1c593e8', '1561731216-c3a4d99437d5', '1594938298603-c8148c4dae35', '1602810318383-e386cc2a3ccf', '1608234808654-2a8875faa7fd', '1617137968427-85924c800a22', '1624378439575-d8705ad7ae80'],
};

// Map each category's "material" keyword (from the product name) to a pool key.
const MATERIAL_TO_POOL = {
  // jewelry
  'Pendant Necklace': 'necklace', 'Choker Chain': 'necklace',
  'Hoop Earrings': 'earrings', 'Drop Earrings': 'earrings',
  'Signet Ring': 'ring',
  'Tennis Bracelet': 'bracelet', 'Bangle Cuff': 'bracelet',
  // bags
  'Tote Bag': 'totebag',
  'Crossbody Bag': 'crossbody',
  'Backpack': 'backpack',
  'Top-Handle Satchel': 'bag', 'Duffle Travel Bag': 'bag', 'Clutch': 'bag', 'Hobo Shoulder Bag': 'bag',
  // footwear
  'Oxfords': 'shoes', 'Derby Shoes': 'shoes', 'Leather Sandals': 'shoes',
  'Chelsea Boots': 'boots', 'Ankle Boots': 'boots',
  'Penny Loafers': 'loafers',
  'Stiletto Heels': 'heels',
  // accessories
  'Scarf': 'scarf', 'Pocket Square': 'scarf',
  'Belt': 'belt',
  'Sunglasses': 'sunglasses',
  'Fedora Hat': 'hat',
  'Driving Gloves': 'gloves',
  'Bifold Wallet': 'wallet',
  'Silk Tie': 'tie',
};

function poolKeyFor(product) {
  for (const [material, key] of Object.entries(MATERIAL_TO_POOL)) {
    if (product.name.includes(material)) return key;
  }
  if (product.category === 'women') return 'women';
  if (product.category === 'men') return 'men';
  return null;
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI missing'); process.exit(1); }
  const dns = require('dns');
  try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('Connected to MongoDB Atlas');

  const products = await Product.find({});
  console.log('Loaded', products.length, 'products');

  let updated = 0;
  const skipped = [];
  const ops = [];

  for (const p of products) {
    const key = poolKeyFor(p);
    if (!key || !POOLS[key] || POOLS[key].length === 0) {
      skipped.push(p.name);
      continue;
    }
    const pool = POOLS[key];
    const existingCount = Array.isArray(p.images) ? p.images.length : 2;
    const desiredCount = Math.max(2, Math.min(3, existingCount || 2));
    const imageCount = Math.max(1, Math.min(desiredCount, pool.length));
    const images = [];
    for (let j = 0; j < imageCount; j++) {
      const photoId = pool[(j + (p.sku ? p.sku.charCodeAt(p.sku.length - 1) : j)) % pool.length];
      images.push({
        url: `https://images.unsplash.com/photo-${photoId}?w=600&auto=format&fit=crop&q=80&sig=${p.sku}-${j}`,
        alt: `${p.name} View ${j + 1}`
      });
    }
    ops.push({ updateOne: { filter: { _id: p._id }, update: { $set: { images } } } });
    updated++;
  }

  if (ops.length) {
    const res = await Product.bulkWrite(ops);
    console.log('Bulk write result:', res.modifiedCount, 'modified');
  }

  console.log('Updated:', updated, '/ Skipped:', skipped.length);
  if (skipped.length) console.log('Skipped products (no pool match):', skipped.slice(0, 20));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
