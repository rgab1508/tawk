import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMessageBodyDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
