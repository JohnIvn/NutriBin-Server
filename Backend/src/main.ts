import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.ENV' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://nutribin-server-frontend.railway.internal:3000',
      'http://nutribin-server-frontend.railway.app',
      'https://nutribin-server-frontend-production.up.railway.app',
      'https://nutribin-admin.up.railway.app',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error('Failed to start Nest application', error);
  process.exit(1);
});
