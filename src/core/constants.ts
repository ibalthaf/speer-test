import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const JWT_SECRET = process.env.JWT_SECRET;

export enum Environment {
  Development = 'development',
  Test = 'test',
  Staging = 'staging',
  Production = 'production',
}

export const SwaggerConfig = new DocumentBuilder()
  .setTitle('Speer Test')
  .setDescription(`Speer Test API description`)
  .setVersion(`v1`)
  .addBearerAuth()
  .addServer('/api')
  .build();

export const SwaggerOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};
