const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect, generateToken } = require('../middleware/auth');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizeName = (name) => String(name || '').trim();

router.post('/register', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Database is unavailable right now.' });
  try {
    const User = require('../models/User');
    const { name, email, password } = req.body;
    const safeName = normalizeName(name);
    const safeEmail = normalizeEmail(email);
    if (!safeName || !safeEmail || !password) return res.status(400).json({ message: 'Please provide your name, email, and password.' });
    if (String(password).length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    const exists = await User.findOne({ email: safeEmail });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name: safeName, email: safeEmail, password });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id), message: 'Account created successfully' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Database is unavailable right now.' });
  try {
    const User = require('../models/User');
    const { email, password } = req.body;
    const safeEmail = normalizeEmail(email);
    const user = await User.findOne({ email: safeEmail });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id), message: 'Signed in successfully' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/profile', protect, async (req, res) => {
  if (!global.DB_CONNECTED) return res.status(503).json({ message: 'Database not connected' });
  const User = require('../models/User');
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

router.put('/profile', protect, async (req, res) => {
  if (!global.DB_CONNECTED) return res.status(503).json({ message: 'Database not connected' });
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;
    if (req.body.address) user.address = req.body.address;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, token: generateToken(updated._id) });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
