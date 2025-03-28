import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum GetConversationMessagesSortBy {
  DATE_CREATED_ASC = 'DATE_CREATED_ASC',
  DATE_CREATED_DESC = 'DATE_CREATED_DESC',
  SENDER_ID_ASC = 'SENDER_ID_ASC',
  SENDER_ID_DESC = 'SENDER_ID_DESC',
}

export class GetConversationMessagesQueryDto {
  @IsOptional()
  @IsString()
  lastPaginationId?: string;

  @IsOptional()
  @IsString()
  lastMessageId?: string;

  @IsEnum(GetConversationMessagesSortBy)
  @IsOptional()
  sortBy?: GetConversationMessagesSortBy;
}

export class GetConversationMessagesParamsDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId: string;
}

export class GetConversationMessagesWithSearchQueryDto extends GetConversationMessagesQueryDto {
  @IsNotEmpty()
  @IsString()
  q: string;
}
