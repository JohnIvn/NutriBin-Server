import { Client } from 'pg';

export async function createMachinesTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS machines (
      machine_id uuid PRIMARY KEY REFERENCES machine_serial(machine_serial_id) ON DELETE RESTRICT,
      is_active BOOLEAN DEFAULT true,
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
      date_created timestamptz DEFAULT now()
    );
  `);
}
