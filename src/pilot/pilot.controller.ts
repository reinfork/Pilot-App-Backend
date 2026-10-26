import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PilotService } from './pilot.service.js';

@Controller('pilot')
export class PilotController {
  constructor(private readonly pilot: PilotService) {}

  @Get('me')
  me(@Req() request: Request) {
    const avatarUrl = `${request.protocol}://${request.get('host')}/static/avatar.svg`;
    return this.pilot.me(avatarUrl);
  }
}
