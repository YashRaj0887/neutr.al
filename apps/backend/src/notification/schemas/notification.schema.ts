import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  MESSAGE  = 'message',
  MENTION  = 'mention',
  INVITE   = 'invite',
}

@Schema({ timestamps: true })
export class Notification {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId; // the user who RECEIVES this notification

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  // Flexible payload — stores context depending on type
  @Prop({
    type: {
      roomId:         { type: Types.ObjectId, ref: 'Room' },
      roomName:       String,
      senderName:     String,
      messagePreview: String,
    },
  })
  data: {
    roomId?:         Types.ObjectId;
    roomName?:       string;
    senderName?:     string;
    messagePreview?: string;
  };

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Fast query: get all unread notifications for a user, newest first
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
