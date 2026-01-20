import { Client } from 'pg';

export async function createLoginAttemptsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      attempt_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      staff_id text,
      admin_id text,
      customer_id uuid,
      user_type user_type DEFAULT 'N/A',
      ip_address text,
      success boolean DEFAULT true,
      date_created timestamptz DEFAULT now()
    );
  `);
}
