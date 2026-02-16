import { Client } from 'pg';

export async function createSupportTable(client: Client) {
  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE ticket_status AS ENUM ('open', 'in-progress', 'resolved', 'closed');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);

  await client.query(`
    DO $$
    BEGIN
      CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    $$;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      ticket_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid REFERENCES user_customer(customer_id),
      subject text NOT NULL,
      description text,
      status ticket_status DEFAULT 'open',
      priority ticket_priority DEFAULT 'medium',
      assigned_to uuid,
      date_created timestamptz DEFAULT now(),
      last_updated timestamptz DEFAULT now()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS support_messages (
      message_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_id uuid REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
      sender_id uuid NOT NULL,
      sender_type text NOT NULL,
      message text NOT NULL,
      date_sent timestamptz DEFAULT now()
    );
  `);
}
