import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module.js';

const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.enableCors();
app.set('trust proxy', 1);
app.useStaticAssets(join(process.cwd(), 'data', 'assets'), { prefix: '/static/' });
await app.listen(8000);
