const mongoose = require('mongoose');
const Product = require('../models/Product');
const { fetchAllProducts } = require('../services/shopify');

// Core sync logic — reusable both by the CLI entrypoint below (one-off/manual
// run, own DB connection) and by the cron job in server.js (reuses the
// already-open connection, no process.exit).
async function syncShopifyProducts() {
  console.log('Fetching products from Shopify...');
  const shopifyProducts = await fetchAllProducts();
  console.log(`Fetched ${shopifyProducts.length} products from Shopify`);

  const seenIds = [];
  let created = 0, updated = 0;

  for (const p of shopifyProducts) {
    const res = await Product.updateOne(
      { shopifyProductId: p.shopifyProductId },
      { $set: p },
      { upsert: true }
    );
    if (res.upsertedCount) created++; else updated++;
    seenIds.push(p.shopifyProductId);
  }

  // Zero out stock for any previously-synced Shopify product no longer returned
  // (removed/unpublished on Shopify's side) instead of deleting order history refs.
  const staleRes = await Product.updateMany(
    { source: 'shopify', shopifyProductId: { $nin: seenIds } },
    { $set: { stock: 0 } }
  );

  console.log(`Created: ${created}, Updated: ${updated}, Marked out-of-stock (no longer in Shopify): ${staleRes.modifiedCount}`);
  return { created, updated, staleCount: staleRes.modifiedCount };
}

// CLI entrypoint: `node backend/scripts/syncShopifyProducts.js` — opens its own
// DB connection and exits when done. Not used when imported by server.js.
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
  (async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) { console.error('MONGODB_URI missing'); process.exit(1); }
    const dns = require('dns');
    try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB Atlas');
    try {
      await syncShopifyProducts();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('Sync failed:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = { syncShopifyProducts };
