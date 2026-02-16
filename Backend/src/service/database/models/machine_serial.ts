import { Client } from 'pg';

export async function createMachineSerialTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS machine_serial (
      machine_serial_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      serial_number VARCHAR(255) UNIQUE NOT NULL,
      model VARCHAR(255) NOT NULL,
      is_used boolean DEFAULT false,
      is_active boolean DEFAULT true,
      date_created timestamptz DEFAULT now()
    );
  `);
}
