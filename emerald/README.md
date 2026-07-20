# 🌿 EMERALD Fashion Store — Setup Guide

## ✅ What's Built
- **10 Pages**: Home, Shop, Product, Cart, Checkout, Confirmation, Account, About, Blog, Contact
- **15 Products** (15 fashion items ready to seed into MongoDB)
- **Glassmorphism UI** — floating cards, blurred glass panels, emerald gradients
- **Old-Money Hero** — tailored editorial photography
- **Demo Mode** — site works WITHOUT a database (shows all 15 products from memory)
- **Stripe Payments** — test-mode ready
- **Mailchimp Newsletter** — opt-in + autoresponder
- **JWT Authentication** — register, login, profile, orders
- **Social Icons** — Instagram, Facebook, Pinterest, TikTok, YouTube (footer + contact)
- **Speed Optimized** — gzip, lazy loading, rate limiting, security headers

---

## 🚀 Quick Start (3 Steps)

### Step 1 — Set Your MongoDB Password
Open `.env` and replace `YOUR_PASSWORD_HERE`:
```
MONGODB_URI=mongodb+srv://santoshmann2711_db_user:YOUR_REAL_PASSWORD@cluster0.6phuptz.mongodb.net/emerald_store?retryWrites=true&w=majority
```

### Step 2 — Install & Seed
```bash
npm install
npm run seed        ← loads all 15 products into MongoDB
```

### Step 3 — Start
```bash
npm start           ← visit http://localhost:5000
# or
npm run dev         ← auto-restart on file changes
```

> **No database yet?** The site still works! All 15 products are served from memory in Demo Mode.

---

## 💳 Stripe Setup (5 minutes)

1. Go to **https://dashboard.stripe.com** → Sign up / Log in
2. Toggle to **Test Mode** (top-left switch)
3. Go to **Developers → API Keys**
4. Copy **Publishable key** → paste as `STRIPE_PUBLIC_KEY` in `.env`
5. Copy **Secret key** → paste as `STRIPE_SECRET_KEY` in `.env`
6. Also paste the publishable key in `frontend/pages/checkout.html` at line:
   ```js
   const pk = 'pk_test_REPLACE_WITH_YOUR_STRIPE_PUBLIC_KEY';
   ```

### Test Cards (no real money)
| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0025 0000 3155` | 🔐 3D Secure |

Use any future expiry, any CVV, any ZIP.

---

## 📧 Mailchimp Setup (5 minutes)

1. Go to **https://mailchimp.com** → Sign up / Log in
2. **API Key**: Account → Extras → API Keys → Create A Key
3. **Audience ID**: Audience → All Contacts → Settings → "Audience name and defaults" → Audience ID
4. **Server Prefix**: Look at your Mailchimp URL — e.g. `us1.admin.mailchimp.com` → prefix = `us1`
5. Paste all three into `.env`

---

## 🌐 Deploy FREE on Render.com

1. Push code to a **private GitHub repo** (never commit `.env`!)
2. Go to **https://render.com** → New → Web Service → connect repo
3. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add all `.env` variables under Environment
5. Done — you get a free `*.onrender.com` URL!

---

## 📁 Project Structure
```
emerald/
├── .env                         ← All secret keys (never commit!)
├── frontend/
│   ├── index.html               ← Home (glassmorphism hero)
│   ├── css/style.css            ← Full design system
│   ├── js/main.js               ← Shared JS (cart, auth, API, navbar)
│   └── pages/
│       ├── shop.html            ← Shop with filters + search
│       ├── product.html         ← Product detail + reviews
│       ├── cart.html            ← Cart + promo code
│       ├── checkout.html        ← Stripe checkout
│       ├── confirmation.html    ← Order confirmed
│       ├── account.html         ← Login/Register/Dashboard
│       ├── about.html           ← Brand story + team
│       ├── blog.html            ← Articles + categories
│       └── contact.html         ← Form + FAQ + social
├── backend/
│   ├── server.js                ← Express + MongoDB + Demo Mode
│   ├── models/                  ← User, Product, Order schemas
│   ├── routes/                  ← auth, products, orders, newsletter
│   └── middleware/auth.js       ← JWT protection
└── seed/products.js             ← 15 fashion products
```

---

## 🎨 Design System
| Token | Value |
|-------|-------|
| Primary | `#065f46` Emerald 800 |
| Accent | `#ca8a04` Gold |
| Glass BG | `rgba(255,255,255,0.78)` |
| Blur | `blur(20px) saturate(160%)` |
| Border Radius | `20px` (cards), `9999px` (pills) |
| Hero Gradient | `#022c22 → #065f46 → #047857` |

## 🔑 API Reference
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| GET | `/api/auth/profile` | JWT | Get profile |
| PUT | `/api/auth/profile` | JWT | Update profile |
| GET | `/api/products` | — | List (filterable) |
| GET | `/api/products/:slug` | — | Single product |
| POST | `/api/products/:id/reviews` | JWT | Add review |
| POST | `/api/orders` | — | Place order |
| POST | `/api/orders/:id/confirm` | — | Confirm payment |
| GET | `/api/orders/my` | JWT | My orders |
| POST | `/api/newsletter/subscribe` | — | Subscribe |
| POST | `/api/newsletter/contact` | — | Contact form |

Built with ❤️ — EMERALD Fashion Store
