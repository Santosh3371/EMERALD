import React, { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import {
  createCartCounter,
  fetchFeaturedProducts,
  loadFeaturedProducts,
  queueEventLoopExample
} from './concepts.js';

const hoistingMessage = hoistedGreeting();

function hoistedGreeting() {
  return 'This function declaration was called before its definition.';
}

function Layout({ children }) {
  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" to="/">EMERALD <span>Concepts Lab</span></Link>
        <nav aria-label="Concept topics">
          <Link to="/">React hooks</Link>
          <Link to="/javascript">JavaScript</Link>
        </nav>
      </header>
      {children}
      <footer>Isolated learning demo · Store data and database are not modified</footer>
    </main>
  );
}

function HooksPage() {
  const [count, setCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loadState, setLoadState] = useState('Loading demo products...');

  useEffect(() => {
    let active = true;

    fetchFeaturedProducts()
      .then((items) => {
        if (active) {
          setProducts(items);
          setLoadState('Loaded with a Promise in useEffect.');
        }
      })
      .catch((error) => {
        if (active) setLoadState(`Could not load products: ${error.message}`);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <p className="eyebrow">01 / REACT</p>
      <h1>State and side effects</h1>
      <p className="intro">A small interactive example of React state, effects, and client-side routes.</p>

      <div className="grid">
        <article className="card">
          <h2><code>useState</code> · component state</h2>
          <p>Clicking updates state, then React re-renders this component.</p>
          <div className="counter">
            <button type="button" onClick={() => setCount((current) => current - 1)} aria-label="Decrease">
              −
            </button>
            <strong aria-live="polite">{count}</strong>
            <button type="button" onClick={() => setCount((current) => current + 1)} aria-label="Increase">
              +
            </button>
          </div>
        </article>

        <article className="card">
          <h2><code>useEffect</code> · side effect</h2>
          <p>The effect runs after the first render, loads demo data, and cleans up on unmount.</p>
          <p className="status" role="status">{loadState}</p>
          {products.length > 0 && (
            <ul className="product-list">
              {products.map((product) => (
                <li key={product.id}>
                  <span>{product.name}</span><strong>${product.price}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <article className="card routing-card">
        <h2>Client-side routing</h2>
        <p>Use the JavaScript tab to navigate to a different React route without a full page reload.</p>
        <Link className="button-link" to="/javascript">Open JavaScript concepts →</Link>
      </article>
    </section>
  );
}

function JavaScriptPage() {
  const [cartCount, setCartCount] = useState(0);
  const [nextCartItem] = useState(() => createCartCounter());
  const [callbackProducts, setCallbackProducts] = useState([]);
  const [callbackStatus, setCallbackStatus] = useState('Not loaded yet.');
  const [events, setEvents] = useState([]);

  function loadWithCallback() {
    setCallbackStatus('Loading via callback...');
    loadFeaturedProducts(
      (items) => {
        setCallbackProducts(items);
        setCallbackStatus('Loaded: the success callback received the products.');
      },
      (error) => setCallbackStatus(`Callback reported an error: ${error.message}`)
    );
  }

  function runEventLoop() {
    setEvents([]);
    queueEventLoopExample((event) => {
      setEvents((current) => [...current, event]);
    });
  }

  return (
    <section>
      <p className="eyebrow">02 / JAVASCRIPT</p>
      <h1>Language fundamentals</h1>
      <p className="intro">Interactive examples of closures, hoisting, callbacks, promises, and the event loop.</p>

      <div className="grid">
        <article className="card">
          <h2>Closure</h2>
          <p><code>createCartCounter</code> keeps its private count between calls.</p>
          <button className="action" type="button" onClick={() => setCartCount(nextCartItem())}>
            Add item · closure count: {cartCount}
          </button>
        </article>

        <article className="card">
          <h2>Hoisting</h2>
          <p>A function declaration can be called before its definition in the same scope.</p>
          <p className="status">{hoistingMessage}</p>
        </article>

        <article className="card">
          <h2>Callback</h2>
          <p>A function is passed to the loader and called when its asynchronous work completes.</p>
          <button className="action" type="button" onClick={loadWithCallback}>Load with callback</button>
          <p className="status" role="status">{callbackStatus}</p>
          {callbackProducts.length > 0 && <p>{callbackProducts.length} products received.</p>}
        </article>

        <article className="card">
          <h2>Promise</h2>
          <p><code>fetchFeaturedProducts()</code> returns a Promise; the hooks page consumes it with <code>.then()</code>.</p>
          <Link className="text-link" to="/">See Promise used in <code>useEffect</code> →</Link>
        </article>

        <article className="card event-card">
          <h2>Event loop</h2>
          <p>Observe synchronous statements, a Promise microtask, and a timer callback.</p>
          <button className="action" type="button" onClick={runEventLoop}>Run event loop example</button>
          <ol className="event-list" aria-live="polite">
            {events.map((event, index) => <li key={`${event}-${index}`}>{event}</li>)}
          </ol>
        </article>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HooksPage />} />
        <Route path="/javascript" element={<JavaScriptPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
