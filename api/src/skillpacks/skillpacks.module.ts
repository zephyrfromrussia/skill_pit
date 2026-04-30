import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { SkillpacksController } from './skillpacks.controller';
import { SkillpacksService } from './skillpacks.service';

@Module({
  imports: [StorageModule],
  controllers: [SkillpacksController],
  providers: [SkillpacksService],
  exports: [SkillpacksService],
})
export class SkillpacksModule {}

