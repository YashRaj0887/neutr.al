import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {}

  async createDefaultProfile(userId: string): Promise<ProfileDocument> {
    const profile = new this.profileModel({
      userId: new Types.ObjectId(userId),
    });
    return profile.save();
  }

  async findByUserId(userId: string): Promise<ProfileDocument> {
    const profile = await this.profileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async update(userId: string, dto: UpdateProfileDto): Promise<ProfileDocument> {
    const profile = await this.profileModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: dto },
        { new: true },
      )
      .exec();
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
