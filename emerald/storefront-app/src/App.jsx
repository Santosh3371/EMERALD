import React, { useEffect, useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useParams,
  useSearchParams
} from 'react-router-dom';

const categories = ['women', 'men', 'accessories', 'footwear', 'bags', 'jewelry'];
const brands = [
  'Aurelia Sarto', 'Bespoke Atelier', 'L’Horizon', 'Sovereign Style',
  'Elysium Tailors', 'Monarch Label', 'Verdant Fashion', 'Opus Noir',
  'Nomad & Co.', 'Heritage Wear', 'Velasquez Studio', 'Aura Minimalist',
  'Drape & Stitch', 'Meridian Classics'
];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function normalizeCategory(category) {
  return categories.includes(category) ? category : '';
}

async function requestJson(url, signal) {
  const response = await fetch(url, { signal });
  let body;

  try {
    body = await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('The store returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(body?.message || `Request failed (${response.status}).`);
  }

  return body;
}

function readCartCount() {
  const items = JSON.parse(localStorage.getItem('emerald_cart') || '[]');
  return items.reduce((count, item) => count + item.quantity, 0);
}

function createAddToCartHandler(product, onCartChange) {
  return () => {
    const items = JSON.parse(localStorage.getItem('emerald_cart') || '[]');
    const size = product.sizes?.[0] || 'One Size';
    const color = product.colors?.[0]?.name || 'Default';
    const existing = items.find(item =>
      item.productId === product._id && item.size === size && item.color === color
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: product.salePrice || product.price,
        size,
        color,
        quantity: 1,
        slug: product.slug
      });
    }

    localStorage.setItem('emerald_cart', JSON.stringify(items));
    onCartChange(items.reduce((count, item) => count + item.quantity, 0));
  };
}

function StoreHeader({ cartCount }) {
  return (
    <header className="store-header">
      <Link className="store-brand" to="/">EMERALD</Link>
      <nav aria-label="Store navigation">
        <Link to="/">Shop</Link>
        <a href="/pages/cart.html">Cart <span className="store-cart-count">{cartCount}</span></a>
        <a href="/">Home</a>
      </nav>
    </header>
  );
}

