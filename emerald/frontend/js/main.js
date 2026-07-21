/* ═══════════════════════════════════════════════════════
   EMERALD — SHARED JS v2 (Glassmorphism + Floating UI)
═══════════════════════════════════════════════════════ */

const ORIGIN = window.location.protocol === 'file:'
  ? 'http://localhost:5000'
  : window.location.origin;
const API = `${ORIGIN}/api`;
const PAGE_BASE = window.location.pathname.includes('/pages/') ? '../' : './';
const APP_ROOT = window.location.protocol === 'file:' ? `${PAGE_BASE}index.html` : '/';

/* ── CART ────────────────────────────────────────────── */
const Cart = {
  get()  { return JSON.parse(localStorage.getItem('emerald_cart') || '[]'); },
  save(items) { localStorage.setItem('emerald_cart', JSON.stringify(items)); Cart.updateBadge(); },
  add(product, size, color, qty = 1) {
    const items = Cart.get();
    const key = `${product._id}-${size}-${color}`;
    const existing = items.find(i => `${i.productId}-${i.size}-${i.color}` === key);
    if (existing) existing.quantity += qty;
    else items.push({ productId: product._id, name: product.name, image: product.images[0]?.url || '', price: product.salePrice || product.price, size, color, quantity: qty, slug: product.slug });
    Cart.save(items);
    Toast.show(`${product.name} added to cart ✓`, 'success');
  },
  remove(productId, size, color) { Cart.save(Cart.get().filter(i => !(i.productId===productId && i.size===size && i.color===color))); },
  updateQty(productId, size, color, qty) {
    if (parseInt(qty) <= 0) return Cart.remove(productId, size, color);
    const items = Cart.get();
    const item = items.find(i => i.productId===productId && i.size===size && i.color===color);
    if (item) { item.quantity = parseInt(qty); Cart.save(items); }
  },
  total()  { return Cart.get().reduce((s,i) => s + i.price * i.quantity, 0); },
  count()  { return Cart.get().reduce((s,i) => s + i.quantity, 0); },
  clear()  { localStorage.removeItem('emerald_cart'); Cart.updateBadge(); },
  updateBadge() {
    const c = Cart.count();
    document.querySelectorAll('.cart-badge').forEach(b => { b.textContent = c; b.style.display = c > 0 ? 'flex' : 'none'; });
  }
};

/* ── AUTH ────────────────────────────────────────────── */
const Auth = {
  getToken() { return localStorage.getItem('emerald_token'); },
  getUser()  { return JSON.parse(localStorage.getItem('emerald_user') || 'null'); },
  isLoggedIn() { return !!Auth.getToken(); },
  login(user, token) { localStorage.setItem('emerald_token', token); localStorage.setItem('emerald_user', JSON.stringify(user)); Auth.updateNav(); },
  logout()   { localStorage.removeItem('emerald_token'); localStorage.removeItem('emerald_user'); Auth.updateNav(); window.location.href = '/'; },
  updateNav() {
    const user = Auth.getUser();
    document.querySelectorAll('.nav-login').forEach(el => el.style.display = user ? 'none' : '');
    document.querySelectorAll('.nav-account').forEach(el => el.style.display = user ? '' : 'none');
  },
  headers() {
    const h = { 'Content-Type': 'application/json' };
    if (Auth.getToken()) h['Authorization'] = `Bearer ${Auth.getToken()}`;
    return h;
  }
};

/* ── API FETCH ───────────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, { headers: Auth.headers(), ...options });
  // Some endpoints may return empty bodies or non-JSON (204/empty on errors),
  // so read text first and try to parse JSON safely.
  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch (e) { data = text; }
  }
  if (!res.ok) {
    const msg = data && data.message ? data.message : (typeof data === 'string' && data.trim() ? data : res.statusText || 'Something went wrong');
    throw new Error(msg);
  }
  return data;
}

/* ── TOAST ───────────────────────────────────────────── */
const Toast = {
  show(msg, type = 'success', duration = 3200) {
    let container = document.getElementById('toast-container');
    if (!container) { container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); }
    const icon = type === 'success' ? '✓' : '✕';
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span style="font-size:1rem">${icon}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity='0'; toast.style.transform='translateX(24px)'; toast.style.transition='all .3s'; setTimeout(()=>toast.remove(),300); }, duration);
  }
};

