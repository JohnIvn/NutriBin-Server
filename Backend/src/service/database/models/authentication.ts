import { Client } from 'pg';

export async function createAuthenticationTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE authentication_type AS ENUM ('N/A', 'email', 'sms');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE user_type AS ENUM ('N/A', 'staff', 'admin', 'customer');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS authentication (
      authentication_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      staff_id text,
      admin_id text,
      customer_id uuid REFERENCES user_customer(customer_id) ON DELETE SET NULL,
      user_type user_type DEFAULT 'N/A',
      authentication_type authentication_type DEFAULT 'N/A',
      enabled boolean DEFAULT false,
      mfa_token varchar(256),
      mfa_token_expiry timestamptz,
      date_created timestamptz DEFAULT now()
    );
  `);

  // Add unique constraints if they don't already exist
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_staff_id' AND conrelid = 'authentication'::regclass
      ) THEN
        ALTER TABLE authentication ADD CONSTRAINT unique_staff_id UNIQUE (staff_id);
      END IF;
    END;
    $$;
  `);

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_admin_id' AND conrelid = 'authentication'::regclass
      ) THEN
        ALTER TABLE authentication ADD CONSTRAINT unique_admin_id UNIQUE (admin_id);
      END IF;
    END;
    $$;
  `);
}
