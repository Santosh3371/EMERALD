require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, description: String,
  shortDescription: String, price: Number, salePrice: { type: Number, default: null },
  category: String, tags: [String],
  images: [{ url: String, alt: String }],
  sizes: [String], colors: [{ name: String, hex: String }],
  stock: Number, sku: { type: String, unique: true },
  featured: Boolean, newArrival: Boolean, onSale: Boolean,
  rating: { type: Number, default: 0 }, numReviews: { type: Number, default: 0 },
  reviews: { type: Array, default: [] }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const categoriesConfig = {
  women: {
    adjectives: ['Classic', 'Elegant', 'Vintage', 'Modern', 'Boho', 'Chic', 'Tailored', 'Minimalist', 'Romantic', 'Structured', 'Sleek', 'Relaxed', 'Luxury', 'Casual', 'Draped', 'Flowing'],
    materials: ['Silk', 'Linen', 'Crepe', 'Cashmere', 'Satin', 'Cotton', 'Wool', 'Velvet', 'Lace', 'Chiffon', 'Denim', 'Knit'],
    nouns: ['Gown', 'Blazer', 'Trousers', 'Cardigan', 'Dress', 'Skirt', 'Blouse', 'Jumpsuit', 'Camisole', 'Trench Coat', 'Sweater', 'Kimono'],
    tags: ['evening', 'formal', 'casual', 'party', 'luxury', 'women', 'apparel'],
    images: ['women_1.jpg', 'women_2.jpg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Emerald', hex: '#065f46' }, { name: 'Forest', hex: '#14532d' },
      { name: 'Cream', hex: '#fef9c3' }, { name: 'Black', hex: '#0a0a0a' },
      { name: 'Camel', hex: '#b45309' }, { name: 'Ivory', hex: '#f5f5dc' },
      { name: 'Sage', hex: '#4d7c0f' }
    ]
  },
  men: {
    adjectives: ['Classic', 'Tailored', 'Slim-Fit', 'Relaxed', 'Modern', 'Vintage', 'Smart', 'Casual', 'Rugged', 'Sleek', 'Luxury', 'Minimalist', 'Structured', 'Athletic'],
    materials: ['Merino', 'Linen', 'Cotton', 'Wool', 'Denim', 'Oxford', 'Flannel', 'Cashmere', 'Suede', 'Leather', 'Chino', 'Gabardine'],
    nouns: ['Turtleneck', 'Chino', 'Shirt', 'Blazer', 'Sweater', 'Jacket', 'Pants', 'Polo', 'T-Shirt', 'Coat', 'Cardigan', 'Vest'],
    tags: ['men', 'apparel', 'formal', 'casual', 'everyday', 'knitwear'],
    images: ['men_1.jpg', 'men_2.jpg'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Forest Green', hex: '#166534' }, { name: 'Charcoal', hex: '#374151' },
      { name: 'Khaki', hex: '#a3834a' }, { name: 'Navy', hex: '#1e3a5f' },
      { name: 'Olive', hex: '#3d4a1e' }, { name: 'White', hex: '#f9fafb' },
      { name: 'Sage', hex: '#4d7c0f' }, { name: 'Sand', hex: '#d4b483' }
    ]
  },
  accessories: {
    adjectives: ['Elegant', 'Classic', 'Minimalist', 'Vintage', 'Modern', 'Handcrafted', 'Sleek', 'Luxury', 'Fine', 'Boho', 'Signature', 'Urban'],
    materials: ['Silk', 'Leather', 'Suede', 'Cashmere', 'Wool', 'Canvas', 'Metal', 'Velvet'],
    nouns: ['Scarf', 'Belt', 'Sunglasses', 'Hat', 'Gloves', 'Wallet', 'Tie', 'Pocket Square', 'Umbrella', 'Keyring'],
    tags: ['accessories', 'details', 'everyday', 'style', 'gift'],
    images: ['accessories_1.jpg', 'accessories_2.jpg'],
    sizes: ['One Size'],
    colors: [
      { name: 'Emerald', hex: '#065f46' }, { name: 'Tan', hex: '#92400e' },
      { name: 'Black', hex: '#0a0a0a' }, { name: 'Gold', hex: '#ca8a04' },
      { name: 'Silver', hex: '#9ca3af' }
    ]
  },
  footwear: {
    adjectives: ['Classic', 'Handcrafted', 'Sleek', 'Modern', 'Vintage', 'Rugged', 'Sporty', 'Elegant', 'Chic', 'Comfort', 'Ergonomic'],
    materials: ['Leather', 'Suede', 'Canvas', 'Velvet', 'Nappa', 'Nubuck', 'Calfskin'],
    nouns: ['Oxfords', 'Chelsea Boots', 'Sneakers', 'Heels', 'Loafers', 'Sandals', 'Derbies', 'Ankle Boots', 'Mules', 'Brogues'],
    tags: ['shoes', 'footwear', 'casual', 'formal', 'leather'],
    images: ['footwear_1.jpg', 'footwear_2.jpg'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: [
      { name: 'Tan', hex: '#92400e' }, { name: 'Black', hex: '#0a0a0a' },
      { name: 'Cognac', hex: '#7c3519' }, { name: 'Forest', hex: '#14532d' },
      { name: 'White', hex: '#f9fafb' }, { name: 'Brown', hex: '#78350f' }
    ]
  },
  bags: {
    adjectives: ['Structured', 'Mini', 'Spacious', 'Elegant', 'Classic', 'Casual', 'Sleek', 'Utility', 'Luxury', 'Vintage', 'Compact'],
    materials: ['Leather', 'Suede', 'Canvas', 'Nappa', 'Pebbled Leather', 'Vegan Leather'],
    nouns: ['Tote Bag', 'Crossbody Bag', 'Handbag', 'Backpack', 'Clutch', 'Duffle Bag', 'Satchel', 'Messenger Bag', 'Shoulder Bag', 'Hobo Bag'],
    tags: ['bags', 'travel', 'work', 'everyday', 'leather'],
    images: ['bags_1.jpg', 'bags_2.jpg'],
    sizes: ['One Size'],
    colors: [
      { name: 'Emerald', hex: '#065f46' }, { name: 'Black', hex: '#0a0a0a' },
      { name: 'Camel', hex: '#b45309' }, { name: 'Forest Green', hex: '#166534' },
      { name: 'Gold', hex: '#ca8a04' }, { name: 'Ivory', hex: '#f5f5dc' }
    ]
  },
  jewelry: {
    adjectives: ['Delicate', 'Sculptural', 'Geometric', 'Classic', 'Minimalist', 'Statement', 'Vintage', 'Elegant', 'Modern', 'Artisanal', 'Dainty'],
    materials: ['Gold-Plated', 'Sterling Silver', 'Emerald', 'Malachite', 'Pearl', 'Diamond-Cut', 'Rose Gold', 'Sapphire'],
    nouns: ['Necklace', 'Earrings', 'Ring', 'Bracelet', 'Pendant', 'Choker', 'Bangle', 'Cuff', 'Studs', 'Anklet'],
    tags: ['jewelry', 'gold', 'silver', 'gemstone', 'accessory'],
    images: ['jewelry_1.jpg', 'jewelry_2.jpg'],
    sizes: ['One Size'],
    colors: [
      { name: 'Gold', hex: '#ca8a04' }, { name: 'Silver', hex: '#9ca3af' },
      { name: 'Rose Gold', hex: '#fda4af' }, { name: 'Gold/Emerald', hex: '#ca8a04' },
      { name: 'Gold/Green', hex: '#365314' }
    ]
  }
};

