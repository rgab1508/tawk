import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  GetConversationMessagesQueryDto,
  GetConversationMessagesParamsDto,
  GetConversationMessagesWithSearchQueryDto,
} from '../../dtos/v1/get-conversation-messages.dto';
import { GetConversationMessagesUseCase } from '../../use-cases/v1/get-conversation-messages.use-case';
import { GetConversationMessagesWithSearchUseCase } from '../../use-cases/v1/get-conversation-messages-with-search.use-case';

@Controller('api/conversations')
export class ConversationsController {
  constructor(
    private readonly getConversationMessagesUseCase: GetConversationMessagesUseCase,
    private readonly getConversationMessagesWithSearchUseCase: GetConversationMessagesWithSearchUseCase,
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
    {
      q: searchTerm,
      lastMessageId,
      lastPaginationId,
      sortBy,
    }: GetConversationMessagesWithSearchQueryDto,
  ) {
    return this.getConversationMessagesWithSearchUseCase.execute({
      conversationId,
      lastMessageId,
      lastPaginationId,
      sortBy,
      searchTerm,
    });
  }
}
