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
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  cors: { origin: '*' }, // allow all origins during development
  namespace: '/chat',    // connect via: io('http://localhost:4000/chat')
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService:  JwtService,
  ) {}

  // ─── Connection / Disconnection ───────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      // JWT is sent in the handshake auth object:
      // On frontend: io('/chat', { auth: { token: 'Bearer eyJ...' } })
      const token = client.handshake.auth?.token?.replace('Bearer ', '');
      if (!token) throw new Error('No token');

      const payload = this.jwtService.verify(token);
      // Attach user info to the socket so we can use it in event handlers
      client.data.userId   = payload.sub;
      client.data.username = payload.username;

      console.log(`✅ Connected: ${payload.username} (${client.id})`);
    } catch {
      // Invalid or missing token — disconnect immediately
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Disconnected: ${client.data.username} (${client.id})`);
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  // Client emits: socket.emit('room:join', { roomId: '...' })
  // Server adds the socket to that Socket.io room so it receives broadcasts
  @SubscribeMessage('room:join')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(data.roomId);
    client.emit('room:joined', { roomId: data.roomId });
  }

  // Client emits: socket.emit('room:leave', { roomId: '...' })
  @SubscribeMessage('room:leave')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
    client.emit('room:left', { roomId: data.roomId });
  }

  // Client emits: socket.emit('message:send', { roomId: '...', content: 'Hello' })
  // Gateway saves to DB, then broadcasts to everyone in the room
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

    // Emit the saved message to EVERYONE in the room (including the sender)
    this.server.to(dto.roomId).emit('message:new', message);
  }

  // Client emits: socket.emit('message:delete', { messageId: '...' })
  @SubscribeMessage('message:delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; roomId: string },
  ) {
    await this.chatService.deleteMessage(client.data.userId, data.messageId);

    // Notify everyone in the room that this message was deleted
    this.server.to(data.roomId).emit('message:deleted', {
      messageId: data.messageId,
    });
  }

  // Client emits: socket.emit('user:typing', { roomId: '...' })
  // Broadcast to others that this user is typing (exclude the sender)
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

  // Client emits: socket.emit('user:stop-typing', { roomId: '...' })
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
