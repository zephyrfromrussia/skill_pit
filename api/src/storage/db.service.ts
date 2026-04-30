import { Injectable } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DataPathsService } from './data-paths.service';

export type AttemptRow = {
  id: string;
  taskId: string;
  createdAt: number;
  userAnswer: string;
  score: number;
  passed: 0 | 1;
  feedbackMd: string;
  rubricBreakdownJson: string;
  modelInfoJson: string;
};

export type LessonProgressRow = {
  key: string;
  skillId: string;
  lessonId: string;
  firstViewedAt: number;
  lastViewedAt: number;
  completed: 0 | 1;
};

@Injectable()
export class DbService {
  private readonly db: DatabaseSync;

  constructor(paths: DataPathsService) {
    mkdirSync(path.dirname(paths.dbPath), { recursive: true });
    this.db = new DatabaseSync(paths.dbPath);
    this.db.exec(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        userAnswer TEXT NOT NULL,
        score INTEGER NOT NULL,
        passed INTEGER NOT NULL,
        feedbackMd TEXT NOT NULL,
        rubricBreakdownJson TEXT NOT NULL,
        modelInfoJson TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_attempts_taskId_createdAt ON attempts (taskId, createdAt DESC);

      CREATE TABLE IF NOT EXISTS lesson_progress (
        key TEXT PRIMARY KEY,
        skillId TEXT NOT NULL,
        lessonId TEXT NOT NULL,
        firstViewedAt INTEGER NOT NULL,
        lastViewedAt INTEGER NOT NULL,
        completed INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_lesson_progress_skillId_lastViewedAt ON lesson_progress (skillId, lastViewedAt DESC);
      CREATE INDEX IF NOT EXISTS idx_lesson_progress_lastViewedAt ON lesson_progress (lastViewedAt DESC);
    `);
  }

  getAttempts(taskId: string): AttemptRow[] {
    const stmt = this.db.prepare(`
      SELECT id, taskId, createdAt, userAnswer, score, passed, feedbackMd, rubricBreakdownJson, modelInfoJson
      FROM attempts
      WHERE taskId = ?
      ORDER BY createdAt DESC
      LIMIT 50
    `);
    return stmt.all(taskId) as AttemptRow[];
  }

  insertAttempt(attempt: AttemptRow) {
    const stmt = this.db.prepare(`
      INSERT INTO attempts (id, taskId, createdAt, userAnswer, score, passed, feedbackMd, rubricBreakdownJson, modelInfoJson)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      attempt.id,
      attempt.taskId,
      attempt.createdAt,
      attempt.userAnswer,
      attempt.score,
      attempt.passed,
      attempt.feedbackMd,
      attempt.rubricBreakdownJson,
      attempt.modelInfoJson,
    );
  }

  getPassedTaskIds(): string[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT taskId
      FROM attempts
      WHERE passed = 1
    `);
    const rows = stmt.all() as Array<{ taskId: string }>;
    return rows.map((r) => r.taskId);
  }

  upsertLessonViewed(args: { skillId: string; lessonId: string; at?: number }) {
    const at = args.at ?? Date.now();
    const key = makeLessonKey(args.skillId, args.lessonId);
    const stmt = this.db.prepare(`
      INSERT INTO lesson_progress (key, skillId, lessonId, firstViewedAt, lastViewedAt, completed)
      VALUES (?, ?, ?, ?, ?, 0)
      ON CONFLICT(key) DO UPDATE SET
        lastViewedAt = excluded.lastViewedAt
    `);
    stmt.run(key, args.skillId, args.lessonId, at, at);
  }

  setLessonCompleted(args: { skillId: string; lessonId: string; completed: boolean; at?: number }) {
    const at = args.at ?? Date.now();
    const key = makeLessonKey(args.skillId, args.lessonId);
    const stmt = this.db.prepare(`
      INSERT INTO lesson_progress (key, skillId, lessonId, firstViewedAt, lastViewedAt, completed)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        lastViewedAt = excluded.lastViewedAt,
        completed = excluded.completed
    `);
    stmt.run(key, args.skillId, args.lessonId, at, at, args.completed ? 1 : 0);
  }

  getSkillLessonProgress(skillId: string) {
    const stmt = this.db.prepare(`
      SELECT key, skillId, lessonId, firstViewedAt, lastViewedAt, completed
      FROM lesson_progress
      WHERE skillId = ?
      ORDER BY lastViewedAt DESC
    `);
    return stmt.all(skillId) as LessonProgressRow[];
  }

  getContinueLesson() {
    const stmt = this.db.prepare(`
      SELECT key, skillId, lessonId, firstViewedAt, lastViewedAt, completed
      FROM lesson_progress
      ORDER BY lastViewedAt DESC
      LIMIT 1
    `);
    return (stmt.get() as LessonProgressRow | undefined) ?? null;
  }
}

function makeLessonKey(skillId: string, lessonId: string) {
  return `${skillId}/${lessonId}`;
}
