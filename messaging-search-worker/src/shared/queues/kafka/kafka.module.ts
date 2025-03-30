import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { AppConfigModule } from '../../config/app-config/app-config.module';
import { AppConfigService } from '../../config/app-config/app-config.service';
import { Kafka } from 'kafkajs';

@Module({
  imports: [AppConfigModule],
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
  exports: [KafkaService],
})
export class KafkaModule {}
