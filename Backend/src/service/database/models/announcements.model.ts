import { Client } from 'pg';

export async function createAnnouncementsTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE announcement_priority AS ENUM ('high', 'medium', 'low');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      announcement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text,
      body text,
      author text,
      priority announcement_priority DEFAULT 'medium',
      notified text[] DEFAULT ARRAY[]::text[],
      date_published date,
      is_active boolean DEFAULT true,
      date_created timestamptz DEFAULT now()
    );
  `);
}
