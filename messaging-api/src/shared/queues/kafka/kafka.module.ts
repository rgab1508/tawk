import {
  forwardRef,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { Kafka } from 'kafkajs';
import { AppConfigService } from '../../config/app-config/app-config.service';
import { AppConfigModule } from '../../config/app-config/app-config.module';

@Module({
  imports: [forwardRef(() => AppConfigModule)],
  providers: [
    {
      provide: 'KAFKA_CLIENT',
      useFactory: (appConfigService: AppConfigService) => {
        return new Kafka({
          clientId: appConfigService.kafkaConfig.clientId,
          brokers: appConfigService.kafkaConfig.brokers,
        });
      },
      inject: [AppConfigService],
    },
    KafkaService,
  ],
  exports: ['KAFKA_CLIENT', KafkaService],
})
export class KafkaModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    await this.kafkaService.connect();
  }

  async onModuleDestroy() {
    await this.kafkaService.disconnect();
  }
}
