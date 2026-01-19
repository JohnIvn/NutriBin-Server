import { Client } from 'pg';

export async function createFertilizerAnalyticsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS fertilizer_analytics (
      fertilizer_analytics_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES user_customer(customer_id) ON DELETE SET NULL,
      machine_id uuid REFERENCES machines(machine_id) ON DELETE SET NULL,
      nitrogen text,
      phosphorus text,
      potassium text,
      temperature text,
      ph text,
      humidity text,
      moisture text,
      methane text,
      hydrogen text,
      smoke text,
      benzene text,
      date_created timestamptz DEFAULT now()
    );
  `);
}
