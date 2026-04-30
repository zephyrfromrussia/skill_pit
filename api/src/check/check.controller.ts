import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LlmClientService } from './llm-client.service';
import { CheckService } from './check.service';

@Controller()
export class CheckController {
  constructor(
    private readonly checkService: CheckService,
    private readonly llm: LlmClientService,
  ) {}

  @Post('check')
  async check(
    @Body()
    body: {
      skillId: string;
      taskId: string;
      userAnswer: string;
      llm: { baseUrl: string; model: string };
    },
  ) {
    return this.checkService.check(body);
  }

  @Get('llm/health')
  async health(@Query('baseUrl') baseUrl: string) {
    if (!baseUrl) return { ok: false };
    return this.llm.health(baseUrl);
  }
}

