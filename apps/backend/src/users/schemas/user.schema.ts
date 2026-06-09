import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, 
            unique: true,
            lowercase: true,
            trim: true })
    email: string; 

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ required: true,
            trim: true })
    username: string;

    @Prop({ type: String, 
            enum: UserRole,
            default: UserRole.USER })
    role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
