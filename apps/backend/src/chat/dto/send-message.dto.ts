import { IsString, IsMongoId, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { MessageType } from '../schemas/message.schema';

export class SendMessageDto {

  @IsMongoId()
  roomId: string;

  @IsString()
  @MaxLength(4000)
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}
