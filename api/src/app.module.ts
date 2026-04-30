import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';
import { SkillpacksModule } from './skillpacks/skillpacks.module';
import { CheckModule } from './check/check.module';
import { ImportModule } from './import/import.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [StorageModule, SkillpacksModule, CheckModule, ImportModule, ProgressModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
