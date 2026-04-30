import { Module } from '@nestjs/common';
import { DataPathsService } from './data-paths.service';
import { DbService } from './db.service';
import { SeedService } from './seed.service';

@Module({
  providers: [DataPathsService, DbService, SeedService],
  exports: [DataPathsService, DbService],
})
export class StorageModule {}

