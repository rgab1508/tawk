import { UseCase } from '../../../../shared/interfaces/use-case';
import { Injectable } from '@nestjs/common';
import {
  GetConversationMessagesResponseV1,
  GetConversationMessagesWithSearchRequestV1,
} from '../../interfaces/get-conversation-messages.interface';
import { ConversationsService } from '../../services/conversations.service';

@Injectable()
export class GetConversationMessagesWithSearchUseCase
  implements
    UseCase<
      GetConversationMessagesWithSearchRequestV1,
      GetConversationMessagesResponseV1
    >
{
  constructor(private readonly conversationsService: ConversationsService) {}
  execute(
    request: GetConversationMessagesWithSearchRequestV1,
  ): Promise<GetConversationMessagesResponseV1> {
    return this.conversationsService.getConversationMessagesWithSearch(request);
  }
}
