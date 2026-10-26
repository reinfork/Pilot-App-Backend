import { join } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';

export function configureApp(app: NestExpressApplication): void {
  app.enableCors();
  app.set('trust proxy', 1);
  app.useStaticAssets(join(process.cwd(), 'data', 'assets'), { prefix: '/static/' });
}
