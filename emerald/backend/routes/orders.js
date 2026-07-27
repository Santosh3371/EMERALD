const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', async (req, res) => {
  if (!global.DB_CONNECTED) return res.status(503).json({ message: 'Database not connected. Please set your MongoDB password in .env to enable orders.' });
  try {
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { items, shippingAddress, guestEmail, userId } = req.body;
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
      const price = product.salePrice || product.price;
      subtotal += price * item.quantity;
      orderItems.push({ product: product._id, name: product.name, image: product.images[0]?.url || '', price, size: item.size, color: item.color, quantity: item.quantity });
    }
    const shippingCost = subtotal >= 100 ? 0 : 9.99;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));
    const paymentIntent = await stripe.paymentIntents.create({ amount: Math.round(total * 100), currency: 'usd', metadata: { store: 'EMERALD' } });
    const order = await Order.create({ user: userId || undefined, guestEmail: guestEmail || undefined, items: orderItems, shippingAddress, payment: { stripePaymentIntentId: paymentIntent.id }, subtotal, shippingCost, tax, total });
    res.status(201).json({ orderId: order._id, orderNumber: order.orderNumber, clientSecret: paymentIntent.client_secret, total });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/confirm', async (req, res) => {
  if (!global.DB_CONNECTED) return res.status(503).json({ message: 'Database not connected' });
  try {
    const Order = require('../models/Order');
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { paymentIntentId } = req.body;
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') return res.status(400).json({ message: 'Payment not completed' });
    const order = await Order.findByIdAndUpdate(req.params.id, { 'payment.status': 'paid', 'payment.paidAt': new Date(), status: 'processing' }, { new: true });

    res.json({ message: 'Order confirmed', order });

    // Forward to Shopify (so DSers picks it up for supplier fulfillment) after
    // responding to the customer — a Shopify-side failure must never block payment confirmation.
    pushOrderToShopify(order).catch(() => {});
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Best-effort: attach each order item's shopifyVariantId (by matching size+color
// against the product's synced variants) and push the order into Shopify.
async function pushOrderToShopify(order) {
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) return;
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  const { createShopifyOrder } = require('../services/shopify');

  try {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      const variant = product?.variants?.find(v => v.size === item.size && v.color === item.color) || product?.variants?.[0];
      if (variant) item.shopifyVariantId = variant.shopifyVariantId;
    }

    const shopifyOrder = await createShopifyOrder(order);
    await Order.findByIdAndUpdate(order._id, {
      items: order.items,
      shopifyOrderId: String(shopifyOrder.id),
      shopifyOrderNumber: shopifyOrder.name,
      shopifyPushStatus: 'pushed'
    });
  } catch (err) {
    console.error(`Shopify push failed for order ${order.orderNumber}:`, err.message);
    await Order.findByIdAndUpdate(order._id, { shopifyPushStatus: 'failed', shopifyPushError: err.message });
  }
}

router.get('/my', protect, async (req, res) => {
  if (!global.DB_CONNECTED) return res.json([]);
  try {
    const Order = require('../models/Order');
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  if (!global.DB_CONNECTED) return res.status(503).json({ message: 'Database not connected' });
  try {
    const Order = require('../models/Order');
    const order = await Order.findById(req.params.id).populate('items.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/', protect, adminOnly, async (req, res) => {
  if (!global.DB_CONNECTED) return res.json([]);
  try {
    const Order = require('../models/Order');
    const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
    res.json(orders);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
