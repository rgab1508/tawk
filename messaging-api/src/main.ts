import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const port = process.env.PORT ?? 4000;

  app.use(morgan('dev'));
  app.enableCors({
    origin: '*',
  });

  app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1',
  // });

  await app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}
bootstrap();
