import { Injectable } from '@nestjs/common';
import { MessagesRepository } from '../../../infra/setup/databases/mongodb/repositories/messages.repository';
import {
  GetConversationMessagesRequestV1,
  GetConversationMessagesResponseV1,
} from '../interfaces/get-conversation-messages.interface';
import { GetConversationMessagesSortBy } from '../dtos/v1/get-conversation-messages.dto';
import { Messages } from '../../../infra/setup/databases/mongodb/entities/messages.entity';

type GetSortOptionsBasedOnSortByParams = {
  sortBy?: GetConversationMessagesSortBy;
};

type GetSortOptionsBasedOnSortReturn = {
  sortField: keyof Messages;
  sortDirection: 1 | -1;
};

@Injectable()
export class ConversationsService {
  PAGE_SIZE = 20;

  constructor(private readonly messagesRepository: MessagesRepository) {}

  private getSortOptionsBasedOnSortBy({
    sortBy,
  }: GetSortOptionsBasedOnSortByParams): GetSortOptionsBasedOnSortReturn {
    switch (sortBy) {
      case GetConversationMessagesSortBy.DATE_CREATED_ASC:
        return {
          sortField: 'timestamp',
          sortDirection: 1,
        };
      case GetConversationMessagesSortBy.DATE_CREATED_DESC:
        return {
          sortField: 'timestamp',
          sortDirection: -1,
        };
      case GetConversationMessagesSortBy.SENDER_ID_ASC:
        return {
          sortField: 'senderId',
          sortDirection: 1,
        };
      case GetConversationMessagesSortBy.SENDER_ID_DESC:
        return {
          sortField: 'senderId',
          sortDirection: -1,
        };
      default:
        return {
          sortField: 'timestamp',
          sortDirection: -1,
        };
    }
  }

  async getConversationMessages({
    conversationId,
    lastMessageId,
    lastPaginationId,
    sortBy,
  }: GetConversationMessagesRequestV1): Promise<GetConversationMessagesResponseV1> {
    const { sortField, sortDirection } = this.getSortOptionsBasedOnSortBy({
      sortBy,
    });

    const messages = await this.messagesRepository.find(
      {
        conversationId,
        ...(lastMessageId && lastPaginationId
          ? {
              [sortField]: {
                [sortDirection === 1 ? '$gte' : '$lte']: lastPaginationId,
              },
              id: { $gte: lastMessageId },
            }
          : {}),
      },
      {},
      {
        sort: {
          [sortField]: sortDirection,
          id: 1,
        },
        limit: this.PAGE_SIZE + 1,
      },
    );

    const nextLastMessage =
      messages.length > this.PAGE_SIZE ? messages.pop() : undefined;

    return {
      messages,
      hasMore: !!nextLastMessage,
      nextLastMessageId: nextLastMessage?.id,
      nextPaginationId: nextLastMessage?.[sortField] as string,
    };
  }
}
