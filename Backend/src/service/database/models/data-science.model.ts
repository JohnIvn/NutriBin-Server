import { Client } from 'pg';
import chalk from 'chalk';

export const createDataScienceTable = async (client: Client) => {
  const query = `
    CREATE TABLE IF NOT EXISTS data_science (
      id SERIAL PRIMARY KEY,
      machine_id uuid REFERENCES machines(machine_id) ON DELETE SET NULL,
      n NUMERIC(10, 2),
      p NUMERIC(10, 2),
      k NUMERIC(10, 2),
      ph NUMERIC(10, 2),
      recommended_plants_1 VARCHAR(255),
      csi_score_1 INTEGER,
      recommended_plants_2 VARCHAR(255),
      csi_score_2 INTEGER,
      recommended_plants_3 VARCHAR(255),
      csi_score_3 INTEGER,
      recommended_plants_4 VARCHAR(255),
      csi_score_4 INTEGER,
      recommended_plants_5 VARCHAR(255),
      csi_score_5 INTEGER,
      date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await client.query(query);
    console.log(chalk.green('[DATABASE] Data Science table is ready!'));
  } catch (error) {
    console.error(
      chalk.red('[DATABASE] Error creating Data Science table:'),
      error,
    );
  }
};
