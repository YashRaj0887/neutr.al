import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { RoomService } from '../room/room.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly roomService: RoomService,
  ) {}

  // Save a new message — user must be a member of the room
  async sendMessage(
    userId: string,
    username: string,
    dto: SendMessageDto,
  ): Promise<MessageDocument> {
    const isMember = await this.roomService.isMember(userId, dto.roomId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    const message = new this.messageModel({
      roomId:  new Types.ObjectId(dto.roomId),
      sender:  { userId: new Types.ObjectId(userId), username },
      content: dto.content,
      type:    dto.type ?? 'text',
    });

    return message.save();
  }

  // Get paginated message history for a room (newest first)
  async getMessages(
    userId: string,
    roomId: string,
    limit = 50,
    before?: string, // ObjectId — load messages older than this
  ): Promise<MessageDocument[]> {
    const isMember = await this.roomService.isMember(userId, roomId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    const query: Record<string, any> = {
      roomId:    new Types.ObjectId(roomId),
      deletedAt: null,
    };

    if (before) {
      query._id = { $lt: new Types.ObjectId(before) };
    }

    return this.messageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  // Soft-delete a message — only the sender can delete their own message
  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId);
    if (!message) throw new NotFoundException('Message not found');

    if (String(message.sender.userId) !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    message.deletedAt = new Date();
    await message.save();
  }
}
