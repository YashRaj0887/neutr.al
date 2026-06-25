import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class PresenceService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(private readonly config: ConfigService) {}

  // Called automatically when the module starts
  onModuleInit() {
    this.redis = new Redis({
      host: this.config.get<string>('REDIS_HOST') ?? 'localhost',
      port: this.config.get<number>('REDIS_PORT') ?? 6379,
    });
  }

  // Called automatically when the module shuts down
  onModuleDestroy() {
    this.redis.disconnect();
  }

  // ─── Mark a user as ONLINE ────────────────────────────────────────────────
  // Key: presence:{userId}  Value: 'online'  Expires in 24 hours
  async setOnline(userId: string): Promise<void> {
    await this.redis.set(`presence:${userId}`, 'online', 'EX', 86400);
  }

  // ─── Mark a user as OFFLINE ───────────────────────────────────────────────
  // Deletes the key entirely — absence of key = offline
  async setOffline(userId: string): Promise<void> {
    await this.redis.del(`presence:${userId}`);
  }

  // ─── Check if a single user is online ─────────────────────────────────────
  async isOnline(userId: string): Promise<boolean> {
    const result = await this.redis.get(`presence:${userId}`);
    return result === 'online';
  }

  // ─── Get online status for a list of userIds ──────────────────────────────
  // Returns an object: { userId: true/false, ... }
  async getBulkStatus(userIds: string[]): Promise<Record<string, boolean>> {
    if (userIds.length === 0) return {};

    const keys    = userIds.map((id) => `presence:${id}`);
    const results = await this.redis.mget(...keys);

    const statusMap: Record<string, boolean> = {};
    userIds.forEach((id, index) => {
      statusMap[id] = results[index] === 'online';
    });

    return statusMap;
  }
}
