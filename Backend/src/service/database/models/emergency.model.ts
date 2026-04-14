import { Client } from 'pg';

export async function createEmergencyTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS emergency (
      emergency_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES user_customer(customer_id) ON DELETE CASCADE,
      machine_id uuid REFERENCES machine_serial(machine_serial_id) ON DELETE CASCADE,
      is_active boolean DEFAULT false,
      date_created timestamptz DEFAULT now()
    );
  `);
}
