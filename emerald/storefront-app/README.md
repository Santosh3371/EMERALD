# EMERALD Storefront

The React storefront is served at `/storefront/` and uses the existing `/api/products` API and `emerald_cart` local-storage format.

Open `/storefront/concepts` or choose **Concepts in Practice** in the storefront navigation to see interactive examples that work without product data or a database.

## Project concepts

| Concept | Implementation |
|---|---|
| Closure | `createAddToCartHandler` in `src/App.jsx` captures a product and the cart state updater; the Concepts page also has a working private counter. |
| Hoisting | `getShopPath` in `../frontend/js/main.js` is called before its function declaration to select the Shop link. |
| Promises and callbacks | Product requests and the offline Promise interaction use `.then()`, `.catch()`, `.finally()`, and callbacks in `src/App.jsx`. |
| Event loop | Search debounce and the Concepts page's synchronous/microtask/timer ordering are implemented in `src/App.jsx`. |
| `useState` and `useEffect` | Catalog state and a working state/effect counter are in `src/App.jsx`. |
| Client-side routing | `src/main.jsx` mounts React Router; catalog, product details, and Concepts in Practice are routes in `src/App.jsx`. |
| SQL joins | The Concepts page displays INNER and LEFT JOIN examples; `../sql/joins.sql` contains full examples. They are illustrative only, not executed or connected to MongoDB. |

## Run

From the `emerald` directory, use `npm run storefront:dev` for development or `npm run storefront:build` to create the production assets served by Express.
