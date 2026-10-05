# Low-Level Design (LLD)

## 1. Module Breakdown
### 1.1 Server Entry
- `backend/server.js` initializes the Express app.
- Loads environment configuration.
- Connects to MongoDB when available.
- Registers route modules and middleware.
- Starts the HTTP server.

### 1.2 Authentication
- `backend/middleware/auth.js` validates JWT tokens for protected routes.
- `backend/routes/auth.js` implements registration, login, profile retrieval, and profile updates.

### 1.3 Products
- `backend/routes/products.js` exposes catalog endpoints and single-product lookup.
- `backend/models/Product.js` describes the product schema and default field values.

### 1.4 Orders
- `backend/routes/orders.js` handles order creation and status-related flows.
- `backend/models/Order.js` defines order structure and purchase metadata.

### 1.5 Newsletter and Contact
- `backend/routes/newsletter.js` handles subscription and form submissions.

### 1.6 Shopify Integration
- `backend/services/shopify.js` and `backend/routes/shopifyInstall.js` provide Shopify-related service logic and installation flow.

### 1.7 Frontend Logic
- `frontend/js/main.js` manages shared UI behaviors including cart, auth, and page-level interactions.
- Each page in `frontend/pages` consumes the shared JavaScript and API endpoints.

### 1.8 Seed Data
- `seed/products.js` creates the initial collection of sample product records.
- `seed/fix_images.js` adjusts image references for catalog consistency.

## 2. Core Data Schemas
### User Schema
- username or email-based identity
- hashed password
- profile fields for account information
- optional order references

### Product Schema
- name
- slug
- description
- price
- category
- images
- stock or availability data if included

### Order Schema
- user reference
- list of line items
- subtotal and total values
- payment state
- date created

## 3. Request Flows
### Registration Flow
1. Client submits registration payload.
2. Auth route validates input.
3. Password is hashed and stored in MongoDB.
4. JWT token is generated and returned to the client.

### Login Flow
1. Client sends credentials.
2. Auth route verifies password.
3. Token is issued if valid.
4. Client stores token for protected requests.

### Product Listing Flow
1. Client requests `/api/products`.
2. Route queries MongoDB product collection.
3. Response returns product list in JSON format.
4. Frontend renders catalog cards and filters.

### Checkout Flow
1. Client builds cart payload and submits order.
2. Backend validates line items and user details.
3. Stripe payment is initiated with configured keys.
4. Order confirmation is saved and sent back to the client.

## 4. Error Handling
- Missing environment variables should fail clearly during startup.
- Invalid JWT tokens are denied by middleware.
- Database connection failures should surface in logs and degrade gracefully in demo mode where configured.
- Payment or submission failures return descriptive API responses.

## 5. Implementation Notes
- Backend route logic is centralized and separated by responsibility.
- Frontend is page-based but reuses shared JavaScript logic for consistency.
- Data persistence uses MongoDB collections for core commerce objects.
- External integrations are isolated to service and route modules to preserve maintainability.
