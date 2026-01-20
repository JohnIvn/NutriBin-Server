import { Client } from 'pg';

export async function createTrashLogsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS trash_logs (
      log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      machine_id uuid REFERENCES machines(machine_id) ON DELETE SET NULL,
      nitrogen text,
      phosphorus text,
      potassium text,
      moisture text,
      humidity text,
      temperature text,
      ph text,
      date_created timestamptz DEFAULT now()
    );
  `);
}
