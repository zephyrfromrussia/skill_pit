import { Module } from '@nestjs/common';
import { SkillpacksModule } from '../skillpacks/skillpacks.module';
import { StorageModule } from '../storage/storage.module';
import { CheckController } from './check.controller';
import { CheckService } from './check.service';
import { LlmClientService } from './llm-client.service';

@Module({
  imports: [SkillpacksModule, StorageModule],
  controllers: [CheckController],
  providers: [CheckService, LlmClientService],
})
export class CheckModule {}