/* ── NAVBAR ──────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

  const update = () => {
    const scrolled = window.scrollY > 60;
    navbar.classList.toggle('scrolled', scrolled);
    navbar.classList.toggle('hero-mode', !scrolled);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });

  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));

  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const resolved = new URL(href, window.location.href).pathname;
    if (resolved === path || (path === '/' && resolved === '/index.html') || (path === '/index.html' && resolved === '/')) a.classList.add('active');
  });

  Cart.updateBadge();
  Auth.updateNav();
}

/* ── SCROLL REVEAL ───────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }});
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ── HELPERS ─────────────────────────────────────────── */
function formatPrice(price) { return `$${Number(price).toFixed(2)}`; }

function renderStars(rating, numReviews = null) {
  const full = Math.floor(rating), half = rating % 1 >= 0.5;
  let html = '<div class="stars">';
  for (let i = 1; i <= 5; i++) html += i<=full ? '★' : (i===full+1&&half ? '⯨' : '☆');
  html += '</div>';
  if (numReviews !== null) html += `<span style="font-size:.75rem;color:var(--gray-400);margin-left:.3rem">(${numReviews})</span>`;
  return html;
}

function buildProductCard(product) {
  const pagePath = window.location.pathname.includes('/pages/') ? '' : 'pages/';
  const badge = product.bestSeller ? '<span class="product-card-badge badge-featured">Best Seller</span>'
    : product.newArrival ? '<span class="product-card-badge badge-new">New</span>'
    : product.onSale ? '<span class="product-card-badge badge-sale">Sale</span>'
    : product.featured ? '<span class="product-card-badge badge-featured">Featured</span>' : '';
  const price = product.salePrice
    ? `<span class="price-current price-sale">${formatPrice(product.salePrice)}</span><span class="price-original">${formatPrice(product.price)}</span>`
    : `<span class="price-current">${formatPrice(product.price)}</span>`;
  const stockLabel = product.stock === 0 
    ? '<span style="font-size:0.7rem;color:#ef4444;font-weight:700">Out of Stock</span>'
    : product.stock <= 15 
      ? `<span style="font-size:0.7rem;color:#b45309;font-weight:600">Only ${product.stock} left!</span>`
      : `<span style="font-size:0.7rem;color:var(--gray-400)">In Stock (${product.stock})</span>`;
  return `
    <article class="product-card reveal">
      <a href="${pagePath}product.html?slug=${product.slug}">
        <div class="product-card-img">
          ${badge}
          <img src="${product.images[0]?.url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400'}"
               alt="${product.name}" loading="lazy">
          <div class="product-card-actions">
            <button class="btn btn-primary btn-sm" style="flex:1;border-radius:var(--r-full)"
              onclick="quickAddToCart(event,'${product._id}','${product.slug}')" ${product.stock === 0 ? 'disabled style="opacity:.5"' : ''}>${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</button>
            <a href="${pagePath}product.html?slug=${product.slug}" class="btn btn-outline btn-sm">View</a>
          </div>
        </div>
      </a>
      <div class="product-card-body">
        <div style="display:flex;justify-content:between;align-items:center;font-size:0.75rem;color:var(--gray-400);margin-bottom:0.2rem">
          <span style="text-transform:uppercase">${product.category}</span>
          <span style="margin:0 0.4rem">•</span>
          <span style="font-weight:600;color:var(--emerald-700)">${product.brand || 'EMERALD'}</span>
        </div>
        <h3 class="product-card-name"><a href="${pagePath}product.html?slug=${product.slug}">${product.name}</a></h3>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.4rem;margin-bottom:0.4rem">
          <div class="product-card-price">${price}</div>
          ${product.rating ? renderStars(product.rating, product.numReviews) : ''}
        </div>
        <div style="margin-top:0.2rem">${stockLabel}</div>
      </div>
    </article>`;
}

async function quickAddToCart(e, productId, slug) {
  e.preventDefault(); e.stopPropagation();
  try {
    const product = await apiFetch(`/products/${slug}`);
    Cart.add(product, product.sizes[0] || 'One Size', product.colors[0]?.name || 'Default');
  } catch(err) { Toast.show('Could not add to cart', 'error'); }
}

