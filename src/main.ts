import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Environment, SwaggerConfig, SwaggerOptions } from './core/constants';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const env = config.get<Environment>('env');
  if (env !== Environment.Production) {
    app.use(morgan('tiny'));
    const document = SwaggerModule.createDocument(app, SwaggerConfig);
    SwaggerModule.setup('/docs', app, document, SwaggerOptions);
  }

  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();
