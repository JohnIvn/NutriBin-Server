import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Server, Socket } from 'socket.io';

// Interfaces based on your Service SQL queries
interface SupportTicket {
  ticket_id: string;
  customer_id: string;
  subject: string;
  status: string;
  last_updated: Date;
}

interface SupportMessage {
  message_id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  date_sent: Date;
}

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

@WebSocketGateway({ cors: true })
export class SupportGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;
  private supabase: SupabaseClient<any, 'public'>;

  constructor() {
    this.supabase = createClient<any, 'public'>(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
    );
  }

  afterInit() {
    this.startSupabaseRealtimeListener();
  }

  /**
   * Room Management:
   * When a user opens a ticket, they "subscribe" to that ticket's room.
   */
  @SubscribeMessage('joinTicket')
  handleJoinTicket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { ticketId: string },
  ) {
    client.join(`ticket_${data.ticketId}`);
    console.log(`User joined room: ticket_${data.ticketId}`);
  }

  private startSupabaseRealtimeListener() {
    this.supabase
      .channel('support-system-changes')
      // 1. Listen for new messages
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          console.log('New message detected:', newMessage.message_id);

          // Emit only to users in that specific ticket room
          this.server
            .to(`ticket_${newMessage.ticket_id}`)
            .emit('new_message_received', newMessage);
        },
      )
      // 2. Listen for ticket updates (like status changes or priority updates)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_tickets' },
        (payload) => {
          const updatedTicket = payload.new as SupportTicket;
          console.log('Ticket update detected:', updatedTicket.ticket_id);

          this.server
            .to(`ticket_${updatedTicket.ticket_id}`)
            .emit('ticket_status_updated', updatedTicket);
        },
      )
      .subscribe();
  }
}
