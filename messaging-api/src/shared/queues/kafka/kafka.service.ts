import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import {
  Kafka,
  Producer,
  Consumer,
  EachBatchPayload,
  EachMessagePayload,
  Message,
} from 'kafkajs';
import { AppConfigService } from '../../config/app-config/app-config.service';

type BaseConsume = {
  topic: string;
  groupId: string;
};

type Consume = BaseConsume & {
  messageHandler: (message: any) => Promise<void>;
};

type ConsumeBatch = BaseConsume & {
  batchHandler: (messages: any[]) => Promise<void>;
};

type SendMessages = {
  topic: string;
  messages: Message[];
};

@Injectable()
export class KafkaService implements OnModuleDestroy {
  private producer: Producer;
  private consumers: Consumer[] = [];

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafka: Kafka,
    private readonly appConfigService: AppConfigService,
  ) {
    this.producer = this.kafka.producer();
  }

  async connect() {
    await this.producer.connect();
  }

  async disconnect() {
    await this.producer.disconnect();
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }

  async sendMessages({ topic, messages }: SendMessages) {
    try {
      await this.connect();

      await this.producer.send({
        topic,
        messages: messages.map((msg) => ({
          key: msg.key,
          value: msg.value,
        })),
      });

      console.log(`Successfully sent ${messages.length} messages to ${topic}`);
    } catch (error) {
      console.error(`Failed to send messages to ${topic}:`, error);
    }
  }

  async consume({ topic, groupId, messageHandler }: Consume) {
    const consumer = new Kafka({
      brokers: this.appConfigService.kafkaConfig.brokers,
    }).consumer({
      groupId,
    });
    this.consumers.push(consumer);

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        try {
          const parsedMessage = {
            key: message.key?.toString(),
            value: message.value?.toString()
              ? JSON.parse(message.value.toString())
              : null,
          };

          console.log(`Processing message: ${parsedMessage.key}`);
          await messageHandler(parsedMessage);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });
  }

  async consumeBatch({ topic, groupId, batchHandler }: ConsumeBatch) {
    const consumer = new Kafka({
      brokers: this.appConfigService.kafkaConfig.brokers,
    }).consumer({
      groupId,
    });
    this.consumers.push(consumer);

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachBatch: async ({
        batch,
        resolveOffset,
        heartbeat,
        commitOffsetsIfNecessary,
      }: EachBatchPayload) => {
        const messages = batch.messages.map((message) => ({
          key: message.key?.toString(),
          value: message.value?.toString()
            ? JSON.parse(message.value.toString())
            : null,
          offset: message.offset,
          partition: batch.partition,
        }));

        console.log(
          `Processing batch of ${messages.length} messages from partition ${batch.partition}`,
        );

        try {
          await batchHandler(messages);

          for (const message of messages) {
            resolveOffset(message.offset);
          }

          await commitOffsetsIfNecessary();
          await heartbeat();
          console.log(
            `Successfully processed and committed ${messages.length} messages`,
          );
        } catch (error) {
          console.error('Error in batch processing:', error);
        }
      },
    });
  }

  onModuleDestroy() {
    return this.disconnect();
  }
}
