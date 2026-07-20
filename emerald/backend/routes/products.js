const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

// ── DEMO PRODUCTS (shown when MongoDB not yet connected) ──────────────────────
const DEMO_PRODUCTS = [
  { _id:'demo1', name:'Emerald Silk Evening Gown', slug:'emerald-silk-evening-gown', shortDescription:'Luxurious silk evening gown in signature emerald green', price:289, salePrice:null, category:'women', images:[{url:'https://images.unsplash.com/photo-1595777707802-62b909f9e237?w=600',alt:'Gown'}], sizes:['XS','S','M','L','XL'], colors:[{name:'Emerald',hex:'#065f46'}], stock:25, sku:'EM-W001', featured:true, newArrival:true, onSale:false, rating:4.8, numReviews:24 },
  { _id:'demo2', name:'Classic Linen Blazer', slug:'classic-linen-blazer', shortDescription:'Structured linen blazer for a polished everyday look', price:185, salePrice:148, category:'women', images:[{url:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',alt:'Blazer'}], sizes:['XS','S','M','L','XL','XXL'], colors:[{name:'Forest',hex:'#14532d'},{name:'Cream',hex:'#fef9c3'}], stock:40, sku:'EM-W002', featured:true, newArrival:false, onSale:true, rating:4.6, numReviews:18 },
  { _id:'demo3', name:'Wide-Leg Palazzo Trousers', slug:'wide-leg-palazzo-trousers', shortDescription:'High-waisted crepe palazzo trousers', price:120, salePrice:null, category:'women', images:[{url:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600',alt:'Trousers'}], sizes:['XS','S','M','L','XL'], colors:[{name:'Emerald',hex:'#065f46'},{name:'Black',hex:'#0a0a0a'}], stock:50, sku:'EM-W003', featured:false, newArrival:true, onSale:false, rating:4.5, numReviews:11 },
  { _id:'demo4', name:"Men's Merino Turtleneck", slug:'mens-merino-turtleneck', shortDescription:'100% extra-fine merino wool slim turtleneck', price:145, salePrice:null, category:'men', images:[{url:'https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?w=600',alt:'Turtleneck'}], sizes:['S','M','L','XL','XXL'], colors:[{name:'Forest Green',hex:'#166534'},{name:'Charcoal',hex:'#374151'}], stock:60, sku:'EM-M001', featured:true, newArrival:false, onSale:false, rating:4.9, numReviews:32 },
  { _id:'demo5', name:'Slim-Fit Chino Trousers', slug:'slim-fit-chino-trousers', shortDescription:'Premium cotton-stretch slim-fit chinos', price:98, salePrice:78, category:'men', images:[{url:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',alt:'Chinos'}], sizes:['S','M','L','XL','XXL'], colors:[{name:'Khaki',hex:'#a3834a'},{name:'Navy',hex:'#1e3a5f'}], stock:80, sku:'EM-M002', featured:false, newArrival:false, onSale:true, rating:4.4, numReviews:15 },
  { _id:'demo6', name:'Leather Oxford Dress Shoes', slug:'leather-oxford-dress-shoes', shortDescription:'Handcrafted full-grain leather cap-toe Oxfords', price:320, salePrice:null, category:'footwear', images:[{url:'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600',alt:'Oxfords'}], sizes:['S','M','L','XL'], colors:[{name:'Tan',hex:'#92400e'},{name:'Black',hex:'#0a0a0a'}], stock:30, sku:'EM-F001', featured:true, newArrival:false, onSale:false, rating:4.9, numReviews:41 },
  { _id:'demo7', name:'Suede Chelsea Boots', slug:'suede-chelsea-boots', shortDescription:'Premium suede pointed-toe Chelsea boots', price:245, salePrice:196, category:'footwear', images:[{url:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600',alt:'Boots'}], sizes:['XS','S','M','L','XL'], colors:[{name:'Cognac',hex:'#7c3519'},{name:'Forest',hex:'#14532d'}], stock:35, sku:'EM-F002', featured:true, newArrival:true, onSale:true, rating:4.7, numReviews:28 },
  { _id:'demo8', name:'Structured Leather Tote Bag', slug:'structured-leather-tote-bag', shortDescription:'Pebbled leather tote with laptop compartment', price:375, salePrice:null, category:'bags', images:[{url:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',alt:'Tote'}], sizes:['One Size'], colors:[{name:'Emerald',hex:'#065f46'},{name:'Black',hex:'#0a0a0a'},{name:'Camel',hex:'#b45309'}], stock:20, sku:'EM-B001', featured:true, newArrival:false, onSale:false, rating:5.0, numReviews:19 },
  { _id:'demo9', name:'Mini Crossbody Bag', slug:'mini-crossbody-bag', shortDescription:'Nappa leather mini crossbody with chain strap', price:195, salePrice:156, category:'bags', images:[{url:'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600',alt:'Crossbody'}], sizes:['One Size'], colors:[{name:'Forest Green',hex:'#166534'},{name:'Gold',hex:'#ca8a04'}], stock:45, sku:'EM-B002', featured:false, newArrival:true, onSale:true, rating:4.6, numReviews:22 },
  { _id:'demo10', name:'Diamond-Cut Gold Necklace', slug:'diamond-cut-gold-necklace', shortDescription:'18K gold-plated chain with emerald pendant', price:89, salePrice:null, category:'jewelry', images:[{url:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',alt:'Necklace'}], sizes:['One Size'], colors:[{name:'Gold/Emerald',hex:'#ca8a04'}], stock:70, sku:'EM-J001', featured:true, newArrival:true, onSale:false, rating:4.8, numReviews:36 },
  { _id:'demo11', name:'Sculptural Statement Earrings', slug:'sculptural-statement-earrings', shortDescription:'Geometric malachite drop earrings in gold', price:72, salePrice:58, category:'jewelry', images:[{url:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',alt:'Earrings'}], sizes:['One Size'], colors:[{name:'Gold/Green',hex:'#365314'}], stock:55, sku:'EM-J002', featured:false, newArrival:true, onSale:true, rating:4.5, numReviews:14 },
  { _id:'demo12', name:'Cashmere Wrap Cardigan', slug:'cashmere-wrap-cardigan', shortDescription:'Pure cashmere open-front wrap cardigan', price:310, salePrice:null, category:'women', images:[{url:'https://images.unsplash.com/photo-1624206112918-f140f087f9b5?w=600',alt:'Cardigan'}], sizes:['XS','S','M','L','XL'], colors:[{name:'Camel',hex:'#b45309'},{name:'Sage',hex:'#4d7c0f'}], stock:30, sku:'EM-W004', featured:true, newArrival:false, onSale:false, rating:4.9, numReviews:27 },
  { _id:'demo13', name:"Men's Linen Shirt", slug:'mens-linen-shirt', shortDescription:'Relaxed stonewashed 100% linen shirt', price:88, salePrice:null, category:'men', images:[{url:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',alt:'Linen Shirt'}], sizes:['S','M','L','XL','XXL'], colors:[{name:'White',hex:'#f9fafb'},{name:'Sage',hex:'#4d7c0f'}], stock:65, sku:'EM-M003', featured:false, newArrival:true, onSale:false, rating:4.3, numReviews:9 },
  { _id:'demo14', name:'Silk Scarf', slug:'silk-scarf', shortDescription:'90x90cm pure silk twill with EMERALD print', price:145, salePrice:116, category:'accessories', images:[{url:'https://images.unsplash.com/photo-1601924921557-45e6dea0a157?w=600',alt:'Scarf'}], sizes:['One Size'], colors:[{name:'Emerald Floral',hex:'#065f46'}], stock:40, sku:'EM-A001', featured:false, newArrival:true, onSale:true, rating:4.7, numReviews:13 },
  { _id:'demo15', name:'Leather Belt', slug:'leather-belt', shortDescription:'Full-grain Italian leather belt with gold buckle', price:95, salePrice:null, category:'accessories', images:[{url:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',alt:'Belt'}], sizes:['S','M','L','XL'], colors:[{name:'Tan',hex:'#92400e'},{name:'Black',hex:'#0a0a0a'}], stock:90, sku:'EM-A002', featured:false, newArrival:false, onSale:false, rating:4.4, numReviews:7 },
];

function filterDemo(query) {
  let items = [...DEMO_PRODUCTS];
  if (query.category) items = items.filter(p => p.category === query.category);
  if (query.featured === 'true') items = items.filter(p => p.featured);
  if (query.newArrival === 'true') items = items.filter(p => p.newArrival);
  if (query.onSale === 'true') items = items.filter(p => p.onSale);
  if (query.minPrice) items = items.filter(p => p.price >= Number(query.minPrice));
  if (query.maxPrice) items = items.filter(p => p.price <= Number(query.maxPrice));
  if (query.size) items = items.filter(p => p.sizes.includes(query.size));
  if (query.search) { const s = query.search.toLowerCase(); items = items.filter(p => p.name.toLowerCase().includes(s) || p.category.includes(s)); }
  if (query.sort === 'price-asc') items.sort((a,b) => a.price - b.price);
  else if (query.sort === 'price-desc') items.sort((a,b) => b.price - a.price);
  else if (query.sort === 'rating') items.sort((a,b) => b.rating - a.rating);
  const limit = Number(query.limit) || 12;
  const page = Number(query.page) || 1;
  const total = items.length;
  const paged = items.slice((page-1)*limit, page*limit);
  return { products: paged, total, pages: Math.ceil(total/limit), page, demo: true };
}

// GET /api/products
router.get('/', async (req, res) => {
  if (!global.DB_CONNECTED) return res.json(filterDemo(req.query));
  try {
    const Product = require('../models/Product');
    const { category, minPrice, maxPrice, size, sort, search, featured, newArrival, onSale, limit=12, page=1 } = req.query;
    let query = {};
    if (category) query.category = category;
    if (featured) query.featured = true;
    if (newArrival) query.newArrival = true;
    if (onSale) query.onSale = true;
    if (size) query.sizes = { $in: [size] };
    if (minPrice || maxPrice) { query.price = {}; if(minPrice) query.price.$gte=Number(minPrice); if(maxPrice) query.price.$lte=Number(maxPrice); }
    if (search) query.$or = [{name:{$regex:search,$options:'i'}},{description:{$regex:search,$options:'i'}}];
    let sortOption = { createdAt: -1 };
    if (sort==='price-asc') sortOption={price:1}; else if(sort==='price-desc') sortOption={price:-1}; else if(sort==='rating') sortOption={rating:-1};
    const skip = (Number(page)-1)*Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOption).limit(Number(limit)).skip(skip);
    res.json({ products, total, pages: Math.ceil(total/limit), page: Number(page) });
  } catch(err) {
    console.error('Products error, falling back to demo:', err.message);
    res.json(filterDemo(req.query));
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  if (!global.DB_CONNECTED) {
    const p = DEMO_PRODUCTS.find(p => p.slug === req.params.slug);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    return res.json({ ...p, description: p.shortDescription + '. A premium EMERALD piece crafted with the finest materials for the discerning fashion enthusiast.', tags: [p.category,'luxury','premium'], reviews: [] });
  }
  try {
    const Product = require('../models/Product');
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch(err) {
    const p = DEMO_PRODUCTS.find(p => p.slug === req.params.slug);
    if (p) return res.json({ ...p, description: p.shortDescription, tags: [], reviews: [] });
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
  if (!global.DB_CONNECTED) return res.status(503).json({ message: 'Database not connected' });
  try {
    const Product = require('../models/Product');
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: 'Already reviewed' });
    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.calcAverageRating();
    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Admin routes
router.post('/', protect, adminOnly, async (req, res) => {
  if (!global.DB_CONNECTED) return res.status(503).json({ message: 'Database not connected' });
  try { const Product = require('../models/Product'); const p = await Product.create(req.body); res.status(201).json(p); }
  catch(err) { res.status(500).json({ message: err.message }); }
});
router.put('/:id', protect, adminOnly, async (req, res) => {
  if (!global.DB_CONNECTED) return res.status(503).json({ message: 'Database not connected' });
  try { const Product = require('../models/Product'); const p = await Product.findByIdAndUpdate(req.params.id, req.body, {new:true}); res.json(p); }
  catch(err) { res.status(500).json({ message: err.message }); }
});
router.delete('/:id', protect, adminOnly, async (req, res) => {
  if (!global.DB_CONNECTED) return res.status(503).json({ message: 'Database not connected' });
  try { const Product = require('../models/Product'); await Product.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
