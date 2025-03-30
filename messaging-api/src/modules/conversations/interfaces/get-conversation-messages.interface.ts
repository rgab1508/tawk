import { GetConversationMessagesSortBy } from '../dtos/v1/get-conversation-messages.dto';
import { Messages } from '../../../infra/setup/databases/mongodb/entities/messages.entity';

export type GetConversationMessagesRequestV1 = {
  conversationId: string;
  lastMessageId?: string;
  lastPaginationId?: string;
  sortBy?: GetConversationMessagesSortBy;
};

export type GetConversationMessagesWithSearchRequestV1 =
  GetConversationMessagesRequestV1 & {
    searchTerm?: string;
  };

export type GetConversationMessagesResponseV1 = {
  messages: Partial<Messages>[];
  hasMore: boolean;
  nextLastMessageId?: string;
  nextPaginationId?: string;
};
