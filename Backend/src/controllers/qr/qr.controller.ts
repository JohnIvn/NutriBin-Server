import {
  Controller,
  Get,
  Param,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import QRCode from 'qrcode';

@Controller('qr')
export class QrController {
  @Get('generate/:serial')
  async generateQR(@Param('serial') serial: string, @Res() res: Response) {
    try {
      if (!serial) {
        throw new BadRequestException('Serial number is required');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const qrCodeDataUrl: string = await (QRCode as any).toDataURL(serial, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 300,
      });

      // Return as JSON with base64 encoded image
      res.json({
        ok: true,
        qrCode: qrCodeDataUrl,
        serial: serial,
        message: 'QR code generated successfully',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate QR code';
      res.status(400).json({
        ok: false,
        error: errorMessage,
      });
    }
  }
}
