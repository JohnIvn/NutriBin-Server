import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { BackupService } from '../database/backup.service';
import { DatabaseService } from '../database/database.service';
import chalk from 'chalk';

@Injectable()
export class ScheduledBackupService implements OnModuleInit {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly backupService: BackupService,
    private readonly databaseService: DatabaseService,
  ) {}

  onModuleInit() {
    this.scheduleBackups();
  }

  /**
   * Schedules automatic database backups
   * Default: Every day at 2:00 AM
   */
  scheduleBackups() {
    const cronExpression = process.env.BACKUP_CRON || '0 2 * * *'; // 2 AM daily
    const enabled = process.env.BACKUP_ENABLED !== 'false'; // Enabled by default

    if (!enabled) {
      console.log(chalk.yellow('[BACKUP] Scheduled backups are disabled'));
      return;
    }

    console.log(
      chalk.cyan(`[BACKUP] Scheduling automatic backups: ${cronExpression}`),
    );

    const job = new CronJob(cronExpression, async () => {
      console.log(chalk.yellow('[BACKUP] Running scheduled backup...'));

      try {
        const client = this.databaseService.getClient();
        const backupPath = await this.backupService.createFullBackup(client);

        console.log(
          chalk.green(`[BACKUP] Scheduled backup completed: ${backupPath}`),
        );

        // Clean old backups (keep last 30 for daily backups)
        this.backupService.cleanOldBackups(30);
      } catch (error) {
        console.error(chalk.red('[BACKUP] Scheduled backup failed:'), error);
      }
    });

    this.schedulerRegistry.addCronJob('database-backup', job);
    job.start();

    console.log(chalk.green('[BACKUP] Automatic backup schedule initialized'));
  }

  /**
   * Manually trigger a backup
   */
  async triggerManualBackup(): Promise<string> {
    console.log(chalk.yellow('[BACKUP] Manual backup triggered...'));

    try {
      const client = this.databaseService.getClient();
      const backupPath = await this.backupService.createFullBackup(client);

      console.log(
        chalk.green(`[BACKUP] Manual backup completed: ${backupPath}`),
      );

      return backupPath;
    } catch (error) {
      console.error(chalk.red('[BACKUP] Manual backup failed:'), error);
      throw error;
    }
  }

  /**
   * Stop scheduled backups
   */
  stopScheduledBackups() {
    try {
      const job = this.schedulerRegistry.getCronJob('database-backup');
      job.stop();
      console.log(chalk.yellow('[BACKUP] Scheduled backups stopped'));
    } catch (error) {
      console.error('[BACKUP] Error stopping scheduled backups:', error);
    }
  }

  /**
   * Get backup schedule status
   */
  getScheduleStatus() {
    try {
      const job = this.schedulerRegistry.getCronJob('database-backup');
      const nextDate = job.nextDate();
      const lastDate = job.lastDate();

      let nextRunStr = 'N/A';
      let lastRunStr = 'N/A';

      if (nextDate) {
        nextRunStr =
          nextDate instanceof Date
            ? nextDate.toISOString()
            : (nextDate as any).toJSDate().toISOString();
      }

      if (lastDate) {
        lastRunStr =
          lastDate instanceof Date
            ? lastDate.toISOString()
            : (lastDate as any).toJSDate().toISOString();
      }

      return {
        enabled: true,
        cronExpression: process.env.BACKUP_CRON || '0 2 * * *',
        nextRun: nextRunStr,
        lastRun: lastRunStr,
      };
    } catch (error) {
      return {
        enabled: false,
        cronExpression: process.env.BACKUP_CRON || '0 2 * * *',
        error: 'Scheduler not initialized',
      };
    }
  }
}
