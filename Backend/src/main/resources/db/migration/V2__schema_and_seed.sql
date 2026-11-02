-- ==============================================================
-- SecureFlow Database Migration V2: Schema Enhancements & Seed
-- ==============================================================

-- 1. Create Users Table for Spring Security Authentication & Personas
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enhance transactions table with reference, reason, and telemetry fields
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference_id VARCHAR(64) UNIQUE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- 3. Enhance fraud_rules table with rule code, time window, and action
ALTER TABLE fraud_rules ADD COLUMN IF NOT EXISTS rule_code VARCHAR(50) UNIQUE;
ALTER TABLE fraud_rules ADD COLUMN IF NOT EXISTS time_window_seconds INT DEFAULT 0;
ALTER TABLE fraud_rules ADD COLUMN IF NOT EXISTS action VARCHAR(20) DEFAULT 'FLAG';

-- 4. Seed Demo Personas (BCrypt encrypted passwords)
INSERT INTO users (id, username, password_hash, full_name, email, role, status, created_at)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'customer', '$2a$10$zwC/5CuJ1cDterW6MvaLjOdr.4F3trauzAtZ5dtUnO8TaQoeHLX0e', 'Alexander Vance', 'customer@secureflow.bank', 'CUSTOMER', 'ACTIVE', NOW() - INTERVAL '30 days'),
    ('a0000000-0000-0000-0000-000000000002', 'analyst', '$2a$10$l9D9uWsePjV8IIMkaca68OpLNxrkUzzX7xAnoos1RHltdvJZi3hnG', 'Jane Doe (Fraud Analyst)', 'analyst@secureflow.bank', 'FRAUD_ANALYST', 'ACTIVE', NOW() - INTERVAL '30 days'),
    ('a0000000-0000-0000-0000-000000000003', 'admin', '$2a$10$BSBWrmvgW5YF8LDkCoNi3ejgivwUSZfeV0pdUTMcctLmP7IeCqZOK', 'Chief Risk Officer', 'admin@secureflow.bank', 'ADMIN', 'ACTIVE', NOW() - INTERVAL '30 days')
ON CONFLICT (username) DO NOTHING;

-- 5. Seed Customers
INSERT INTO customers (id, auth_user_id, full_name, email, phone, created_at)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Alexander Vance', 'customer@secureflow.bank', '+1 (555) 234-5678', NOW() - INTERVAL '30 days'),
    ('c0000000-0000-0000-0000-000000000002', NULL, 'Sarah Kim', 'sarah.kim@fintech.io', '+1 (555) 987-6543', NOW() - INTERVAL '25 days'),
    ('c0000000-0000-0000-0000-000000000003', NULL, 'Alex Chen', 'alex.chen@globalcorp.com', '+1 (555) 456-7890', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Accounts (Constraint: account_type in ('SAVINGS', 'CURRENT'))
INSERT INTO accounts (id, customer_id, account_number, account_type, balance, currency, status, created_at)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'SENT-4827-001', 'CURRENT', 48250.75, 'USD', 'ACTIVE', NOW() - INTERVAL '30 days'),
    ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'SENT-7391-002', 'SAVINGS', 125000.00, 'USD', 'ACTIVE', NOW() - INTERVAL '30 days'),
    ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'SENT-2613-003', 'CURRENT', 34500.00, 'USD', 'ACTIVE', NOW() - INTERVAL '25 days'),
    ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'SENT-9056-004', 'CURRENT', 89000.00, 'USD', 'ACTIVE', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed 7 Heuristic Fraud Rules
