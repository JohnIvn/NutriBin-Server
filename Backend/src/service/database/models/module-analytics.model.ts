import { Client } from 'pg';

export async function createModuleTableAnalytics(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS modules-analytics (
      module_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_idt text,
      ESP32 BOOLEAN DEFAULT true,
      ARDUINO Q BOOLEAN DEFAULT true,
      ARDUINO R3 BOOLEAN DEFAULT true,
      ULTRASONIC BOOLEAN DEFAULT true,
      REED BOOLEAN DEFAULT true,
      MOISTURE BOOLEAN DEFAULT true,
      TEMPERATURE BOOLEAN DEFAULT true,
      HUMIDITY BOOLEAN DEFAULT true,
      GAS BOOLEAN DEFAULT true,
      PH BOOLEAN DEFAULT true,
      NPK BOOLEAN DEFAULT true,
      CAMERA 1 BOOLEAN DEFAULT true,
      CAMERA 2 BOOLEAN DEFAULT true,
      STEPPER MOTOR BOOLEAN DEFAULT true,
      HEATING PAD BOOLEAN DEFAULT true,
      EXHAUST FAN BOOLEAN DEFAULT true,
      DC MOTOR BOOLEAN DEFAULT true,
      GRINDER MOTOR BOOLEAN DEFAULT true,
      POWER SUPPLY BOOLEAN DEFAULT true,
      SERVO MOTOR BOOLEAN DEFAULT true,
      date_created timestamptz DEFAULT now()
    );
  `);
}
