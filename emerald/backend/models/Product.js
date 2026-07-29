const mongoose = require('mongoose');

// Review sub-schema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Main product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, default: null },
  // Free-text so Shopify's product_type/tags can map in without being constrained
  // to the original 6-value demo-data enum. mapShopifyProduct() in services/shopify.js
  // maps unrecognized Shopify types to 'accessories' as a fallback.
  category: { type: String, required: true, default: 'accessories', trim: true },
  brand: { type: String, required: true, trim: true },
  tags: [String],
  images: [{ url: String, alt: String }],
  sizes: [String],
  colors: [{ name: String, hex: String }],
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true },
  // Dropshipping/Shopify sourcing
  source: { type: String, enum: ['manual', 'shopify'], default: 'manual' },
  shopifyProductId: { type: String, unique: true, sparse: true },
  shopifyHandle: String,
  // Per-variant data so an order line (size+color) can be traced back to the
  // exact Shopify variant when forwarding the order for supplier fulfillment.
  variants: [{
    shopifyVariantId: String,
    sku: String,
    size: String,
    color: String,
    price: Number,
    stock: Number
  }],
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  onSale: { type: Boolean, default: false },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate average rating when reviews change
productSchema.methods.calcAverageRating = function() {
  if (this.reviews.length === 0) { this.rating = 0; this.numReviews = 0; return; }
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  this.rating = (sum / this.reviews.length).toFixed(1);
  this.numReviews = this.reviews.length;
};

module.exports = mongoose.model('Product', productSchema);
