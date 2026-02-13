import {
  Controller,
  Get,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Response } from 'express';
import { BackupService } from '../../service/database/backup.service';
import { DatabaseService } from '../../service/database/database.service';
import chalk from 'chalk';

@Controller('management/export')
export class DatabaseExportController {
  constructor(
    private readonly backupService: BackupService,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * Generates a database snapshot and downloads it directly to the user's computer
   * GET /management/export/snapshot
   */
  @Get('snapshot')
  async exportSnapshot(@Res() res: Response) {
    console.log(
      chalk.cyan('[EXPORT] User requested a direct database snapshot...'),
    );

    try {
      const client = this.databaseService.getClient();
      const sqlContent = await this.backupService.generateFullBackupSql(client);

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .split('T')[0];
      const filename = `nutribin_snapshot_${timestamp}.sql`;

      // Set headers to trigger file download in browser
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      // Send the SQL content
      return res.send(sqlContent);
    } catch (error) {
      console.error(
        chalk.red('[EXPORT] Failed to generate snapshot for download:'),
        error,
      );
      throw new InternalServerErrorException(
        'Failed to generate database export',
      );
    }
  }
}
