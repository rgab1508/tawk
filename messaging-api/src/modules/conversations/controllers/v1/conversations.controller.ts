import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  GetConversationMessagesQueryDto,
  GetConversationMessagesParamsDto,
  GetConversationMessagesWithSearchQueryDto,
} from '../../dtos/v1/get-conversation-messages.dto';
import { GetConversationMessagesUseCase } from '../../use-cases/v1/get-conversation-messages.use-case';

@Controller('api/conversations')
export class ConversationsController {
  constructor(
    private readonly getConversationMessagesUseCase: GetConversationMessagesUseCase,
  ) {}

  @Get(':conversationId/messages')
  getConversationMessages(
    @Param() { conversationId }: GetConversationMessagesParamsDto,
    @Query()
    {
      lastMessageId,
      lastPaginationId,
      sortBy,
    }: GetConversationMessagesQueryDto,
  ) {
    console.log(lastMessageId, lastPaginationId, sortBy, conversationId);
    return this.getConversationMessagesUseCase.execute({
      conversationId,
      lastMessageId,
      lastPaginationId,
      sortBy,
    });
  }

  @Get(':conversationId/messages/search')
  getConversationMessagesWithSearch(
    @Param() { conversationId }: GetConversationMessagesParamsDto,
    @Query()
    { q, lastMessageId, sortBy }: GetConversationMessagesWithSearchQueryDto,
  ) {
    console.log(lastMessageId, sortBy, conversationId, q);
  }
}
