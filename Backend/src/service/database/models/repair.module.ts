import { Client } from 'pg';

export async function createRepairTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE repair_status AS ENUM ('active', 'accepted', 'cancelled', 'postponed');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS repair (
      repair_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      machine_id text,
      user_id text,
      first_name text,
      last_name text,
      description text,
      C1 boolean DEFAULT false,
      C2 boolean DEFAULT false,
      C3 boolean DEFAULT false,
      C4 boolean DEFAULT false,
      C5 boolean DEFAULT false,
      S1 boolean DEFAULT false,
      S2 boolean DEFAULT false,
      S3 boolean DEFAULT false,
      S4 boolean DEFAULT false,
      S5 boolean DEFAULT false,
      S6 boolean DEFAULT false,
      S7 boolean DEFAULT false,
      S8 boolean DEFAULT false,
      S9 boolean DEFAULT false,
      M1 boolean DEFAULT false,
      M2 boolean DEFAULT false,
      M3 boolean DEFAULT false,
      M4 boolean DEFAULT false,
      M5 boolean DEFAULT false,
      M6 boolean DEFAULT false,
      M7 boolean DEFAULT false,
      repair_status repair_status DEFAULT 'active',
      date_created timestamptz DEFAULT now()
    );
  `);
}
