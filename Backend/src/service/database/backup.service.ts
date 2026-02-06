import { Injectable } from '@nestjs/common';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

@Injectable()
export class BackupService {
  private backupDir = path.join(__dirname, '..', '..', '..', 'backups');

  constructor() {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Creates a full SQL backup of all tables and data from Supabase
   * @param client - PostgreSQL client instance
   * @returns Path to the created backup file
   */
  async createFullBackup(client: Client): Promise<string> {
    console.log(chalk.yellow('[BACKUP] Starting full database backup...'));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(this.backupDir, `backup_${timestamp}.sql`);

    let sqlContent = '';
    sqlContent += `-- NutriBin Server Database Backup\n`;
    sqlContent += `-- Created: ${new Date().toISOString()}\n`;
    sqlContent += `-- Database: Supabase PostgreSQL\n\n`;

    try {
      // Get all tables in the public schema
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `);

      const tables = tablesResult.rows.map((row) => row.table_name);
      console.log(
        chalk.cyan(`[BACKUP] Found ${tables.length} tables to backup`),
      );

      // Backup each table
      for (const tableName of tables) {
        console.log(
          chalk.blueBright(`[BACKUP] Backing up table: ${tableName}`),
        );

        // Get table schema (CREATE TABLE statement)
        const schemaSQL = await this.getTableSchema(client, tableName);
        sqlContent += `\n-- Table: ${tableName}\n`;
        sqlContent += `${schemaSQL}\n\n`;

        // Get table data (INSERT statements)
        const dataSQL = await this.getTableData(client, tableName);
        if (dataSQL) {
          sqlContent += dataSQL;
          sqlContent += `\n\n`;
        }
      }

      // Write to file
      fs.writeFileSync(backupFilePath, sqlContent, 'utf-8');

      console.log(chalk.green(`[BACKUP] Backup completed successfully!`));
      console.log(chalk.green(`[BACKUP] File saved to: ${backupFilePath}`));

      return backupFilePath;
    } catch (error) {
      console.error(chalk.red('[BACKUP] Error creating backup:'), error);
      throw error;
    }
  }

  /**
   * Gets the CREATE TABLE statement for a specific table
   */
  private async getTableSchema(
    client: Client,
    tableName: string,
  ): Promise<string> {
    // Get column information
    const columnsResult = await client.query(
      `
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        column_default,
        is_nullable,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `,
      [tableName],
    );

    // Get primary key information
    const pkResult = await client.query(
      `
      SELECT a.attname AS column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary;
    `,
      [tableName],
    );

    const primaryKeys = pkResult.rows.map((row) => row.column_name);

    // Get foreign key information
    const fkResult = await client.query(
      `
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_schema = 'public'
      AND tc.table_name = $1;
    `,
      [tableName],
    );

    // Build CREATE TABLE statement
    let createTableSQL = `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
    createTableSQL += `CREATE TABLE "${tableName}" (\n`;

    const columnDefs = columnsResult.rows.map((col) => {
      let colDef = `  "${col.column_name}" `;

      // Handle data type
      if (col.data_type === 'USER-DEFINED') {
        colDef += col.udt_name;
      } else if (col.data_type === 'character varying') {
        colDef += col.character_maximum_length
          ? `VARCHAR(${col.character_maximum_length})`
          : 'VARCHAR';
      } else if (col.data_type === 'character') {
        colDef += col.character_maximum_length
          ? `CHAR(${col.character_maximum_length})`
          : 'CHAR';
      } else {
        colDef += col.data_type.toUpperCase();
      }

      // Handle NOT NULL
      if (col.is_nullable === 'NO') {
        colDef += ' NOT NULL';
      }

      // Handle DEFAULT
      if (col.column_default) {
        colDef += ` DEFAULT ${col.column_default}`;
      }

      return colDef;
    });

    createTableSQL += columnDefs.join(',\n');

    // Add primary key constraint
    if (primaryKeys.length > 0) {
      const pkColumns = primaryKeys.map((pk) => `"${pk}"`).join(', ');
      createTableSQL += `,\n  PRIMARY KEY (${pkColumns})`;
    }

    createTableSQL += `\n);`;

    // Add foreign key constraints
    if (fkResult.rows.length > 0) {
      createTableSQL += `\n`;
      for (const fk of fkResult.rows) {
        createTableSQL += `\nALTER TABLE "${tableName}" ADD CONSTRAINT fk_${tableName}_${fk.column_name} `;
        createTableSQL += `FOREIGN KEY ("${fk.column_name}") `;
        createTableSQL += `REFERENCES "${fk.foreign_table_name}" ("${fk.foreign_column_name}")`;
        if (fk.delete_rule !== 'NO ACTION') {
          createTableSQL += ` ON DELETE ${fk.delete_rule}`;
        }
        if (fk.update_rule !== 'NO ACTION') {
          createTableSQL += ` ON UPDATE ${fk.update_rule}`;
        }
        createTableSQL += `;`;
      }
    }

    return createTableSQL;
  }

  /**
   * Gets INSERT statements for all data in a table
   */
  private async getTableData(
    client: Client,
    tableName: string,
  ): Promise<string> {
    try {
      // Get all data from the table
      const dataResult = await client.query(`SELECT * FROM "${tableName}";`);

      if (dataResult.rows.length === 0) {
        return `-- No data in table ${tableName}\n`;
      }

      const columns = Object.keys(dataResult.rows[0]);
      const columnList = columns.map((col) => `"${col}"`).join(', ');

      let insertSQL = `-- Data for table ${tableName}\n`;

      // Generate INSERT statements in batches for better performance
      const batchSize = 100;
      for (let i = 0; i < dataResult.rows.length; i += batchSize) {
        const batch = dataResult.rows.slice(i, i + batchSize);

        insertSQL += `INSERT INTO "${tableName}" (${columnList}) VALUES\n`;

        const values = batch.map((row, index) => {
          const rowValues = columns
            .map((col) => {
              const value = row[col];
              if (value === null || value === undefined) {
                return 'NULL';
              } else if (typeof value === 'string') {
                // Escape single quotes in strings
                return `'${value.replace(/'/g, "''")}'`;
              } else if (typeof value === 'boolean') {
                return value ? 'TRUE' : 'FALSE';
              } else if (value instanceof Date) {
                return `'${value.toISOString()}'`;
              } else if (typeof value === 'object') {
                // Handle JSON/JSONB columns
                return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
              } else {
                return value;
              }
            })
            .join(', ');

          return `  (${rowValues})`;
        });

        insertSQL += values.join(',\n');
        insertSQL += `;\n\n`;
      }

      console.log(
        chalk.gray(
          `  └─ Backed up ${dataResult.rows.length} rows from ${tableName}`,
        ),
      );

      return insertSQL;
    } catch (error) {
      console.error(
        chalk.red(`[BACKUP] Error getting data for table ${tableName}:`),
        error,
      );
      return `-- Error backing up data for table ${tableName}\n`;
    }
  }

  /**
   * Lists all available backup files
   */
  listBackups(): string[] {
    try {
      const files = fs.readdirSync(this.backupDir);
      return files
        .filter((file) => file.endsWith('.sql'))
        .sort()
        .reverse(); // Most recent first
    } catch (error) {
      console.error(chalk.red('[BACKUP] Error listing backups:'), error);
      return [];
    }
  }

  /**
   * Deletes old backup files, keeping only the specified number of most recent backups
   */
  cleanOldBackups(keepCount: number = 10): void {
    try {
      const backups = this.listBackups();

      if (backups.length > keepCount) {
        const toDelete = backups.slice(keepCount);
        console.log(
          chalk.yellow(`[BACKUP] Deleting ${toDelete.length} old backup(s)...`),
        );

        for (const backup of toDelete) {
          const filePath = path.join(this.backupDir, backup);
          fs.unlinkSync(filePath);
          console.log(chalk.gray(`  └─ Deleted: ${backup}`));
        }
      }
    } catch (error) {
      console.error(chalk.red('[BACKUP] Error cleaning old backups:'), error);
    }
  }

  /**
   * Gets the backup directory path
   */
  getBackupDirectory(): string {
    return this.backupDir;
  }
}