INSERT INTO fraud_rules (id, rule_name, rule_code, description, risk_points, threshold, time_window_seconds, action, enabled, created_at)
VALUES 
    ('f0000000-0000-0000-0000-000000000001', 'Unusually Large Transaction', 'RULE_LARGE_AMOUNT', 'Flags single transfer transactions exceeding $10,000 threshold', 25.0, 10000.00, 0, 'FLAG', TRUE, NOW()),
    ('f0000000-0000-0000-0000-000000000002', 'Rapid Multiple Transactions', 'RULE_RAPID_TXN', 'Detects rapid velocity bursts (3 or more transactions within 120 seconds)', 20.0, 3.0, 120, 'FLAG', TRUE, NOW()),
    ('f0000000-0000-0000-0000-000000000003', 'Unusual Transaction Frequency', 'RULE_UNUSUAL_FREQ', 'Flags accounts exceeding normal transaction density (5 or more in 1 hour)', 15.0, 5.0, 3600, 'FLAG', TRUE, NOW()),
    ('f0000000-0000-0000-0000-000000000004', 'Insufficient Balance Shortfall', 'RULE_INSUFFICIENT_BALANCE', 'Rejects transfers where requested amount exceeds liquid account balance', 30.0, 0.0, 0, 'BLOCK', TRUE, NOW()),
    ('f0000000-0000-0000-0000-000000000005', 'Suspicious Geolocation Velocity', 'RULE_GEO_VELOCITY', 'Uses Haversine formula to detect physically impossible travel speeds (> 800 km/h)', 25.0, 800.0, 0, 'FLAG', TRUE, NOW()),
    ('f0000000-0000-0000-0000-000000000006', 'Repeated Failed Attempts', 'RULE_REPEAT_FAIL', 'Detects repeated failed transaction attempts (3 or more in 300 seconds)', 15.0, 3.0, 300, 'HOLD', TRUE, NOW()),
    ('f0000000-0000-0000-0000-000000000007', 'Structuring / Smurfing Pattern', 'RULE_STRUCTURING', 'Detects transactions just below $10,000 regulatory reporting threshold ($8,500 - $9,999)', 20.0, 8500.00, 0, 'FLAG', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Initial Completed Transactions & Balanced Ledger Entries
INSERT INTO transactions (id, reference_id, sender_account_id, receiver_account_id, amount, currency, transaction_type, status, description, risk_score, failure_reason, location, ip_address, created_at)
VALUES 
    ('d0000000-0000-0000-0000-000000000001', 'TXN-78420', 'b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 4800.00, 'USD', 'TRANSFER', 'COMPLETED', 'Salary Deposit from Alex Chen', 8.0, NULL, 'New York, USA', '192.168.10.45', NOW() - INTERVAL '2 days'),
    ('d0000000-0000-0000-0000-000000000002', 'TXN-78421', 'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 1250.00, 'USD', 'TRANSFER', 'COMPLETED', 'Direct Transfer to Sarah Kim', 12.0, NULL, 'New York, USA', '192.168.10.45', NOW() - INTERVAL '1 day' - INTERVAL '4 hours'),
    ('d0000000-0000-0000-0000-000000000003', 'TXN-78418', 'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 750.00, 'USD', 'TRANSFER', 'COMPLETED', 'Reimbursement to Sarah Kim', 15.0, NULL, 'New York, USA', '192.168.10.45', NOW() - INTERVAL '18 hours'),
    ('d0000000-0000-0000-0000-000000000004', 'TXN-78419', 'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 9200.00, 'USD', 'TRANSFER', 'FLAGGED', 'High Value Commercial Transfer', 65.0, 'Flagged by RULE_STRUCTURING: Amount in structuring range', 'London, UK', '82.165.197.1', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Double-Entry Ledger for Txn 1 (Alex Chen -> Alexander Vance)
INSERT INTO ledger_entries (id, transaction_id, account_id, entry_type, amount, created_at)
VALUES 
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'DEBIT', 4800.00, NOW() - INTERVAL '2 days'),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'CREDIT', 4800.00, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Double-Entry Ledger for Txn 2 (Alexander Vance -> Sarah Kim)
INSERT INTO ledger_entries (id, transaction_id, account_id, entry_type, amount, created_at)
VALUES 
    ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'DEBIT', 1250.00, NOW() - INTERVAL '1 day' - INTERVAL '4 hours'),
    ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'CREDIT', 1250.00, NOW() - INTERVAL '1 day' - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- Double-Entry Ledger for Txn 3 (Alexander Vance -> Sarah Kim)
INSERT INTO ledger_entries (id, transaction_id, account_id, entry_type, amount, created_at)
VALUES 
    ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'DEBIT', 750.00, NOW() - INTERVAL '18 hours'),
    ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'CREDIT', 750.00, NOW() - INTERVAL '18 hours')
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Fraud Alert for Txn 4 (investigation_status in ('OPEN', 'INVESTIGATING', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'RESOLVED'))
INSERT INTO fraud_alerts (id, transaction_id, risk_score, severity, fraud_category, explanation, investigation_status, created_at)
VALUES 
    ('a1000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 65.0, 'HIGH', 'STRUCTURING', 'Transaction amount $9,200 matches structuring heuristic range ($8,500-$9,999) + Geolocation shift London', 'INVESTIGATING', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Initial Investigation Note
INSERT INTO investigation_notes (id, fraud_alert_id, investigator_id, note, created_at)
VALUES 
    ('11000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Case opened by Fraud Analyst. Sender account under behavioral review.', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- 11. Seed Device Telemetry
INSERT INTO transaction_devices (id, account_id, device_fingerprint, ip_address, location, last_seen)
VALUES 
    ('90000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'dev-Mozilla/5.0-Win64', '192.168.10.45'::inet, 'New York, USA', NOW() - INTERVAL '18 hours'),
    ('90000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'dev-Mozilla/5.0-Macintosh', '82.165.197.1'::inet, 'London, UK', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- 12. Seed Audit Logs
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, ip_address, created_at)
VALUES 
    ('80000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'USER_LOGIN', 'USER', 'a0000000-0000-0000-0000-000000000001', '{"device": "Chrome Windows", "status": "SUCCESS"}'::jsonb, '192.168.10.45'::inet, NOW() - INTERVAL '1 day'),
    ('80000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'TRANSFER_SETTLED', 'TRANSACTION', 'd0000000-0000-0000-0000-000000000002', '{"amount": 1250.00, "status": "COMPLETED"}'::jsonb, '192.168.10.45'::inet, NOW() - INTERVAL '1 day' - INTERVAL '4 hours'),
    ('80000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'ALERT_TRIAGED', 'FRAUD_ALERT', 'a1000000-0000-0000-0000-000000000001', '{"newStatus": "INVESTIGATING", "severity": "HIGH"}'::jsonb, '127.0.0.1'::inet, NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;
