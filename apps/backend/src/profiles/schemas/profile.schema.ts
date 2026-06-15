import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop({ type: Types.ObjectId,
          ref: 'User',
          required: true,
          unique: true })
  userId: Types.ObjectId;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({ default: '' })
  statusMessage: string;

  @Prop({ default: 0 })
  followersCount: number;

  @Prop({ default: 0 })
  followingCount: number;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
