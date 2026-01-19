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
      machine_id uuid REFERENCES machines(machine_id) ON DELETE SET NULL,
      user_id uuid REFERENCES user_customer(customer_id) ON DELETE SET NULL,
      description text,
      repair_status repair_status DEFAULT 'active',
      date_created timestamptz DEFAULT now()
    );
  `);
}
