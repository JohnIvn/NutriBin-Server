import {
  Controller,
  Get,
  Param,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import * as QRCode from 'qrcode';

@Controller('qr')
export class QrController {
  @Get('generate/:serial')
  async generateQR(@Param('serial') serial: string, @Res() res: Response) {
    try {
      if (!serial) {
        throw new BadRequestException('Serial number is required');
      }

      // Generate QR code as a data URL (PNG image)
      const qrCodeDataUrl = await QRCode.toDataURL(serial, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
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
    } catch (error) {
      res.status(400).json({
        ok: false,
        error: error.message || 'Failed to generate QR code',
      });
    }
  }
}
