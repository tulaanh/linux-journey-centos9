export interface LessonCodeBlock {
  type: 'syntax' | 'command' | 'diagram' | 'output';
  code: string;
  language?: string;
  caption?: string;
  runnableCommand?: string;
}

export interface LessonContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'code' | 'callout';
  text?: string;
  level?: 2 | 3 | 4;
  items?: string[];
  variant?: 'info' | 'tip' | 'warning';
  codeBlock?: LessonCodeBlock;
}

export interface LessonQuizOption {
  text: string;
  isCode?: boolean;
}

export interface LessonQuiz {
  id: string;
  question: string;
  options: LessonQuizOption[];
  correctIndex: number;
  explanation?: string;
}

export interface LessonHandsOnTask {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  runnableCommand?: string;
  buttonLabel?: string;
  checkCriteria?: {
    type: 'history_includes' | 'cwd_equals' | 'file_exists';
    value: string;
  };
}

export interface LessonHandsOnSection {
  id: string;
  title: string;
  description: string;
  isPrimary?: boolean;
  tasks?: LessonHandsOnTask[];
  runnableCommand?: string;
  buttonLabel?: string;
}

export interface LessonSummaryTakeaway {
  text: string;
  enText?: string;
}

export interface LessonStep {
  id: string;
  stepIndex: number;
  type: 'content' | 'quiz' | 'hands_on' | 'summary';
  title?: string;
  blocks?: LessonContentBlock[];
  quiz?: LessonQuiz;
  handsOn?: LessonHandsOnSection[];
  takeaways?: LessonSummaryTakeaway[];
}

export interface LessonDocument {
  id: number;
  slug: string;
  category: string;
  lessonNumber: number;
  title: string;
  subtitle: string;
  defaultCwd?: string;
  steps: LessonStep[];
}
