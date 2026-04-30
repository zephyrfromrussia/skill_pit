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
}

