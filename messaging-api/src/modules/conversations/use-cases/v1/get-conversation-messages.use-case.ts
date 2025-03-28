import { UseCase } from '../../../../shared/interfaces/use-case';
import { Injectable } from '@nestjs/common';
import {
  GetConversationMessagesRequestV1,
  GetConversationMessagesResponseV1,
} from '../../interfaces/get-conversation-messages.interface';
import { ConversationsService } from '../../services/conversations.service';

@Injectable()
export class GetConversationMessagesUseCase
  implements
    UseCase<GetConversationMessagesRequestV1, GetConversationMessagesResponseV1>
{
  constructor(private readonly conversationsService: ConversationsService) {}
  execute(
    request: GetConversationMessagesRequestV1,
  ): Promise<GetConversationMessagesResponseV1> {
    return this.conversationsService.getConversationMessages(request);
  }
}
