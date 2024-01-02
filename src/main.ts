import { NestFactory } from '@nestjs/core';
import { DNSModule } from './DNSModule/DNSModule';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(DNSModule);

  await app.init();
}
bootstrap();
