import type { LessonDocument } from '../types/lessonDoc';

// Auto-load all JSON files in src/data/lessons/
const lessonModules = import.meta.glob<LessonDocument>('../data/lessons/*.json', {
  eager: true,
  import: 'default',
});

const lessonMap = new Map<number, LessonDocument>();
const slugMap = new Map<string, LessonDocument>();

for (const path in lessonModules) {
  const doc = lessonModules[path];
  if (doc && typeof doc.id === 'number') {
    lessonMap.set(doc.id, doc);
    slugMap.set(doc.slug, doc);
  }
}

export function getLessonById(id: number): LessonDocument | undefined {
  return lessonMap.get(id);
}

export function getLessonBySlug(slug: string): LessonDocument | undefined {
  return slugMap.get(slug);
}

export function getAllLessons(): LessonDocument[] {
  return Array.from(lessonMap.values()).sort((a, b) => a.id - b.id);
}

export function hasLessonDoc(id: number): boolean {
  return lessonMap.has(id);
}
