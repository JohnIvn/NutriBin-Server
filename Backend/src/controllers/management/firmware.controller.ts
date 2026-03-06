import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  FirmwareRecord,
  FirmwareService,
} from '../../service/firmware/firmware.service';
import { DatabaseService } from '../../service/database/database.service';

@Controller('management/firmware')
export class FirmwareController {
  constructor(
    private readonly firmwareService: FirmwareService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get('history')
  async getHistory(): Promise<FirmwareRecord[]> {
    return this.firmwareService.getAllFirmware();
  }

  @Get('latest')
  async getLatest(
    @Query('model') model?: string,
  ): Promise<FirmwareRecord | null> {
    return this.firmwareService.getLatestFirmware(model);
  }

  @Get('machines')
  async getMachinesStatus(): Promise<any[]> {
    return this.firmwareService.getMachineFirmwareStatus();
  }

  @Get('propagation')
  async getPropagation(): Promise<any[]> {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(`
        SELECT 
          m.machine_id,
          ms.serial_number as name,
          ms.machine_serial_id as id,
          m.firmware_version as current,
          m.target_firmware_version as target,
          m.update_status as status,
          m.update_progress as "update progress",
          m.last_update_attempt as last
        FROM machines m
        JOIN machine_serial ms ON m.machine_id = ms.machine_serial_id
        WHERE m.update_status != 'success' OR m.last_update_attempt > NOW() - INTERVAL '24 hours'
        ORDER BY m.last_update_attempt DESC
      `);
      return result.rows;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to fetch propagation status',
      );
    }
  }

  @Post('create')
  async createVersion(
    @Body('version') version: string,
    @Body('releaseNotes') releaseNotes: string,
    @Body('targetModels') targetModels: string | string[],
    @Body('uploadedBy') uploadedBy: string,
    @Body('notifyMachines') notifyMachines?: boolean,
    @Body('createAnnouncement') createAnnouncement?: boolean,
  ): Promise<FirmwareRecord> {
    const models = (
      typeof targetModels === 'string' ? JSON.parse(targetModels) : targetModels
    ) as string[];
    return this.firmwareService.createNewVersion(
      version,
      releaseNotes,
      models,
      uploadedBy,
      notifyMachines,
      createAnnouncement,
    );
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFirmware(
    @UploadedFile() file: Express.Multer.File,
    @Body('version') version: string,
    @Body('releaseNotes') releaseNotes: string,
    @Body('targetModels') targetModels: string | string[],
    @Body('uploadedBy') uploadedBy: string,
    @Body('notifyMachines') notifyMachines?: string | boolean,
    @Body('createAnnouncement') createAnnouncement?: string | boolean,
  ): Promise<FirmwareRecord> {
    const models = (
      typeof targetModels === 'string' ? JSON.parse(targetModels) : targetModels
    ) as string[];

    const shouldNotify =
      typeof notifyMachines === 'string'
        ? notifyMachines === 'true'
        : !!notifyMachines;
    const shouldAnnounce =
      typeof createAnnouncement === 'string'
        ? createAnnouncement === 'true'
        : !!createAnnouncement;

    return this.firmwareService.uploadFirmware(
      file,
      version,
      releaseNotes,
      models,
      uploadedBy,
      shouldNotify,
      shouldAnnounce,
    );
  }

  @Delete(':id')
  async deleteFirmware(@Param('id') id: string) {
    return this.firmwareService.deleteFirmware(id);
  }
}
