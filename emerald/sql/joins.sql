-- Reference only. These examples are not connected to EMERALD's MongoDB
-- and are not executed by the application.
--
-- Example relational tables:
-- users(user_id, full_name, email)
-- orders(order_id, user_id, order_number, status, created_at)
-- order_items(order_id, line_number, product_id, quantity, unit_price)
-- products(product_id, sku, name, unit_price)

-- INNER JOIN: only orders that have a matching user.
SELECT
    orders.order_number,
    users.full_name AS customer_name,
    orders.status,
    orders.created_at
FROM orders
INNER JOIN users
    ON orders.user_id = users.user_id
ORDER BY orders.created_at DESC;

-- LEFT JOIN: include every user, including users with no orders.
SELECT
    users.full_name AS customer_name,
    orders.order_number,
    orders.status
FROM users
LEFT JOIN orders
    ON orders.user_id = users.user_id
ORDER BY users.full_name;

-- Join four related tables to show each order line with customer and product.
SELECT
    orders.order_number,
    users.email AS customer_email,
    products.name AS product_name,
    order_items.quantity,
    order_items.unit_price
FROM orders
INNER JOIN users
    ON orders.user_id = users.user_id
INNER JOIN order_items
    ON order_items.order_id = orders.order_id
INNER JOIN products
    ON order_items.product_id = products.product_id
ORDER BY orders.order_number, products.name;
