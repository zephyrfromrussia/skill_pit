import { Injectable, OnModuleInit } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { access, cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
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
      const markerPath = path.join(targetPack, '.seed-pack');

      const seedVersion = await readSkillVersion(seedPack);
      if (!seedVersion) continue;

      try {
        await access(targetPack);
        try {
          await access(markerPath);
        } catch {
          const targetVersion = await readSkillVersion(targetPack);
          if (targetVersion && targetVersion === seedVersion) {
            try {
              await writeFile(markerPath, `seed\nversion=${seedVersion}\n`, 'utf-8');
            } catch {}
          }
          continue;
        }

        const targetVersion = await readSkillVersion(targetPack);
        if (!targetVersion) continue;
        if (targetVersion === seedVersion) continue;

        await rm(targetPack, { recursive: true, force: true });
      } catch {}
      try {
        await access(seedPack);
        await cp(seedPack, targetPack, { recursive: true });
        await writeFile(markerPath, `seed\nversion=${seedVersion}\n`, 'utf-8');
      } catch {}
    }
  }
}

async function readSkillVersion(packDir: string) {
  try {
    const raw = await readFile(path.join(packDir, 'skill.json'), 'utf-8');
    const parsed = JSON.parse(raw) as { version?: string };
    if (!parsed?.version) return null;
    return String(parsed.version);
  } catch {
    return null;
  }
}
