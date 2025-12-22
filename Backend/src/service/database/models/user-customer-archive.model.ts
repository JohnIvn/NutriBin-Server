import { Client } from 'pg';

export async function createUserCustomerArchiveTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE user_customer_status AS ENUM ('active', 'inactive', 'banned');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_customer_archive (
      customer_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      f_name text NOT NULL,
      l_name text NOT NULL,
      contact_number text UNIQUE,
      address text,
      email text UNIQUE NOT NULL,
      password text NOT NULL,
      date_created timestamptz DEFAULT now(),
      last_updated timestamptz DEFAULT now(),
      status user_customer_status DEFAULT 'active'
    );
  `);
}
