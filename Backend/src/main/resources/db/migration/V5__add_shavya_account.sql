-- Migration V5: Add user, customer, and valid account for Shavya
INSERT INTO users (id, username, password_hash, full_name, email, role, status, created_at)
VALUES 
    ('a0000000-0000-0000-0000-000000000005', 'shavya', '$2a$10$zwC/5CuJ1cDterW6MvaLjOdr.4F3trauzAtZ5dtUnO8TaQoeHLX0e', 'Shavya', 'shavya@secureflow.bank', 'CUSTOMER', 'ACTIVE', NOW())
ON CONFLICT (username) DO NOTHING;

INSERT INTO customers (id, auth_user_id, full_name, email, phone, created_at)
VALUES 
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'Shavya', 'shavya@secureflow.bank', '+1 (555) 777-8899', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, customer_id, account_number, account_type, balance, currency, status, created_at)
VALUES 
    ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'SENT-5588-005', 'CURRENT', 50000.00, 'USD', 'ACTIVE', NOW())
ON CONFLICT (id) DO NOTHING;
