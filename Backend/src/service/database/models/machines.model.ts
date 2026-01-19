import { Client } from 'pg';

export async function createMachinesTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS machines (
      machine_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES user_customer(customer_id) ON DELETE SET NULL,
      is_active BOOLEAN DEFAULT true,
      date_created timestamptz DEFAULT now()
    );
  `);
}
