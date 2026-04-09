import { Client } from 'pg';

export async function createUserNotificationTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS user_notifications (
      notification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid NOT NULL REFERENCES user_customer(customer_id) ON DELETE CASCADE,
      header text NOT NULL,
      subheader text,
      type text NOT NULL,
      description text,
      date timestamptz DEFAULT now(),
      resolved boolean DEFAULT false,
      date_created timestamptz DEFAULT now()
    );
  `);
}
