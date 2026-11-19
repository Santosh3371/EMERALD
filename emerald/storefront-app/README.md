# EMERALD Storefront

The React storefront is served at `/storefront/` and uses the existing `/api/products` API and `emerald_cart` local-storage format.

## Project concepts

| Concept | Implementation |
|---|---|
| Closure | `createAddToCartHandler` in `src/App.jsx` captures a product and the cart state updater. |
| Hoisting | `getShopPath` in `../frontend/js/main.js` is called before its function declaration to select the Shop link. |
| Promises and callbacks | Product requests return Promises; `.then()`, `.catch()`, `.finally()`, and UI event handlers process their results. |
| Event loop | A `setTimeout` in `CatalogPage` debounces search input; its cleanup cancels the queued timer. |
| `useState` and `useEffect` | `src/App.jsx` manages catalog, filters, product loading, cart count, and request cleanup. |
| Client-side routing | `src/main.jsx` mounts React Router; catalog and product details are routes in `src/App.jsx`. |
| SQL joins | `../sql/joins.sql` contains PostgreSQL-compatible examples only. It is not executed or connected to MongoDB. |

## Run

From the `emerald` directory, use `npm run storefront:dev` for development or `npm run storefront:build` to create the production assets served by Express.
