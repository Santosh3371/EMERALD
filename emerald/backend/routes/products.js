const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Product = require('../models/Product');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, size, sort, search, featured, newArrival, bestSeller, onSale, limit = 12, page = 1 } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (featured === 'true' || featured === true) query.featured = true;
    if (newArrival === 'true' || newArrival === true) query.newArrival = true;
    if (bestSeller === 'true' || bestSeller === true) query.bestSeller = true;
    if (onSale === 'true' || onSale === true) query.onSale = true;
    if (size) query.sizes = { $in: [size] };
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOption).limit(Number(limit)).skip(skip);
    
    res.json({ products, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });
    
    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.calcAverageRating();
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin routes
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
