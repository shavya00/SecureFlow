-- Migration V6: Keep only 3 accounts (Alexander Vance, Sarah Kim, Shavya) and remove extra accounts

-- 1. Repoint any transactions referencing Alex Chen's account to Shavya's account
UPDATE transactions
SET sender_account_id = 'b0000000-0000-0000-0000-000000000005'
WHERE sender_account_id = 'b0000000-0000-0000-0000-000000000004';

UPDATE transactions
SET receiver_account_id = 'b0000000-0000-0000-0000-000000000005'
WHERE receiver_account_id = 'b0000000-0000-0000-0000-000000000004';

-- 2. Repoint any ledger entries referencing Alex Chen's account to Shavya's account
UPDATE ledger_entries
SET account_id = 'b0000000-0000-0000-0000-000000000005'
WHERE account_id = 'b0000000-0000-0000-0000-000000000004';

-- 3. Repoint any transactions or ledger entries referencing Vance savings account to Vance current account
UPDATE transactions
SET sender_account_id = 'b0000000-0000-0000-0000-000000000001'
WHERE sender_account_id = 'b0000000-0000-0000-0000-000000000002';

UPDATE transactions
SET receiver_account_id = 'b0000000-0000-0000-0000-000000000001'
WHERE receiver_account_id = 'b0000000-0000-0000-0000-000000000002';

UPDATE ledger_entries
SET account_id = 'b0000000-0000-0000-0000-000000000001'
WHERE account_id = 'b0000000-0000-0000-0000-000000000002';

-- 4. Delete device telemetry for accounts being removed
DELETE FROM transaction_devices
WHERE account_id IN ('b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004');

-- 5. Delete the extra accounts (keeping only Alexander Vance, Sarah Kim, and Shavya)
DELETE FROM accounts 
WHERE account_number NOT IN ('SENT-4827-001', 'SENT-2613-003', 'SENT-5588-005');

-- 6. Delete extra customer Alex Chen
DELETE FROM customers WHERE id = 'c0000000-0000-0000-0000-000000000003';
