import { Client } from 'pg';

export async function createModuleAnalyticsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS module_analytics (
      module_analytics_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id text,
      esp32 boolean DEFAULT true,
      arduino_q boolean DEFAULT true,
      arduino_r3 boolean DEFAULT true,
      ultrasonic boolean DEFAULT true,
      reed boolean DEFAULT true,
      moisture boolean DEFAULT true,
      temperature boolean DEFAULT true,
      humidity boolean DEFAULT true,
      gas boolean DEFAULT true,
      ph boolean DEFAULT true,
      npk boolean DEFAULT true,
      camera_1 boolean DEFAULT true,
      camera_2 boolean DEFAULT true,
      stepper_motor boolean DEFAULT true,
      heating_pad boolean DEFAULT true,
      exhaust_fan boolean DEFAULT true,
      dc_motor boolean DEFAULT true,
      grinder_motor boolean DEFAULT true,
      power_supply boolean DEFAULT true,
      servo_motor boolean DEFAULT true,
      date_created timestamptz DEFAULT now()
    );
  `);
}
