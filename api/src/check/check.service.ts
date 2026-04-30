import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import { DbService } from '../storage/db.service';
import { SkillpacksService } from '../skillpacks/skillpacks.service';
import { LlmClientService } from './llm-client.service';

type CheckRequest = {
  skillId: string;
  taskId: string;
  userAnswer: string;
  llm: {
    baseUrl: string;
    model: string;
  };
};

type CheckResult = {
  attemptId: string;
  score0to10: number;
  passed: boolean;
  feedbackMd: string;
  rubricBreakdown: Array<{ id: string; title: string; score0to10: number; notes: string }>;
  modelInfo: { model: string; usage: unknown };
};

@Injectable()
export class CheckService {
  constructor(
    private readonly skillpacks: SkillpacksService,
    private readonly llm: LlmClientService,
    private readonly db: DbService,
  ) {}

  async check(req: CheckRequest): Promise<CheckResult> {
    const task = await this.skillpacks.getTask(req.skillId, req.taskId);
    const attemptId = crypto.randomUUID();
    const createdAt = Date.now();

    const messages = [
      {
        role: 'system' as const,
        content:
          'Ты — строгий, но доброжелательный проверяющий. Верни ТОЛЬКО валидный JSON без текста вокруг. Не используй Markdown. Не добавляй пояснений вне JSON.',
      },
      {
        role: 'user' as const,
        content: JSON.stringify(
          {
            task: {
              title: task.title,
              promptMd: task.promptMd,
              passScore: task.passScore,
              answerFormat: task.answerFormat,
              rubric: task.rubric,
            },
            userAnswer: req.userAnswer,
            outputSchema: {
              score0to10: 'number (0..10)',
              rubricBreakdown:
                'array of { id: string, title: string, score0to10: number (0..10), notes: string }',
              feedbackMd: 'string (короткий разбор и конкретные рекомендации)',
            },
          },
          null,
          2,
        ),
      },
    ];

    let llmRaw: { content: string; model: string; usage: unknown } | null = null;
    let parsed: any = null;

    try {
      llmRaw = await this.llm.chatJson({
        baseUrl: req.llm.baseUrl,
        model: req.llm.model,
        messages,
      });
      parsed = JSON.parse(extractJsonObject(llmRaw.content));
    } catch (e) {
      const feedback = `Не удалось выполнить проверку через LM Studio. Проверь, что сервер запущен и endpoint указан верно.\n\nТехническая причина: ${(e as Error)?.message ?? String(e)}`;
      const rubricBreakdown = (task.rubric ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        score0to10: 0,
        notes: 'Проверка не выполнена: LM Studio недоступен.',
      }));
      this.db.insertAttempt({
        id: attemptId,
        taskId: task.taskId,
        createdAt,
        userAnswer: req.userAnswer,
        score: 0,
        passed: 0,
        feedbackMd: feedback,
        rubricBreakdownJson: JSON.stringify(rubricBreakdown),
        modelInfoJson: JSON.stringify({ model: null, usage: null }),
      });
      return {
        attemptId,
        score0to10: 0,
        passed: false,
        feedbackMd: feedback,
        rubricBreakdown,
        modelInfo: { model: '', usage: null },
      };
    }

    const score0to10 = clampNumber(parsed?.score0to10, 0, 10) ?? 0;
    const rubricBreakdown = Array.isArray(parsed?.rubricBreakdown)
      ? parsed.rubricBreakdown
          .map((r: any) => ({
            id: String(r?.id ?? ''),
            title: String(r?.title ?? ''),
            score0to10: clampNumber(r?.score0to10, 0, 10) ?? 0,
            notes: String(r?.notes ?? ''),
          }))
          .filter((r: any) => r.id && r.title)
      : [];
    const feedbackMd = String(parsed?.feedbackMd ?? '');
    const passed = score0to10 >= task.passScore;

    this.db.insertAttempt({
      id: attemptId,
      taskId: task.taskId,
      createdAt,
      userAnswer: req.userAnswer,
      score: Math.round(score0to10),
      passed: passed ? 1 : 0,
      feedbackMd,
      rubricBreakdownJson: JSON.stringify(rubricBreakdown),
      modelInfoJson: JSON.stringify({ model: llmRaw?.model ?? null, usage: llmRaw?.usage ?? null }),
    });

    return {
      attemptId,
      score0to10,
      passed,
      feedbackMd,
      rubricBreakdown,
      modelInfo: { model: llmRaw?.model ?? '', usage: llmRaw?.usage ?? null },
    };
  }
}

function extractJsonObject(input: string) {
  const start = input.indexOf('{');
  const end = input.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('LLM output does not contain JSON object');
  }
  return input.slice(start, end + 1);
}

function clampNumber(value: unknown, min: number, max: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.min(max, Math.max(min, value));
}
