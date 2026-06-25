import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // GET /notifications  →  get all my notifications (max 50, newest first)
  @Get()
  getMyNotifications(@Request() req) {
    return this.notificationService.getMyNotifications(req.user.userId);
  }

  // GET /notifications/unread-count  →  get number of unread notifications
  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.userId);
  }

  // PATCH /notifications/:id/read  →  mark one notification as read
  @Patch(':id/read')
  markOneRead(@Request() req, @Param('id') id: string) {
    return this.notificationService.markOneRead(req.user.userId, id);
  }

  // PATCH /notifications/read-all  →  mark ALL notifications as read
  @Patch('read-all')
  markAllRead(@Request() req) {
    return this.notificationService.markAllRead(req.user.userId);
  }

  // DELETE /notifications/:id  →  delete a single notification
  @Delete(':id')
  deleteOne(@Request() req, @Param('id') id: string) {
    return this.notificationService.deleteOne(req.user.userId, id);
  }
}