const generateProducts = () => {
  const list = [];
  for (const [cat, config] of Object.entries(categoriesConfig)) {
    let count = 0;
    for (let a = 0; a < config.adjectives.length; a++) {
      for (let m = 0; m < config.materials.length; m++) {
        for (let n = 0; n < config.nouns.length; n++) {
          if (count >= 100) break;

          const adj = config.adjectives[a];
          const mat = config.materials[m];
          const noun = config.nouns[n];

          const name = `${adj} ${mat} ${noun}`;
          const indexStr = String(count + 1).padStart(3, '0');
          const sku = `EM-${cat[0].toUpperCase()}-${indexStr}`;
          const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cat}-${indexStr}`;

          const shortDescription = `${adj} ${noun} crafted from premium ${mat.toLowerCase()}.`;
          const description = `The ${name} is an exquisite addition to your wardrobe. Built with meticulous attention to detail, this piece features high-quality ${mat.toLowerCase()} and a design that balances modern sensibilities with classic charm. Perfect for daily wear or special events, ensuring both comfort and premium style.`;

          // Generate price dynamically using combinations to stay consistent
          const price = Math.floor(45 + (a * 7 + m * 5 + n * 3) % 400);
          const onSale = (count % 7 === 0);
          const salePrice = onSale ? Math.floor(price * 0.8) : null;
          const newArrival = (count % 5 === 0);
          const featured = (count % 8 === 0);

          const rating = parseFloat((4.0 + ((a + m + n) % 11) * 0.1).toFixed(1));
          const numReviews = (a * 3 + m * 2 + n) % 50;

          const imageId = config.images[(a + m + n) % config.images.length];
          const imageUrl = `/images/products/${imageId}`;

          const sizeCount = (count % 3) + 2;
          const productSizes = config.sizes.slice(0, sizeCount);

          const colorCount = (count % 2) + 2;
          const productColors = [];
          for (let c = 0; c < colorCount; c++) {
            productColors.push(config.colors[(a + m + n + c) % config.colors.length]);
          }

          const stock = Math.floor(15 + (a * m + n) % 85);
          const tags = [...config.tags, adj.toLowerCase(), mat.toLowerCase(), noun.toLowerCase()];

          list.push({
            name,
            slug,
            description,
            shortDescription,
            price,
            salePrice,
            category: cat,
            tags,
            images: [{ url: imageUrl, alt: name }],
            sizes: productSizes,
            colors: productColors,
            stock,
            sku,
            featured,
            newArrival,
            onSale,
            rating,
            numReviews,
            reviews: []
          });

          count++;
        }
        if (count >= 100) break;
      }
      if (count >= 100) break;
    }
  }
  return list;
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('YOUR_PASSWORD_HERE')) {
    console.log('\n❌ STOP: You need to set your MongoDB password first!');
    console.log('   Open .env and replace YOUR_PASSWORD_HERE with your actual password\n');
    process.exit(1);
  }
  try {
    const dns = require('dns');
    try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) { /* ignore */ }
    
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
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
