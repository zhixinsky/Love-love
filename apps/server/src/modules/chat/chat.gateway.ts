import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.headers?.authorization as string)?.replace(
        /^Bearer\s+/i,
        '',
      );
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });
      client.data.userId = payload.sub;
    } catch {
      this.logger.warn('WS auth failed');
      client.disconnect();
    }
  }

  handleDisconnect() {}

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { sessionId: string | number },
  ) {
    const sessionId = String(body?.sessionId || '');
    if (!sessionId) return { ok: false };
    client.join(`session:${sessionId}`);
    return { ok: true, sessionId };
  }

  @SubscribeMessage('send')
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const userId = client.data.userId as string;
    if (!userId) return { ok: false, message: '未认证' };
    const msg = await this.chatService.sendMessage(userId, dto);
    this.server.to(`session:${dto.sessionId}`).emit('message', msg);
    return { ok: true, message: msg };
  }
}
