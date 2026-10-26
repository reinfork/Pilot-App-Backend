import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';
import { configureApp } from '../dist/app.setup.js';

const app = await NestFactory.create(AppModule);
configureApp(app);
await app.init();
const server = app.getHttpAdapter().getInstance();

export default function handler(req, res) {
  server(req, res);
}
