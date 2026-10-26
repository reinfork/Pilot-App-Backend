import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { AuthGuard } from './common/auth.guard.js';
import { HttpExceptionFilter } from './common/http-exception.filter.js';
import { DataModule } from './data/data.module.js';
import { FlightHoursModule } from './flight-hours/flight-hours.module.js';
import { PilotModule } from './pilot/pilot.module.js';

@Module({
  imports: [DataModule, AuthModule, PilotModule, FlightHoursModule],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
