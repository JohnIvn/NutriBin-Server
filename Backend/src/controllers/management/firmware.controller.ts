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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirmwareService } from '../../service/firmware/firmware.service';

@Controller('management/firmware')
export class FirmwareController {
  constructor(private readonly firmwareService: FirmwareService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFirmware(
    @UploadedFile() file: Express.Multer.File,
    @Body('version') version: string,
    @Body('releaseNotes') releaseNotes: string,
    @Body('targetModels') targetModels: string | string[],
    @Body('checksum') checksum: string,
    @Body('uploadedBy') uploadedBy: string,
  ) {
    const models =
      typeof targetModels === 'string'
        ? JSON.parse(targetModels)
        : targetModels;
    return this.firmwareService.uploadFirmware(
      file,
      version,
      releaseNotes,
      models,
      checksum,
      uploadedBy,
    );
  }

  @Get('history')
  async getHistory() {
    return this.firmwareService.getAllFirmware();
  }

  @Get('latest')
  async getLatest(@Query('model') model: string) {
    return this.firmwareService.getLatestFirmware(model);
  }

  @Delete(':id')
  async deleteFirmware(@Param('id') id: string) {
    return this.firmwareService.deleteFirmware(id);
  }
}
