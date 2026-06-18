import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum MessageType {
  TEXT   = 'text',
  IMAGE  = 'image',
  FILE   = 'file',
  SYSTEM = 'system',
}

@Schema({ timestamps: true })
export class Message {

  @Prop({ type: Types.ObjectId, ref: 'Room', required: true, index: true })
  roomId: Types.ObjectId;

  @Prop({
    type: {
      userId:   { type: Types.ObjectId, ref: 'User' },
      username: String,
    },
    required: true,
  })
  sender: {
    userId:   Types.ObjectId;
    username: string;
  };

  @Prop({ required: true, maxlength: 4000 })
  content: string;

  @Prop({ type: String, enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({ default: null })
  deletedAt: Date | null; // null = visible, Date = soft-deleted
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Fast retrieval of messages in a room sorted newest-first
MessageSchema.index({ roomId: 1, createdAt: -1 });
