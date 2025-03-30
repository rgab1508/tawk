import { Injectable } from '@nestjs/common';
import { MessagesRepository } from '../../../infra/setup/databases/mongodb/repositories/messages.repository';
import {
  GetConversationMessagesRequestV1,
  GetConversationMessagesResponseV1,
  GetConversationMessagesWithSearchRequestV1,
} from '../interfaces/get-conversation-messages.interface';
import { GetConversationMessagesSortBy } from '../dtos/v1/get-conversation-messages.dto';
import { Messages } from '../../../infra/setup/databases/mongodb/entities/messages.entity';
import { ElasticsearchService } from '../../../infra/setup/databases/elasticsearch/elasticsearch.service';

type GetSortOptionsBasedOnSortByParams = {
  sortBy?: GetConversationMessagesSortBy;
};

type GetSortOptionsBasedOnSortReturn = {
  sortField: keyof Messages;
  sortDirection: 1 | -1;
};

interface ElasticsearchHit {
  _source: {
    id: string;
    timestamp: string;
  };
}

@Injectable()
export class ConversationsService {
  PAGE_SIZE = 20;

  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

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

  async getConversationMessagesWithSearch({
    conversationId,
    lastMessageId,
    lastPaginationId,
    sortBy,
    searchTerm,
  }: GetConversationMessagesWithSearchRequestV1): Promise<GetConversationMessagesResponseV1> {
    const { sortField, sortDirection } = this.getSortOptionsBasedOnSortBy({
      sortBy,
    });

    const result = await this.elasticsearchService.getPaginatedMessages({
      query: {
        bool: {
          must: [
            {
              term: {
                'conversationId.enum': conversationId,
              },
            },
            ...(searchTerm
              ? [
                  {
                    query_string: {
                      query: searchTerm,
                    },
                  },
                ]
              : []),
          ],
        },
      },
      sort: [
        {
          [sortField]: sortDirection === 1 ? 'asc' : 'desc',
        },
      ],
      pageSize: this.PAGE_SIZE,
      searchAfter: lastPaginationId
        ? [lastPaginationId ?? null, lastMessageId ?? null]
        : undefined,
    });

    const hits = result.hits.hits as ElasticsearchHit[];
    const messageIds = hits.map((hit) => hit._source.id);
    const hasMore = messageIds.length > this.PAGE_SIZE;
    const nextLastMessageId = hasMore ? messageIds.pop() : undefined;
    const nextPaginationId = hasMore
      ? hits[this.PAGE_SIZE]._source.timestamp
      : undefined;

    const messages = await this.messagesRepository.find(
      {
        conversationId,
        id: { $in: messageIds },
      },
      {},
      {
        limit: this.PAGE_SIZE,
      },
    );

    const messagesMap = new Map(
      messages.map((message) => [message.id, message]),
    );

    const sortedMessages = messageIds
      .map((id) => messagesMap.get(id))
      .filter((message): message is Messages => message !== undefined);

    return {
      messages: sortedMessages,
      hasMore,
      nextLastMessageId,
      nextPaginationId,
    };
  }
}
