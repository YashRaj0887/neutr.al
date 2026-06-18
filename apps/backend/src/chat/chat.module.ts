import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';
import { ChatService } from './chat.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    RoomModule, // gives us RoomService (which is exported from RoomModule)
  ],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
