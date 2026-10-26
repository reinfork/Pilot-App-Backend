import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module.js';

const app = await NestFactory.create<NestExpressApplication>(AppModule);
// ponytail: open CORS; restrict to the frontend origin if this leaves demo use.
app.enableCors();
app.set('trust proxy', 1);
// ponytail: avatar is public so <img> can load it; no private assets here.
app.useStaticAssets(join(process.cwd(), 'data', 'assets'), { prefix: '/static/' });
await app.listen(8000);