function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      const name  = form.querySelector('input[name="name"]')?.value || '';
      const btn   = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Joining…';
      try {
        const res = await apiFetch('/newsletter/subscribe', { method:'POST', body: JSON.stringify({ email, name }) });
        Toast.show(res.message, 'success'); form.reset();
      } catch(err) { Toast.show(err.message, 'error'); }
      finally { btn.disabled = false; btn.textContent = 'Subscribe'; }
    });
  });
}

/* ── NAVBAR HTML ─────────────────────────────────────── */
const NAVBAR_HTML = `
<nav class="navbar hero-mode">
  <div class="nav-inner">
    <a href="<<BASE>>" class="nav-logo">EMERALD</a>
    <ul class="nav-links">
      <li><a href="<<BASE>>">Home</a></li>
      <li><a href="<<BASE>>pages/shop.html">Shop</a></li>
      <li><a href="<<BASE>>pages/about.html">About</a></li>
      <li><a href="<<BASE>>pages/blog.html">Blog</a></li>
      <li><a href="<<BASE>>pages/contact.html">Contact</a></li>
    </ul>
    <div class="nav-actions">
      <a href="<<BASE>>pages/account.html" class="nav-icon nav-login" title="Sign In">
        <svg width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </a>
      <span class="nav-icon nav-account" style="display:none;cursor:pointer" onclick="Auth.logout()" title="Sign Out">
        <svg width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </span>
      <a href="<<BASE>>pages/cart.html" class="nav-icon" style="position:relative" title="Cart">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span class="cart-badge" style="display:none">0</span>
      </a>
      <button class="nav-hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</nav>`;

/* ── FOOTER HTML ─────────────────────────────────────── */
const FOOTER_HTML = `
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="nav-logo" style="font-family:var(--font-display);font-size:1.5rem;font-weight:700;letter-spacing:.1em;margin-bottom:1rem">EMERALD</div>
        <p>Premium fashion for the modern individual. Crafted with intention, worn with confidence.</p>
        <div class="social-links">
          <a href="https://instagram.com" target="_blank" class="social-link" title="Instagram">
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://facebook.com" target="_blank" class="social-link" title="Facebook">
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://pinterest.com" target="_blank" class="social-link" title="Pinterest">
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
          </a>
          <a href="https://tiktok.com" target="_blank" class="social-link" title="TikTok">
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
          </a>
          <a href="https://youtube.com" target="_blank" class="social-link" title="YouTube">
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col"><h4>Shop</h4><ul>
        <li><a href="<<BASE>>pages/shop.html?category=women">Women</a></li>
        <li><a href="<<BASE>>pages/shop.html?category=men">Men</a></li>
        <li><a href="<<BASE>>pages/shop.html?category=accessories">Accessories</a></li>
        <li><a href="<<BASE>>pages/shop.html?category=footwear">Footwear</a></li>
        <li><a href="<<BASE>>pages/shop.html?category=bags">Bags</a></li>
        <li><a href="<<BASE>>pages/shop.html?category=jewelry">Jewelry</a></li>
      </ul></div>
      <div class="footer-col"><h4>Help</h4><ul>
        <li><a href="<<BASE>>pages/contact.html">Contact Us</a></li>
        <li><a href="#">Shipping Info</a></li>
        <li><a href="#">Returns</a></li>
        <li><a href="#">Size Guide</a></li>
        <li><a href="#">FAQ</a></li>
      </ul></div>
      <div class="footer-col"><h4>Company</h4><ul>
        <li><a href="<<BASE>>pages/about.html">About Us</a></li>
        <li><a href="<<BASE>>pages/blog.html">Blog</a></li>
        <li><a href="#">Sustainability</a></li>
        <li><a href="#">Careers</a></li>
        <li><a href="#">Press</a></li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <p>© 2024 EMERALD. All rights reserved. Powered by passion.</p>
      <div style="display:flex;gap:1.5rem"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
    </div>
  </div>
</footer>`;

/* ── INIT ON DOM READY ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const navHolder    = document.getElementById('navbar');
  const footerHolder = document.getElementById('footer');
  const base = PAGE_BASE;
  if (navHolder)    navHolder.innerHTML    = NAVBAR_HTML.replace(/<<BASE>>/g, base);
  if (footerHolder) footerHolder.innerHTML = FOOTER_HTML.replace(/<<BASE>>/g, base);
  initNavbar();
  initReveal();
  initNewsletterForms();
});
