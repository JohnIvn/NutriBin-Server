import { Client } from 'pg';

export async function createFirmwareTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS firmware (
      firmware_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      version text NOT NULL,
      build text,
      release_notes text,
      target_models text[] DEFAULT ARRAY[]::text[],
      checksum text,
      file_url text,
      status text DEFAULT 'Stable',
      uploaded_by text,
      release_date date DEFAULT CURRENT_DATE,
      created_at timestamptz DEFAULT now()
    );
  `);
}
