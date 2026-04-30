import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { SkillpacksModule } from '../skillpacks/skillpacks.module';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';

@Module({
  imports: [StorageModule, SkillpacksModule],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
