# High-Level Design (HLD)

## 1. System Overview
EMERALD is a full-stack e-commerce web application that combines a static frontend experience with a Node.js/Express backend and MongoDB data layer. The project supports demo usage without backend configuration and also supports production-style commerce flows with authentication, payments, and newsletter integrations.

## 2. Architectural Overview
The system is divided into three main layers:

1. Frontend Layer
   - Static HTML pages under the frontend directory.
   - Shared JavaScript logic for UI interactions and API calls.
   - Styling and product presentation through CSS.

2. Application Layer
   - Express server serves routes and handles business logic.
   - Authentication with JWT middleware.
   - Product, auth, order, and newsletter endpoints.

3. Data and Integrations
   - MongoDB for persistent user, product, and order data.
   - Stripe for secure payment handling.
   - Mailchimp for subscription requests.

## 3. Core Components
### Frontend
- Home, shop, product, cart, checkout, confirmation, account, and contact pages.
- Shared cart and authentication behavior via frontend JavaScript.

### Backend
- Express server entry point.
- Route modules for auth, products, orders, and newsletter.
- Middleware for JWT validation.
- Models for User, Product, and Order.

### Data Layer
- MongoDB connection via environment variables.
- Product seed scripts for demo and development setup.

### External Services
- Stripe public and secret keys configured via environment variables.
- Mailchimp API credentials and audience metadata configured via environment variables.

## 4. Runtime Flow
- The browser loads storefront pages from the frontend.
- Product data is retrieved from the backend API or rendered in demo mode.
- Users can add items to the cart and navigate to checkout.
- Checkout requests are processed with Stripe payment confirmation.
- Orders are stored in MongoDB and reflected back to the client.
- Registered users authenticate with JWT tokens and access protected routes.

## 5. High-Level Data Model
- User: account information, authentication details, personal order references.
- Product: title, description, pricing, category, image metadata, inventory-related values when applicable.
- Order: user reference, purchased items, total amount, payment status, and confirmation state.

## 6. Security Considerations
- JWT-based protection for authenticated endpoints.
- Environment-based secrets for MongoDB, Stripe, and Mailchimp keys.
- Use of test-mode Stripe keys for local development.

## 7. Deployment Model
- Run as a Node.js application using the project server entry point.
- The application can be deployed to a host such as Render.
- Environment variables are supplied by the deployment platform rather than committed to source control.

## 8. Constraints
- Product UI is front-end driven and may operate in demo mode without a live database.
- The project is designed for a small-to-medium e-commerce implementation rather than a large enterprise marketplace.
