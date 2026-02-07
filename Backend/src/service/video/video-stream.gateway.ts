import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'videostream',
  cors: {
    origin: '*',
  },
})
export class VideoStreamGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private producers = new Set<string>();

  handleConnection(client: Socket) {
    console.log(`[VideoStream] Client connected: ${client.id}`);
    client.emit('stream-status', { active: this.producers.size > 0 });
  }

  handleDisconnect(client: Socket) {
    console.log(`[VideoStream] Client disconnected: ${client.id}`);
    if (this.producers.has(client.id)) {
      this.producers.delete(client.id);
      if (this.producers.size === 0) {
        this.server.emit('stream-status', { active: false });
      }
    }
  }

  @SubscribeMessage('video-frame')
  handleVideoFrame(client: Socket, @MessageBody() data: any) {
    // Mark this client as a producer if not already
    if (!this.producers.has(client.id)) {
      console.log(`[VideoStream] New producer identified: ${client.id}`);
      this.producers.add(client.id);
      this.server.emit('stream-status', { active: true });
    }

    // Broadcast the video frame to all clients except the sender
    // Using binary data directly
    client.broadcast.emit('stream', data);
  }
}