function ProductCard({ product, onCartChange }) {
  const addToCart = createAddToCartHandler(product, onCartChange);
  const image = product.images?.[0]?.url || '';
  const price = product.salePrice || product.price;

  return (
    <article className="store-card">
      <Link className="store-card-image" to={`/product/${encodeURIComponent(product.slug)}`}>
        {image
          ? <img src={image} alt={product.images?.[0]?.alt || product.name} loading="lazy" />
          : <span className="store-image-placeholder">EMERALD</span>}
      </Link>
      <div className="store-card-body">
        <p className="store-category">{product.category} · {product.brand}</p>
        <Link className="store-product-name" to={`/product/${encodeURIComponent(product.slug)}`}>
          {product.name}
        </Link>
        <p className="store-price">${Number(price).toFixed(2)}</p>
        <button className="store-button" type="button" onClick={addToCart} disabled={product.stock === 0}>
          {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

function CatalogPage({ cartCount, setCartCount }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = normalizeCategory(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [size, setSize] = useState('');
  const [newArrival, setNewArrival] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ limit: '9', page: String(page), sort });
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (size) params.set('size', size);
    if (searchTerm) params.set('search', searchTerm);
    if (newArrival) params.set('newArrival', 'true');
    if (onSale) params.set('onSale', 'true');
    if (featured) params.set('featured', 'true');

    setLoading(true);
    setError('');
    requestJson(`/api/products?${params}`, controller.signal)
      .then(data => {
        if (!Array.isArray(data.products)) throw new Error('The store returned an invalid product list.');
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(loadError => {
        if (loadError.name !== 'AbortError') setError(loadError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [category, brand, minPrice, maxPrice, size, newArrival, onSale, featured, searchTerm, sort, page, retry]);

  function changeCategory(value) {
    const next = new URLSearchParams(searchParams);
    next.set('category', value);
    setSearchParams(next);
    setPage(1);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams({ category: '' }));
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSize('');
    setNewArrival(false);
    setOnSale(false);
    setFeatured(false);
    setSearchInput('');
    setSearchTerm('');
    setSort('newest');
    setPage(1);
  }

  function selectPage(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  }

  return (
    <>
      <section className="store-hero">
        <p className="store-eyebrow">EMERALD COLLECTION</p>
        <h1>Find your next favorite.</h1>
        <p>Browse the live EMERALD catalog, filter by collection, and add products to your cart.</p>
      </section>

      <section className="store-catalog" aria-label="Product catalog">
        <aside className="store-filters" aria-label="Product filters">
          <div className="store-filter-heading">
            <strong>Filters</strong>
            <button type="button" onClick={clearFilters}>Clear all</button>
          </div>
          <label>
            Category
            <select value={category} onChange={event => changeCategory(event.target.value)}>
              <option value="">All</option>
              {categories.map(item => (
                <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>
              ))}
            </select>
          </label>
          <label>
            Brand
            <select value={brand} onChange={event => { setBrand(event.target.value); setPage(1); }}>
              <option value="">All brands</option>
              {brands.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <fieldset>
            <legend>Price range</legend>
            <div className="store-price-range">
              <input aria-label="Minimum price" type="number" min="0" value={minPrice} onChange={event => { setMinPrice(event.target.value); setPage(1); }} placeholder="Min $" />
              <input aria-label="Maximum price" type="number" min="0" value={maxPrice} onChange={event => { setMaxPrice(event.target.value); setPage(1); }} placeholder="Max $" />
            </div>
          </fieldset>
          <fieldset>
            <legend>Size</legend>
            <div className="store-size-list">
              {sizes.map(item => (
                <button
                  aria-pressed={size === item}
                  className={size === item ? 'selected' : ''}
                  key={item}
                  onClick={() => { setSize(size === item ? '' : item); setPage(1); }}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="store-special-filters">
            <legend>Special</legend>
            <label><input checked={newArrival} onChange={event => { setNewArrival(event.target.checked); setPage(1); }} type="checkbox" /> New arrivals</label>
            <label><input checked={onSale} onChange={event => { setOnSale(event.target.checked); setPage(1); }} type="checkbox" /> On sale</label>
            <label><input checked={featured} onChange={event => { setFeatured(event.target.checked); setPage(1); }} type="checkbox" /> Featured</label>
          </fieldset>
        </aside>

        <div className="store-results">
          <div className="store-toolbar">
            <label>
              <span className="visually-hidden">Search products</span>
              <input
                type="search"
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder="Search products"
              />
            </label>
            <label>
              <span className="visually-hidden">Sort products</span>
              <select value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </label>
            <span className="store-count">{total} items</span>
          </div>

          {loading && <p className="store-message" role="status">Loading products…</p>}
          {!loading && error && (
            <div className="store-message store-error" role="alert">
              <p>{error}</p>
              <button className="store-button" type="button" onClick={() => setRetry(value => value + 1)}>
                Try again
              </button>
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <p className="store-message">No products match these filters.</p>
          )}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="store-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} onCartChange={setCartCount} />
                ))}
              </div>
              {pages > 1 && (
                <nav aria-label="Product pages" className="store-pagination">
                  {Array.from({ length: pages }, (_, index) => index + 1).map(pageNumber => (
                    <button
                      aria-current={pageNumber === page ? 'page' : undefined}
                      className={pageNumber === page ? 'selected' : ''}
                      key={pageNumber}
                      onClick={() => selectPage(pageNumber)}
                      type="button"
                    >
                      {pageNumber}
                    </button>
                  ))}
                </nav>
              )}
            </>
          )}
          <span className="visually-hidden" aria-live="polite">{cartCount} items in cart</span>
        </div>
      </section>
    </>
  );
}

function ProductPage({ setCartCount }) {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    requestJson(`/api/products/${encodeURIComponent(slug)}`, controller.signal)
      .then(setProduct)
      .catch(loadError => {
        if (loadError.name !== 'AbortError') setError(loadError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  if (loading) return <p className="store-message" role="status">Loading product…</p>;
  if (error) return <p className="store-message store-error" role="alert">{error}</p>;
  if (!product) return <p className="store-message">Product not found.</p>;

  const image = product.images?.[0]?.url || '';
  return (
    <section className="store-product-detail">
      <Link className="store-back-link" to="/">← Back to collection</Link>
      {image && <img src={image} alt={product.images?.[0]?.alt || product.name} />}
      <div>
        <p className="store-eyebrow">{product.category} · {product.brand}</p>
        <h1>{product.name}</h1>
        <p className="store-price">${Number(product.salePrice || product.price).toFixed(2)}</p>
        <p>{product.description}</p>
        <button
          className="store-button"
          type="button"
          disabled={product.stock === 0}
          onClick={createAddToCartHandler(product, setCartCount)}
        >
          {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const [cartCount, setCartCount] = useState(readCartCount);

  useEffect(() => {
    const syncCart = () => setCartCount(readCartCount());
    window.addEventListener('storage', syncCart);
    return () => window.removeEventListener('storage', syncCart);
  }, []);

  return (
    <div className="store-shell">
      <StoreHeader cartCount={cartCount} />
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage cartCount={cartCount} setCartCount={setCartCount} />} />
          <Route path="/product/:slug" element={<ProductPage setCartCount={setCartCount} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
