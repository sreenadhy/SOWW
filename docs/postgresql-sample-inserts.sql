INSERT INTO users (
    id,
    primary_phone_number,
    secondary_phone_number,
    name,
    role,
    created_at
) VALUES
    (1, '9876543210', '9123456780', 'Sritha Customer', 'ROLE_USER', CURRENT_TIMESTAMP);

INSERT INTO addresses (
    id,
    user_id,
    full_address,
    city,
    state,
    pincode,
    is_default,
    created_at
) VALUES
    (1, 1, '12 Market Street, Near Temple Road', 'Chennai', 'Tamil Nadu', '600001', TRUE, CURRENT_TIMESTAMP);

INSERT INTO products (
    id,
    name,
    description,
    price,
    image_url,
    available_stock,
    unit,
    created_at
) VALUES
    (1, 'Cold Pressed Coconut Oil', 'Traditional wood-pressed coconut oil with a clean aroma and smooth finish.', 320.00, '/images/products/coconut-oil.jpg', 50, '1L', CURRENT_TIMESTAMP),
    (2, 'Groundnut Cooking Oil', 'Rich and flavorful groundnut oil ideal for deep frying and daily cooking.', 280.00, '/images/products/groundnut-oil.jpg', 45, '1L', CURRENT_TIMESTAMP);

INSERT INTO orders (
    id,
    order_number,
    user_id,
    address_id,
    subtotal,
    shipping_fee,
    total_amount,
    order_status,
    created_at
) VALUES
    (1, 'SO-20260402090000-1024', 1, 1, 920.00, 60.00, 980.00, 'PENDING', CURRENT_TIMESTAMP);

INSERT INTO order_items (
    id,
    order_id,
    product_id,
    quantity,
    price
) VALUES
    (1, 1, 1, 2, 320.00),
    (2, 1, 2, 1, 280.00);

INSERT INTO order_tracking (
    id,
    order_id,
    status,
    updated_at,
    remarks
) VALUES
    (1, 1, 'PLACED', CURRENT_TIMESTAMP, 'Order placed successfully'),
    (2, 1, 'PACKED', CURRENT_TIMESTAMP, 'Packed and ready for dispatch');
