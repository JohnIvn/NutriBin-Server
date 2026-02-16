import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { SupportService } from '../service/support/support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  async createTicket(
    @Body()
    body: {
      customerId: string;
      subject: string;
      description: string;
      priority?: string;
    },
  ) {
    if (!body.customerId || !body.subject || !body.description) {
      throw new BadRequestException(
        'customerId, subject, and description are required',
      );
    }
    return this.supportService.createTicket(
      body.customerId,
      body.subject,
      body.description,
      body.priority,
    );
  }

  @Get('tickets')
  async getTickets(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.supportService.getTickets({ status, customerId });
  }

  @Get('tickets/:id')
  async getTicketById(@Param('id') id: string) {
    return this.supportService.getTicketById(id);
  }

  @Patch('tickets/:id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    if (!status) throw new BadRequestException('status is required');
    return this.supportService.updateTicketStatus(id, status);
  }

  @Post('tickets/:id/messages')
  async addMessage(
    @Param('id') id: string,
    @Body()
    body: {
      senderId: string;
      senderType: string;
      message: string;
    },
  ) {
    if (!body.senderId || !body.senderType || !body.message) {
      throw new BadRequestException(
        'senderId, senderType, and message are required',
      );
    }
    return this.supportService.addMessage(
      id,
      body.senderId,
      body.senderType,
      body.message,
    );
  }

  @Get('tickets/:id/messages')
  async getMessages(@Param('id') id: string) {
    return this.supportService.getMessages(id);
  }
}
