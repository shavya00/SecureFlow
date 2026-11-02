-- Convert currency bpchar to varchar(3) for standard Hibernate validation
ALTER TABLE accounts ALTER COLUMN currency TYPE VARCHAR(3);
ALTER TABLE transactions ALTER COLUMN currency TYPE VARCHAR(3);
