export type SkillListItem = {
  id: string
  version: string
  title: string
  description: string
  tags: string[]
  progress: { passed: number; total: number }
}

export type SkillPack = {
  id: string
  version: string
  title: string
  description: string
  tags: string[]
  sections: Array<{
    id: string
    title: string
    order: number
    lessons: Array<{
      id: string
      title: string
      order: number
      markdown: string
      tasks: Array<{
        id: string
        title: string
        promptMd: string
        rubric: Array<{ id: string; title: string; weight: number }>
        passScore: number
        answerFormat: 'text' | 'tsx' | 'ts' | 'js'
      }>
    }>
  }>
}

export type LessonDto = {
  skillId: string
  lessonId: string
  title: string
  sectionId: string
  markdown: string
  tasks: Array<{
    id: string
    title: string
    promptMd: string
    rubric: Array<{ id: string; title: string; weight: number }>
    passScore: number
    answerFormat: 'text' | 'tsx' | 'ts' | 'js'
  }>
}

export type TaskDto = {
  skillId: string
  taskId: string
  title: string
  promptMd: string
  rubric: Array<{ id: string; title: string; weight: number }>
  passScore: number
  answerFormat: 'text' | 'tsx' | 'ts' | 'js'
}

export type AttemptDto = {
  id: string
  taskId: string
  createdAt: number
  userAnswer: string
  score: number
  passed: 0 | 1
  feedbackMd: string
  rubricBreakdownJson: string
  modelInfoJson: string
}

export type CheckResponse = {
  attemptId: string
  score0to10: number
  passed: boolean
  feedbackMd: string
  rubricBreakdown: Array<{ id: string; title: string; score0to10: number; notes: string }>
  modelInfo: { model: string; usage: unknown }
}

export type ContinueResponse = {
  ok: true
  continue: null | {
    skillId: string
    lessonId: string
    lastViewedAt: number
    completed: boolean
  }
}

export type SkillProgressResponse = {
  ok: true
  skillId: string
  viewedLessonIds: string[]
  completedLessonIds: string[]
  lastLessonId: string | null
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api/${path.replace(/^\//, '')}`, {
    method: 'GET',
    headers: { accept: 'application/json' },
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as T
}

export async function apiPostJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/${path.replace(/^\//, '')}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as T
}
