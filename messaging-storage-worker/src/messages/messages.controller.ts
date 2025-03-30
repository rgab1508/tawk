import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { MessagesService } from 'src/modules/messages/messages.service';
import { AppConfigService } from 'src/shared/config/app-config/app-config.service';
import { KafkaTopics } from 'src/shared/queues/kafka/constants/topics';
import { KafkaService } from 'src/shared/queues/kafka/kafka.service';

@Controller()
export class MessagesController implements OnModuleInit {
  private readonly logger = new Logger(MessagesController.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly appConfigService: AppConfigService,
    private readonly messagesService: MessagesService,
  ) {
    this.logger.log(
      `Initialized MessagesController with topic: ${KafkaTopics.CREATE_MESSAGE}`,
    );
  }

  async onModuleInit() {
    await this.setupMessageConsumer();
  }

  private async setupMessageConsumer() {
    try {
      await this.kafkaService.consumeBatch({
        topic: KafkaTopics.CREATE_MESSAGE,
        groupId: this.appConfigService.kafkaConfigGroupId,
        batchHandler: async ({ messages, topic, partition }) => {
          this.logger.log(`Processing batch of ${messages.length} messages`);

          await this.messagesService.storeBatch({ messages });

          this.logger.log(
            `Successfully processed batch of ${messages.length} messages`,
          );
        },
      });

      this.logger.log('Message consumer setup completed');
    } catch (error) {
      this.logger.error('Failed to setup message consumer:', error);
      throw error;
    }
  }
}
