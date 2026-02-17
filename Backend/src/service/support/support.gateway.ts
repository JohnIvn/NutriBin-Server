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
import ws from 'ws';

(global as any).WebSocket = ws;

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
    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
        // Essential for keeping proxies like Railway's alive
        heartbeatIntervalMs: 15000,
      },
    });
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
    this.supabase;
    const channel = this.supabase
      .channel('support-system-changes')
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
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to Supabase Realtime');
        }

        if (status === 'TIMED_OUT') {
          console.error('❌ Supabase TIMED_OUT. Cleaning up...');
          // Remove the specific channel before retrying
          await this.supabase.removeChannel(channel);
          setTimeout(() => this.startSupabaseRealtimeListener(), 5000);
        }

        if (status === 'CHANNEL_ERROR') {
          console.error(
            '❌ Channel Error. Check if Realtime is enabled in Supabase Dashboard.',
          );
        }
      });

    // Optional: Listen for heartbeat signals specifically
    this.supabase.realtime.onHeartbeat((hbStatus) => {
      if (hbStatus === 'timeout') {
        console.warn('⚠️ Heartbeat timeout detected. Network may be unstable.');
      }
    });
  }
  async onModuleDestroy() {
    console.log('Cleaning up Supabase Realtime connections...');
    await this.supabase.removeAllChannels();
  }
}
