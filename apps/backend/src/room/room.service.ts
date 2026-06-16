import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room, RoomDocument, RoomType } from './schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
  ) {}

  async create(userId: string, dto: CreateRoomDto): Promise<RoomDocument> {
    const memberIds = [
      new Types.ObjectId(userId),
      ...dto.memberIds.map((id) => new Types.ObjectId(id)),
    ];

    // For DMs: check if a DM already exists between these two users
    if (dto.type === RoomType.DM) {
      const existing = await this.roomModel.findOne({
        type: RoomType.DM,
        members: { $all: memberIds, $size: 2 },
      });
      if (existing) return existing;
    }

    const room = new this.roomModel({
      type: dto.type,
      name: dto.name ?? '',
      description: dto.description ?? '',
      createdBy: dto.type === RoomType.GROUP ? new Types.ObjectId(userId) : null,
      members: memberIds,
    });

    return room.save();
  }

  async findMyRooms(userId: string): Promise<RoomDocument[]> {
    return this.roomModel
      .find({ members: new Types.ObjectId(userId), isActive: true })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findById(roomId: string): Promise<RoomDocument> {
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async update(userId: string, roomId: string, dto: UpdateRoomDto): Promise<RoomDocument> {
    const room = await this.findById(roomId);
    if (String(room.createdBy) !== userId) {
      throw new ForbiddenException('Only the room creator can update it');
    }
    Object.assign(room, dto);
    return room.save();
  }

  async addMember(userId: string, roomId: string, newMemberId: string): Promise<RoomDocument> {
    const room = await this.findById(roomId);
    if (String(room.createdBy) !== userId) {
      throw new ForbiddenException('Only the room creator can add members');
    }
    const newId = new Types.ObjectId(newMemberId);
    if (!room.members.some((m) => m.equals(newId))) {
      room.members.push(newId);
      await room.save();
    }
    return room;
  }

  async removeMember(userId: string, roomId: string, targetId: string): Promise<RoomDocument> {
    const room = await this.findById(roomId);
    const isCreator = String(room.createdBy) === userId;
    const isSelf = userId === targetId;
    if (!isCreator && !isSelf) {
      throw new ForbiddenException('Not allowed');
    }
    room.members = room.members.filter((m) => !m.equals(new Types.ObjectId(targetId)));
    return room.save();
  }

  async isMember(userId: string, roomId: string): Promise<boolean> {
    const room = await this.findById(roomId);
    return room.members.some((m) => m.equals(new Types.ObjectId(userId)));
  }
}
