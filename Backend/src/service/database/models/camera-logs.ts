import { Client } from 'pg';

export async function createCameraLogsTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE classification_type AS ENUM ('N/A', 'small', 'medium', 'large');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS camera_logs (
      camera_log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      machine_id uuid,
      user_id text,
      details text,
      classification classification_type DEFAULT 'N/A',
      date_created timestamptz DEFAULT now()
    );
  `);
}
