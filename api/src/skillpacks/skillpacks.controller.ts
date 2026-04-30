import { Controller, Get, Param } from '@nestjs/common';
import { DbService } from '../storage/db.service';
import { SkillpacksService } from './skillpacks.service';

@Controller()
export class SkillpacksController {
  constructor(
    private readonly skillpacks: SkillpacksService,
    private readonly db: DbService,
  ) {}

  @Get('skills')
  async listSkills() {
    const packs = await this.skillpacks.listSkillPacks();
    const passed = new Set(this.db.getPassedTaskIds());

    return packs.map((p) => {
      const allTaskIds: string[] = [];
      for (const section of p.sections ?? []) {
        for (const lesson of section.lessons ?? []) {
          for (const task of lesson.tasks ?? []) {
            allTaskIds.push(this.skillpacks.makeTaskId(p.id, task.id));
          }
        }
      }

      const passedCount = allTaskIds.filter((id) => passed.has(id)).length;
      return {
        id: p.id,
        version: p.version,
        title: p.title,
        description: p.description,
        tags: p.tags ?? [],
        progress: {
          passed: passedCount,
          total: allTaskIds.length,
        },
      };
    });
  }

  @Get('skills/:skillId')
  async getSkill(@Param('skillId') skillId: string) {
    const pack = await this.skillpacks.getSkillPack(skillId);
    return pack;
  }

  @Get('skills/:skillId/lessons/:lessonId')
  async getLesson(
    @Param('skillId') skillId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.skillpacks.getLesson(skillId, lessonId);
  }

  @Get('skills/:skillId/tasks/:taskId')
  async getTask(
    @Param('skillId') skillId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.skillpacks.getTask(skillId, taskId);
  }

  @Get('skills/:skillId/tasks/:taskId/attempts')
  async getAttempts(
    @Param('skillId') skillId: string,
    @Param('taskId') taskId: string,
  ) {
    const fullTaskId = this.skillpacks.makeTaskId(skillId, taskId);
    return this.db.getAttempts(fullTaskId);
  }
}

