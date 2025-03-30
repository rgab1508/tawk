import { Module } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { AppConfigModule } from '../../../../shared/config/app-config/app-config.module';
import { AppConfigService } from '../../../../shared/config/app-config/app-config.service';
import {
  ElasticsearchModuleOptions,
  ElasticsearchModule as NestElasticsearchModule,
} from '@nestjs/elasticsearch';

@Module({
  imports: [
    NestElasticsearchModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (appConfigService: AppConfigService) => {
        const options: ElasticsearchModuleOptions = {
          node: appConfigService.elasticsearchConfig.node,
        };

        if (
          appConfigService.elasticsearchConfig.authUsername &&
          appConfigService.elasticsearchConfig.authPassword
        ) {
          options.auth = {
            username: appConfigService.elasticsearchConfig.authUsername,
            password: appConfigService.elasticsearchConfig.authPassword,
          };
        }

        return options;
      },
      inject: [AppConfigService],
    }),
  ],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
