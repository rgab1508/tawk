import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import {
  Kafka,
  Consumer,
  EachBatchPayload,
  KafkaMessage,
  Producer,
  Message,
} from 'kafkajs';
import { AppConfigService } from '../../config/app-config/app-config.service';

type ConsumeBatchParams = {
  topic: string;
  groupId: string;
  batchHandler: (messages: {
    messages: KafkaMessage[];
    topic: string;
    partition: number;
  }) => Promise<void>;
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

  async consumeBatch({ topic, groupId, batchHandler }: ConsumeBatchParams) {
    const consumer = new Kafka({
      brokers: this.appConfigService.kafkaConfig.brokers,
    }).consumer({
      groupId,
      readUncommitted: false,
      maxWaitTimeInMs: 5000,
    });
    this.consumers.push(consumer);

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      autoCommit: true,
      autoCommitInterval: 5000,
      autoCommitThreshold: 100,
      eachBatchAutoResolve: false,
      eachBatch: async ({
        batch,
        resolveOffset,
        heartbeat,
        commitOffsetsIfNecessary,
      }: EachBatchPayload) => {
        const { messages, topic, partition } = batch;

        console.log(
          `Processing batch of ${messages.length} messages from partition ${batch.partition}, starting at offset ${messages[0]?.offset}`,
        );

        try {
          await batchHandler({ messages, topic, partition });

          // Commit offsets for processed messages
          for (const message of messages) {
            resolveOffset(message.offset);
          }

          await commitOffsetsIfNecessary();
          await heartbeat();

          console.log(
            `Successfully processed and committed ${messages.length} messages from partition ${batch.partition}`,
          );
        } catch (error) {
          console.error('Error in batch processing:', error);
          throw error;
        }
      },
    });
  }

  async onModuleDestroy() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
