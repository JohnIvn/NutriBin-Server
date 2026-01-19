import { Client } from 'pg';

export async function createCodesTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE code_purpose AS ENUM ('password_reset', 'mfa', 'email_verification', 'other');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS codes (
      code_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      code varchar(16) NOT NULL,
      purpose code_purpose NOT NULL,
      expires_at timestamptz NOT NULL,
      used boolean DEFAULT false,
      created_at timestamptz DEFAULT now()
    );
  `);
}
