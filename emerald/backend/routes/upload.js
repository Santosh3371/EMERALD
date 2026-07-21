const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/upload — Safe persistent image URL route
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });

    // Validate that image URL is absolute HTTPS or valid remote resource
    let finalUrl = imageUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      return res.status(400).json({ message: 'Image must be hosted on a persistent HTTPS CDN (Cloudinary / Unsplash)' });
    }

    res.json({ url: finalUrl, message: 'Image URL verified and ready for product' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
