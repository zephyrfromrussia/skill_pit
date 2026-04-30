import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { access, cp } from 'node:fs/promises';
import path from 'node:path';
import { DataPathsService } from './data-paths.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly paths: DataPathsService) {}

  async onModuleInit() {
    mkdirSync(this.paths.skillsDir, { recursive: true });
    mkdirSync(this.paths.tmpDir, { recursive: true });

    const seedRoot = path.resolve(process.cwd(), '..', 'seed', 'skill-packs');
    const seedPack = path.join(seedRoot, 'react-basics');
    const targetPack = path.join(this.paths.skillsDir, 'react-basics');

    try {
      await access(targetPack);
      return;
    } catch {}

    try {
      await access(seedPack);
      await cp(seedPack, targetPack, { recursive: true });
    } catch {}
  }
}

