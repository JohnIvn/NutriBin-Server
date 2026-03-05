import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import supabaseService from '../storage/supabase.service';
import * as crypto from 'crypto';

export interface FirmwareRecord {
  firmware_id: string;
  version: string;
  build: string;
  release_notes: string;
  target_models: string[];
  checksum: string;
  file_url: string;
  status: string;
  uploaded_by: string;
  release_date: Date;
  created_at: Date;
}

@Injectable()
export class FirmwareService {
  constructor(private readonly databaseService: DatabaseService) {}

  async uploadFirmware(
    file: Express.Multer.File,
    version: string,
    releaseNotes: string,
    targetModels: string[],
    uploadedBy: string,
  ): Promise<FirmwareRecord> {
    const client = this.databaseService.getClient();
    try {
      // 1. Format version: ensure it starts with 'v' and matches v0.0.0 format
      let formattedVersion = version;
      if (!formattedVersion.startsWith('v')) {
        formattedVersion = 'v' + formattedVersion;
      }

      const versionRegex = /^v\d+\.\d+\.\d+$/;
      if (!versionRegex.test(formattedVersion)) {
        throw new BadRequestException('Version must follow the format v0.0.0');
      }

      // Check if version already exists
      const existing = await client.query(
        'SELECT firmware_id FROM firmware WHERE version = $1',
        [formattedVersion],
      );
      if (existing.rows.length > 0) {
        throw new BadRequestException(
          `Version ${formattedVersion} already exists`,
        );
      }

      // 2. Auto-generate checksum
      const checksum = crypto
        .createHash('sha256')
        .update(file.buffer)
        .digest('hex');

      // 3. Upload to Supabase Storage
      const bucket = 'firmware';
      const path = `${Date.now()}-${file.originalname}`;

      await supabaseService.uploadBuffer(
        bucket,
        path,
        file.buffer,
        file.mimetype,
      );
      const fileUrl = supabaseService.getPublicUrl(bucket, path);

      // 4. Save record to Database
      const result = await client.query(
        `INSERT INTO firmware (version, build, release_notes, target_models, checksum, file_url, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          formattedVersion,
          checksum.substring(0, 10),
          releaseNotes,
          targetModels,
          checksum,
          fileUrl,
          uploadedBy,
        ],
      );

      return result.rows[0] as FirmwareRecord;
    } catch (error) {
      console.error('Error uploading firmware:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to upload firmware');
    }
  }

  async createNewVersion(
    version: string,
    releaseNotes: string,
    targetModels: string[],
    uploadedBy: string,
  ): Promise<FirmwareRecord> {
    const client = this.databaseService.getClient();
    try {
      // 1. Format version
      let formattedVersion = version;
      if (!formattedVersion.startsWith('v')) {
        formattedVersion = 'v' + formattedVersion;
      }

      const versionRegex = /^v\d+\.\d+\.\d+$/;
      if (!versionRegex.test(formattedVersion)) {
        throw new BadRequestException('Version must follow the format v0.0.0');
      }

      // Check if version already exists
      const existing = await client.query(
        'SELECT firmware_id FROM firmware WHERE version = $1',
        [formattedVersion],
      );
      if (existing.rows.length > 0) {
        throw new BadRequestException(
          `Version ${formattedVersion} already exists`,
        );
      }

      // 2. Save record to Database (file_url null, checksum auto-generated from metadata if no file)
      // For a "new version" without file, we might just set checksum to something or leave it null
      // The user said "checksum auto generate, the file url null"
      const dummyData = `${formattedVersion}-${Date.now()}`;
      const checksum = crypto
        .createHash('sha256')
        .update(dummyData)
        .digest('hex');

      const result = await client.query(
        `INSERT INTO firmware (version, build, release_notes, target_models, checksum, file_url, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          formattedVersion,
          'Draft',
          releaseNotes,
          targetModels,
          checksum,
          null, // file_url null as requested
          uploadedBy,
        ],
      );

      return result.rows[0] as FirmwareRecord;
    } catch (error) {
      console.error('Error creating new firmware version:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Failed to create new firmware version',
      );
    }
  }

  async getMachineFirmwareStatus(): Promise<any[]> {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(`
        SELECT 
          m.machine_id,
          ms.serial_number,
          ms.model as model_no,
          m.firmware_version,
          m.update_status,
          m.last_update_attempt,
          ARRAY_REMOVE(ARRAY_AGG(uc.first_name || ' ' || uc.last_name), NULL) as user_names
        FROM machines m
        JOIN machine_serial ms ON m.machine_id = ms.machine_serial_id
        LEFT JOIN machine_customers mc ON m.machine_id = mc.machine_id
        LEFT JOIN user_customer uc ON mc.customer_id = uc.customer_id
        GROUP BY m.machine_id, ms.serial_number, ms.model, m.firmware_version, m.update_status, m.last_update_attempt
        ORDER BY m.last_update_attempt DESC NULLS LAST
      `);
      return result.rows;
    } catch (error) {
      console.error('Error fetching machine firmware status:', error);
      throw new InternalServerErrorException(
        'Failed to fetch machine firmware status',
      );
    }
  }

  async getAllFirmware(): Promise<FirmwareRecord[]> {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        'SELECT * FROM firmware ORDER BY created_at DESC',
      );
      return result.rows as FirmwareRecord[];
    } catch (error) {
      console.error('Error fetching firmware history:', error);
      throw new InternalServerErrorException(
        'Failed to fetch firmware history',
      );
    }
  }

  async getLatestFirmware(model?: string): Promise<FirmwareRecord | null> {
    const client = this.databaseService.getClient();
    try {
      let query = "SELECT * FROM firmware WHERE status = 'Stable'";
      const params: any[] = [];

      if (model) {
        query += ' AND $1 = ANY(target_models)';
        params.push(model);
      }

      query += ' ORDER BY created_at DESC LIMIT 1';

      const result = await client.query(query, params);
      return (result.rows[0] as FirmwareRecord) || null;
    } catch (error) {
      console.error('Error fetching latest firmware:', error);
      throw new InternalServerErrorException('Failed to fetch latest firmware');
    }
  }

  async deleteFirmware(firmwareId: string) {
    const client = this.databaseService.getClient();
    try {
      // Get file URL first to delete from storage
      const recordResult = await client.query(
        'SELECT file_url FROM firmware WHERE firmware_id = $1',
        [firmwareId],
      );
      if (recordResult.rows.length === 0)
        throw new NotFoundException('Firmware not found');

      const fileUrl = (recordResult.rows[0] as { file_url: string }).file_url;
      if (fileUrl) {
        const urlParts = fileUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await supabaseService.remove('firmware', fileName);
      }

      await client.query('DELETE FROM firmware WHERE firmware_id = $1', [
        firmwareId,
      ]);
      return { success: true };
    } catch (error) {
      console.error('Error deleting firmware:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete firmware');
    }
  }
}
