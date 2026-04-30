import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DbService } from '../storage/db.service';

@Controller()
export class ProgressController {
  constructor(private readonly db: DbService) {}

  @Get('progress/continue')
  getContinue() {
    const row = this.db.getContinueLesson();
    if (!row) return { ok: true, continue: null };
    return {
      ok: true,
      continue: {
        skillId: row.skillId,
        lessonId: row.lessonId,
        lastViewedAt: row.lastViewedAt,
        completed: row.completed === 1,
      },
    };
  }

  @Get('progress/skills/:skillId')
  getSkillProgress(@Param('skillId') skillId: string) {
    const rows = this.db.getSkillLessonProgress(skillId);
    return {
      ok: true,
      skillId,
      viewedLessonIds: rows.map((r) => r.lessonId),
      completedLessonIds: rows.filter((r) => r.completed === 1).map((r) => r.lessonId),
      lastLessonId: rows[0]?.lessonId ?? null,
    };
  }

  @Post('progress/lesson-viewed')
  lessonViewed(@Body() body: { skillId: string; lessonId: string }) {
    if (!body?.skillId || !body?.lessonId) return { ok: false };
    this.db.upsertLessonViewed({ skillId: body.skillId, lessonId: body.lessonId });
    return { ok: true };
  }

  @Post('progress/lesson-completed')
  lessonCompleted(@Body() body: { skillId: string; lessonId: string; completed?: boolean }) {
    if (!body?.skillId || !body?.lessonId) return { ok: false };
    this.db.setLessonCompleted({
      skillId: body.skillId,
      lessonId: body.lessonId,
      completed: body.completed ?? true,
    });
    return { ok: true };
  }
}

