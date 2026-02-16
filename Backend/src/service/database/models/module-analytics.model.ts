import { Client } from 'pg';

export async function createModuleAnalyticsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS module_analytics (
      module_analytics_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES user_customer(customer_id) ON DELETE SET NULL,
      arduino_q boolean DEFAULT true,
      esp32_filter boolean DEFAULT true,
      esp32_servo_w_sensors boolean DEFAULT true,
      esp32_sensors boolean DEFAULT true,
      camera boolean DEFAULT true,
      humidity boolean DEFAULT true,
      methane boolean DEFAULT true,
      carbon_monoxide boolean DEFAULT true,
      air_quality boolean DEFAULT true,
      combustible_gassy boolean DEFAULT true,
      npk boolean DEFAULT true,
      moisture boolean DEFAULT true,
      reed boolean DEFAULT true,
      ultrasonic boolean DEFAULT true,
      weight boolean DEFAULT true,
      servo_lid_a boolean DEFAULT true,
      servo_lid_b boolean DEFAULT true,
      servo_mixer boolean DEFAULT true,
      motor_grinder boolean DEFAULT true,
      exhaust_fan_out boolean DEFAULT true,
      date_created timestamptz DEFAULT now()
    );
  `);
}
