import { BadRequestException, Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { mkdirSync } from 'node:fs';
import { access, cp, readdir, readFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { DataPathsService } from '../storage/data-paths.service';
import { SkillpacksService } from '../skillpacks/skillpacks.service';

@Injectable()
export class ImportService {
  constructor(
    private readonly paths: DataPathsService,
    private readonly skillpacks: SkillpacksService,
  ) {}

  inspectZip(buffer: Buffer) {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    const safeNames = entries
      .map((e) => e.entryName.replace(/\\/g, '/'))
      .filter((n) => n && !n.endsWith('/'));

    for (const name of safeNames) {
      if (name.startsWith('/') || name.startsWith('../') || name.includes('/../')) {
        throw new BadRequestException('Некорректный zip: небезопасные пути');
      }
    }

    const skillJsonEntry = findSkillJsonEntry(entries);
    if (!skillJsonEntry) {
      return {
        ok: false,
        errors: ['Не найден skill.json в корне архива (или в единственной корневой папке)'],
      };
    }

    const prefix = getPrefix(skillJsonEntry.entryName);
    const raw = zip.readAsText(skillJsonEntry);
    let skillJson: any = null;
    try {
      skillJson = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        errors: ['skill.json не является валидным JSON'],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!skillJson?.id) errors.push('skill.json: отсутствует поле id');
    if (!skillJson?.version) errors.push('skill.json: отсутствует поле version');

    const files = new Set(
      safeNames.map((n) => normalizeZipPath(n)),
    );

    const requiredFiles = collectReferencedFiles(skillJson);
    const missing: string[] = [];
    for (const rel of requiredFiles) {
      const full = normalizeZipPath(prefix + rel);
      if (!files.has(full)) missing.push(rel);
    }
    if (missing.length > 0) {
      errors.push(`Не найдены файлы, на которые ссылается skill.json: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}`);
    }

    const counts = countSkillPack(skillJson);
    if (counts.lessons === 0) warnings.push('В паке не найдено уроков (sections[].lessons[])');
    if (counts.tasks === 0) warnings.push('В паке не найдено заданий (lessons[].tasks[])');

    return {
      ok: errors.length === 0,
      skill: {
        id: String(skillJson?.id ?? ''),
        version: String(skillJson?.version ?? ''),
        title: String(skillJson?.title ?? skillJson?.id ?? ''),
        description: String(skillJson?.description ?? ''),
        tags: Array.isArray(skillJson?.tags) ? skillJson.tags.map((t: any) => String(t)) : [],
      },
      counts,
      warnings,
      errors,
    };
  }

  inspectDemo(skillId: string) {
    const buffer = this.createDemoZipBuffer(skillId);
    return this.inspectZip(buffer);
  }

  async installDemo(skillId: string) {
    const buffer = this.createDemoZipBuffer(skillId);
    return this.importZip(buffer);
  }

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
    this.skillpacks.invalidate(skillJson.id);
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

  private createDemoZipBuffer(skillId: string) {
    const demoDir = path.resolve(process.cwd(), '..', 'seed', 'skill-packs', skillId);
    const zip = new AdmZip();
    try {
      zip.addLocalFolder(demoDir);
    } catch {
      throw new BadRequestException('Демо-пак не найден');
    }
    return zip.toBuffer();
  }
}

function normalizeZipPath(p: string) {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

function getPrefix(skillJsonEntryName: string) {
  const normalized = normalizeZipPath(skillJsonEntryName);
  const idx = normalized.lastIndexOf('/');
  if (idx === -1) return '';
  return normalized.slice(0, idx + 1);
}

function findSkillJsonEntry(entries: any[]) {
  const files = entries.filter((e) => !e.isDirectory);
  const direct = files.find((e) => normalizeZipPath(e.entryName).toLowerCase() === 'skill.json');
  if (direct) return direct;

  const roots = new Set<string>();
  for (const f of files) {
    const n = normalizeZipPath(f.entryName);
    const idx = n.indexOf('/');
    if (idx !== -1) roots.add(n.slice(0, idx));
  }
  if (roots.size !== 1) return null;
  const root = Array.from(roots)[0];
  return files.find((e) => normalizeZipPath(e.entryName).toLowerCase() === `${root}/skill.json`) ?? null;
}

function collectReferencedFiles(skillJson: any) {
  const out = new Set<string>();
  for (const section of skillJson?.sections ?? []) {
    for (const lesson of section?.lessons ?? []) {
      if (typeof lesson?.markdown === 'string') out.add(lesson.markdown);
      for (const task of lesson?.tasks ?? []) {
        if (typeof task?.promptMd === 'string') out.add(task.promptMd);
      }
    }
  }
  return Array.from(out);
}

function countSkillPack(skillJson: any) {
  const sections = Array.isArray(skillJson?.sections) ? skillJson.sections.length : 0;
  let lessons = 0;
  let tasks = 0;
  for (const section of skillJson?.sections ?? []) {
    lessons += Array.isArray(section?.lessons) ? section.lessons.length : 0;
    for (const lesson of section?.lessons ?? []) {
      tasks += Array.isArray(lesson?.tasks) ? lesson.tasks.length : 0;
    }
  }
  return { sections, lessons, tasks };
}
