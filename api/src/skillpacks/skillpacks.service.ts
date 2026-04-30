import { Injectable, NotFoundException } from '@nestjs/common';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { DataPathsService } from '../storage/data-paths.service';
import { SkillPack, SkillPackLesson, SkillPackTaskRef } from './skillpack.types';

type LessonLookup = {
  lesson: SkillPackLesson;
  sectionId: string;
};

@Injectable()
export class SkillpacksService {
  private readonly cache = new Map<string, SkillPack>();

  constructor(private readonly paths: DataPathsService) {}

  async listSkillPacks() {
    const dir = this.paths.skillsDir;
    const entries = await readdir(dir, { withFileTypes: true });
    const packs: SkillPack[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillId = entry.name;
      try {
        const pack = await this.getSkillPack(skillId);
        packs.push(pack);
      } catch {}
    }
    packs.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    return packs;
  }

  async getSkillPack(skillId: string) {
    const cached = this.cache.get(skillId);
    if (cached) return cached;

    const skillJsonPath = path.join(this.paths.skillsDir, skillId, 'skill.json');
    const raw = await readFile(skillJsonPath, 'utf-8');
    const pack = JSON.parse(raw) as SkillPack;
    if (!pack?.id) throw new NotFoundException('Skill pack not found');
    this.cache.set(skillId, pack);
    return pack;
  }

  async getLesson(skillId: string, lessonId: string) {
    const pack = await this.getSkillPack(skillId);
    const lookup = this.findLesson(pack, lessonId);
    if (!lookup) throw new NotFoundException('Lesson not found');
    const markdownPath = path.join(this.paths.skillsDir, skillId, lookup.lesson.markdown);
    const markdown = await readFile(markdownPath, 'utf-8');
    return {
      skillId,
      lessonId: lookup.lesson.id,
      title: lookup.lesson.title,
      sectionId: lookup.sectionId,
      markdown,
      tasks: lookup.lesson.tasks.map((t) => ({
        ...t,
        id: this.makeTaskId(skillId, t.id),
      })),
    };
  }

  async getTask(skillId: string, taskId: string) {
    const pack = await this.getSkillPack(skillId);
    const task = this.findTask(pack, taskId);
    if (!task) throw new NotFoundException('Task not found');
    const promptPath = path.join(this.paths.skillsDir, skillId, task.promptMd);
    const promptMd = await readFile(promptPath, 'utf-8');
    return {
      skillId,
      taskId: this.makeTaskId(skillId, task.id),
      title: task.title,
      promptMd,
      rubric: task.rubric,
      passScore: task.passScore,
      answerFormat: task.answerFormat,
    };
  }

  makeTaskId(skillId: string, taskId: string) {
    return `${skillId}/${taskId}`;
  }

  invalidate(skillId?: string) {
    if (!skillId) {
      this.cache.clear();
      return;
    }
    this.cache.delete(skillId);
  }

  parseTaskId(compositeTaskId: string) {
    const idx = compositeTaskId.indexOf('/');
    if (idx === -1) return null;
    return {
      skillId: compositeTaskId.slice(0, idx),
      taskId: compositeTaskId.slice(idx + 1),
    };
  }

  private findLesson(pack: SkillPack, lessonId: string): LessonLookup | null {
    for (const section of pack.sections ?? []) {
      for (const lesson of section.lessons ?? []) {
        if (lesson.id === lessonId) return { lesson, sectionId: section.id };
      }
    }
    return null;
  }

  private findTask(pack: SkillPack, taskId: string): SkillPackTaskRef | null {
    for (const section of pack.sections ?? []) {
      for (const lesson of section.lessons ?? []) {
        for (const task of lesson.tasks ?? []) {
          if (task.id === taskId) return task;
        }
      }
    }
    return null;
  }
}
