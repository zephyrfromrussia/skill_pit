import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { access, cp, readdir } from 'node:fs/promises';
import path from 'node:path';
import { DataPathsService } from './data-paths.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly paths: DataPathsService) {}

  async onModuleInit() {
    mkdirSync(this.paths.skillsDir, { recursive: true });
    mkdirSync(this.paths.tmpDir, { recursive: true });

    const seedRoot = path.resolve(process.cwd(), '..', 'seed', 'skill-packs');
    let entries: Array<{ name: string; isDirectory: () => boolean }> = [];
    try {
      entries = (await readdir(seedRoot, { withFileTypes: true })) as any;
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillId = entry.name;
      const seedPack = path.join(seedRoot, skillId);
      const targetPack = path.join(this.paths.skillsDir, skillId);
      try {
        await access(targetPack);
        continue;
      } catch {}
      try {
        await access(seedPack);
        await cp(seedPack, targetPack, { recursive: true });
      } catch {}
    }
  }
}
