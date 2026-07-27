const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Guest orders allowed (no account needed)
  guestEmail: { type: String },
  orderNumber: { type: String, unique: true },

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    size: String,
    color: String,
    quantity: { type: Number, default: 1 },
    shopifyVariantId: String
  }],

  shippingAddress: {
    fullName: String, street: String, city: String,
    state: String, zip: String, country: String, phone: String
  },

  payment: {
    method: { type: String, default: 'stripe' },
    stripePaymentIntentId: String,
    status: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
    paidAt: Date
  },

  subtotal: Number,
  shippingCost: { type: Number, default: 0 },
  tax: Number,
  total: Number,

  status: {
    type: String,
    enum: ['pending','processing','shipped','delivered','cancelled'],
    default: 'pending'
  },
  trackingNumber: String,
  notes: String,

  // Dropshipping order forwarding (Shopify -> DSers -> supplier)
  shopifyOrderId: String,
  shopifyOrderNumber: String,
  shopifyPushStatus: { type: String, enum: ['pending', 'pushed', 'failed'], default: 'pending' },
  shopifyPushError: String,
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate order number like EM-20240115-0001
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `EM-${date}-${String(count + 1).padStart(4,'0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
