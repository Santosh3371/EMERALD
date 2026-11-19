-- Reference only. These examples are not connected to EMERALD's MongoDB
-- and are not executed by the application.
--
-- Example relational tables:
-- users(id, name, email)
-- orders(id, user_id, order_number, status, created_at)
-- order_items(id, order_id, product_id, quantity, unit_price)
-- products(id, name, category)

-- INNER JOIN: only orders that have a matching user.
SELECT
    orders.order_number,
    users.name AS customer_name,
    orders.status,
    orders.created_at
FROM orders
INNER JOIN users
    ON orders.user_id = users.id
ORDER BY orders.created_at DESC;

-- LEFT JOIN: include every user, including users with no orders.
SELECT
    users.name AS customer_name,
    orders.order_number,
    orders.status
FROM users
LEFT JOIN orders
    ON orders.user_id = users.id
ORDER BY users.name;

-- Join four related tables to show each order line with customer and product.
SELECT
    orders.order_number,
    users.email AS customer_email,
    products.name AS product_name,
    order_items.quantity,
    order_items.unit_price
FROM orders
INNER JOIN users
    ON orders.user_id = users.id
INNER JOIN order_items
    ON order_items.order_id = orders.id
INNER JOIN products
    ON order_items.product_id = products.id
ORDER BY orders.order_number, products.name;
