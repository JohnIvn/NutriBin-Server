import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import supabaseService from '../storage/supabase.service';

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
    checksum: string,
    uploadedBy: string,
  ): Promise<FirmwareRecord> {
    const client = this.databaseService.getClient();
    try {
      // 1. Upload to Supabase Storage
      const bucket = 'firmware';
      const path = `${Date.now()}-${file.originalname}`;

      await supabaseService.uploadBuffer(
        bucket,
        path,
        file.buffer,
        file.mimetype,
      );
      const fileUrl = supabaseService.getPublicUrl(bucket, path);

      // 2. Save record to Database
      const result = await client.query(
        `INSERT INTO firmware (version, build, release_notes, target_models, checksum, file_url, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          version,
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
      throw new InternalServerErrorException('Failed to upload firmware');
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
