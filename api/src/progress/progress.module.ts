import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ProgressController } from './progress.controller';

@Module({
  imports: [StorageModule],
  controllers: [ProgressController],
})
export class ProgressModule {}

