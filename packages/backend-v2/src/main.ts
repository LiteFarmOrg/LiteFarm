import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RestModule } from './infrastructure/rest/rest.module';

async function bootstrap() {
  const app = await NestFactory.create(RestModule);
  const config = new DocumentBuilder()
      .setTitle('LiteFarm v2')
      .setDescription('Litefarm backend revamps')
      .setVersion('2.0')
      .addTag('litefarm')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
