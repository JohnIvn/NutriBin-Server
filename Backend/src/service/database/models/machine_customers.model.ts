import { Client } from 'pg';

export async function createMachineCustomersTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS machine_customers (
      machine_id uuid REFERENCES machines(machine_id) ON DELETE CASCADE,
      customer_id uuid REFERENCES user_customer(customer_id) ON DELETE CASCADE,
      date_created timestamptz DEFAULT now(),
      PRIMARY KEY (machine_id, customer_id)
    );
  `);
}
