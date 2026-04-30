export type SkillPackSection = {
  id: string;
  title: string;
  order: number;
  lessons: SkillPackLesson[];
};

export type SkillPackLesson = {
  id: string;
  title: string;
  order: number;
  markdown: string;
  tasks: SkillPackTaskRef[];
};

export type SkillPackTaskRef = {
  id: string;
  title: string;
  promptMd: string;
  rubric: Array<{
    id: string;
    title: string;
    weight: number;
  }>;
  passScore: number;
  answerFormat: 'text' | 'tsx' | 'ts' | 'js';
};

export type SkillPack = {
  id: string;
  version: string;
  title: string;
  description: string;
  tags: string[];
  sections: SkillPackSection[];
};

