import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { PresenceService } from '../presence/presence.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService:     ChatService,
    private readonly jwtService:      JwtService,
    private readonly presenceService: PresenceService,
  ) {}

  // ─── Connection ───────────────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token?.replace('Bearer ', '');
      if (!token) throw new Error('No token');

      const payload = this.jwtService.verify(token);
      client.data.userId   = payload.sub;
      client.data.username = payload.username;

      // Mark user as online in Redis
      await this.presenceService.setOnline(payload.sub);

      // Notify everyone that this user is now online
      this.server.emit('user:online', { userId: payload.sub });

      console.log(`✅ Connected: ${payload.username} (${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  // ─── Disconnection ────────────────────────────────────────────────────────

  async handleDisconnect(client: Socket) {
    if (client.data.userId) {
      // Mark user as offline in Redis
      await this.presenceService.setOffline(client.data.userId);

      // Notify everyone that this user is now offline
      this.server.emit('user:offline', { userId: client.data.userId });
    }

    console.log(`❌ Disconnected: ${client.data.username} (${client.id})`);
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  @SubscribeMessage('room:join')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(data.roomId);
    client.emit('room:joined', { roomId: data.roomId });
  }

  @SubscribeMessage('room:leave')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
    client.emit('room:left', { roomId: data.roomId });
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const message = await this.chatService.sendMessage(
      client.data.userId,
      client.data.username,
      dto,
    );
    this.server.to(dto.roomId).emit('message:new', message);
  }

  @SubscribeMessage('message:delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; roomId: string },
  ) {
    await this.chatService.deleteMessage(client.data.userId, data.messageId);
    this.server.to(data.roomId).emit('message:deleted', {
      messageId: data.messageId,
    });
  }

  @SubscribeMessage('user:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.to(data.roomId).emit('user:typing', {
      userId:   client.data.userId,
      username: client.data.username,
    });
  }

  @SubscribeMessage('user:stop-typing')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.to(data.roomId).emit('user:stop-typing', {
      userId: client.data.userId,
    });
  }
}
