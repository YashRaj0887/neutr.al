import {
  IsEnum,
  IsString,
  IsOptional,
  IsArray,
  IsMongoId,
  MaxLength,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { RoomType } from '../schemas/room.schema';

export class CreateRoomDto {
  @IsEnum(RoomType)
  type: RoomType;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(49)
  memberIds: string[];
}
