import { Client } from 'pg';

export async function createSalesTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS sales (
      sale_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      sale_date date,
      amount numeric,
      region text,
      product text,
      quantity integer DEFAULT 1,
      customer_id uuid REFERENCES user_customer(customer_id) ON DELETE SET NULL,
      date_created timestamptz DEFAULT now()
    );
  `);
}
