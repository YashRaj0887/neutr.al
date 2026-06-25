import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  // ─── Create a notification (called internally by ChatGateway) ─────────────
  async create(
    userId: string,
    type: NotificationType,
    data: {
      roomId?:         string;
      roomName?:       string;
      senderName?:     string;
      messagePreview?: string;
    },
  ): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      type,
      data: {
        ...data,
        roomId: data.roomId ? new Types.ObjectId(data.roomId) : undefined,
      },
      isRead: false,
    });
    return notification.save();
  }

  // ─── Get all notifications for the logged-in user (newest first) ──────────
  async getMyNotifications(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  // ─── Count unread notifications ───────────────────────────────────────────
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  // ─── Mark one notification as read ────────────────────────────────────────
  async markOneRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true },
    );
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  // ─── Mark ALL notifications as read ──────────────────────────────────────
  async markAllRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );
  }

  // ─── Delete a single notification ─────────────────────────────────────────
  async deleteOne(userId: string, notificationId: string): Promise<void> {
    await this.notificationModel.findOneAndDelete({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    });
  }
}
