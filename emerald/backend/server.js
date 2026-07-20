require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// Ensure a JWT secret exists in development so demo tokens can be generated
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'emerald_dev_secret_change_me';
  console.log('⚠️  No JWT_SECRET set — using development fallback (change in .env for production)');
}

// ─── SECURITY & PERFORMANCE MIDDLEWARE ────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });
app.use('/api/', limiter);

// ─── MONGODB CONNECTION WITH SMART DETECTION ──────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI || '';
// In some network environments Node's DNS resolver (c-ares) cannot resolve
// SRV records used by MongoDB Atlas. In development, prefer public DNS
// servers so the driver can perform SRV lookups successfully.
if (process.env.NODE_ENV !== 'production') {
  try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) { /* ignore */ }
}
const hasRealPassword = MONGO_URI && !MONGO_URI.includes('<db_password>') && !MONGO_URI.includes('REPLACE');

// Global flag — routes check this to serve mock data when DB is unavailable
global.DB_CONNECTED = false;

if (hasRealPassword) {
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 20000,
    connectTimeoutMS: 10000,
  })
    .then(() => { global.DB_CONNECTED = true; console.log('✅ MongoDB connected'); })
    .catch(err => {
      console.error('❌ MongoDB error:', err.message);
      console.log('⚠️  Running in DEMO MODE — products served from memory');
    });
} else {
  console.log('⚠️  No MongoDB password set — running in DEMO MODE');
  console.log('   Edit .env → replace <db_password> with your Atlas password');
}

// ─── API CONFIG ROUTES ────────────────────────────────────────────────────────
app.get('/api/config/stripe-key', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLIC_KEY || '' });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/newsletter', require('./routes/newsletter'));

// ─── SERVE FRONTEND ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api'))
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 EMERALD running → http://localhost:${PORT}`);
  console.log(`   DB: ${hasRealPassword ? 'MongoDB Atlas' : 'DEMO MODE (no password set)'}\n`);
});
