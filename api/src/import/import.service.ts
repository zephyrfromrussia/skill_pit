import { BadRequestException, Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { mkdirSync } from 'node:fs';
import { access, cp, readdir, readFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { DataPathsService } from '../storage/data-paths.service';

@Injectable()
export class ImportService {
  constructor(private readonly paths: DataPathsService) {}

  async importZip(buffer: Buffer) {
    const zip = new AdmZip(buffer);
    for (const entry of zip.getEntries()) {
      const name = entry.entryName.replace(/\\/g, '/');
      if (name.startsWith('/') || name.startsWith('../') || name.includes('/../')) {
        throw new BadRequestException('Некорректный zip: небезопасные пути');
      }
    }

    const tmpId = crypto.randomUUID();
    const tmpDir = path.join(this.paths.tmpDir, `import-${tmpId}`);
    mkdirSync(tmpDir, { recursive: true });
    zip.extractAllTo(tmpDir, true);

    const packDir = await this.findPackDir(tmpDir);
    const skillJson = JSON.parse(await readFile(path.join(packDir, 'skill.json'), 'utf-8')) as {
      id?: string;
      version?: string;
      title?: string;
    };

    if (!skillJson?.id || !skillJson?.version) {
      throw new BadRequestException('skill.json должен содержать id и version');
    }

    const targetDir = path.join(this.paths.skillsDir, skillJson.id);
    await rm(targetDir, { recursive: true, force: true });
    await rm(path.join(targetDir, '..', `${skillJson.id}.tmp`), { recursive: true, force: true });

    mkdirSync(this.paths.skillsDir, { recursive: true });
    const tmpTarget = path.join(this.paths.skillsDir, `${skillJson.id}.tmp`);
    await rm(tmpTarget, { recursive: true, force: true });
    await cp(packDir, tmpTarget, { recursive: true });
    await rm(targetDir, { recursive: true, force: true });
    await rename(tmpTarget, targetDir);

    await rm(tmpDir, { recursive: true, force: true });
    return {
      ok: true,
      skill: {
        id: skillJson.id,
        version: skillJson.version,
        title: skillJson.title ?? skillJson.id,
      },
    };
  }

  private async findPackDir(extractedRoot: string) {
    try {
      await access(path.join(extractedRoot, 'skill.json'));
      return extractedRoot;
    } catch {}

    const entries = await readdir(extractedRoot, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => path.join(extractedRoot, e.name));
    if (dirs.length === 1) {
      try {
        await access(path.join(dirs[0], 'skill.json'));
        return dirs[0];
      } catch {}
    }

    throw new BadRequestException('Не найден skill.json в корне архива');
  }
}
