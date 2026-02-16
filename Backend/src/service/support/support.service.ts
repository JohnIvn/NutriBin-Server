import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface SupportTicket {
  ticket_id: string;
  customer_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  date_created: Date;
  last_updated: Date;
  customer_name?: string;
  customer_email?: string;
}

export interface TicketMessage {
  message_id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'customer' | 'staff' | 'admin';
  message: string;
  date_sent: Date;
}

@Injectable()
export class SupportService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createTicket(
    customerId: string,
    subject: string,
    description: string,
    priority: string = 'medium',
  ) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        `INSERT INTO support_tickets (customer_id, subject, description, priority)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [customerId, subject, description, priority],
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw new InternalServerErrorException('Failed to create support ticket');
    }
  }

  async getTickets(filters: { status?: string; customerId?: string } = {}) {
    const client = this.databaseService.getClient();
    try {
      let query = `
        SELECT t.*, c.first_name || ' ' || c.last_name as customer_name, c.email as customer_email
        FROM support_tickets t
        JOIN user_customer c ON t.customer_id = c.customer_id
      `;
      const values: any[] = [];

      if (filters.customerId) {
        values.push(filters.customerId);
        query += ` WHERE t.customer_id = $${values.length}`;
      }

      if (filters.status) {
        if (values.length > 0) query += ' AND';
        else query += ' WHERE';
        values.push(filters.status);
        query += ` t.status = $${values.length}`;
      }

      query += ` ORDER BY t.date_created DESC`;

      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw new InternalServerErrorException('Failed to fetch support tickets');
    }
  }

  async getTicketById(ticketId: string) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        `SELECT t.*, c.first_name || ' ' || c.last_name as customer_name, c.email as customer_email
         FROM support_tickets t
         JOIN user_customer c ON t.customer_id = c.customer_id
         WHERE t.ticket_id = $1`,
        [ticketId],
      );
      if (result.rows.length === 0)
        throw new NotFoundException('Ticket not found');
      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error fetching ticket by ID:', error);
      throw new InternalServerErrorException('Failed to fetch ticket');
    }
  }

  async updateTicketStatus(ticketId: string, status: string) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        `UPDATE support_tickets SET status = $1, last_updated = now() WHERE ticket_id = $2 RETURNING *`,
        [status, ticketId],
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw new InternalServerErrorException('Failed to update ticket status');
    }
  }

  async addMessage(
    ticketId: string,
    senderId: string,
    senderType: string,
    message: string,
  ) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        `INSERT INTO support_messages (ticket_id, sender_id, sender_type, message)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [ticketId, senderId, senderType, message],
      );

      // Update the ticket's last_updated field
      await client.query(
        `UPDATE support_tickets SET last_updated = now() WHERE ticket_id = $1`,
        [ticketId],
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error adding message to ticket:', error);
      throw new InternalServerErrorException('Failed to add message');
    }
  }

  async getMessages(ticketId: string) {
    const client = this.databaseService.getClient();
    try {
      const result = await client.query(
        `SELECT * FROM support_messages WHERE ticket_id = $1 ORDER BY date_sent ASC`,
        [ticketId],
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      throw new InternalServerErrorException('Failed to fetch messages');
    }
  }
}
