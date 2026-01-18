import { Client } from 'pg';

export async function createUserStaffArchiveTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE user_staff_status AS ENUM ('active', 'inactive', 'banned');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_staff_archive (
      staff_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name text NOT NULL,
      last_name text NOT NULL,
      birthday text NOT NULL,
      age integer NOT NULL,
      contact_number text UNIQUE,
      address text,
      email text UNIQUE NOT NULL,
      password text NOT NULL,
      date_created timestamptz DEFAULT now(),
      last_updated timestamptz DEFAULT now(),
      archive_date timestamptz DEFAULT now(),
      status user_staff_status DEFAULT 'active'
    );
  `);
}
