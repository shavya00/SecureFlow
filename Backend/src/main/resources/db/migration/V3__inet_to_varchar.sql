-- Convert inet and jsonb columns to text/varchar for seamless JPA Hibernate mapping
ALTER TABLE transaction_devices ALTER COLUMN ip_address TYPE VARCHAR(45) USING ip_address::text;
ALTER TABLE audit_logs ALTER COLUMN ip_address TYPE VARCHAR(45) USING ip_address::text;
ALTER TABLE audit_logs ALTER COLUMN details TYPE TEXT USING details::text;
