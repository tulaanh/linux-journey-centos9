import fs from 'fs';
import path from 'path';

const lessonsDir = path.resolve('src/data/lessons');
const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.json'));

let totalSteps = 0;
let totalQuizzes = 0;
let errors = 0;

for (const file of files) {
  const filePath = path.join(lessonsDir, file);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const doc = JSON.parse(raw);

    if (typeof doc.id !== 'number') {
      console.error(`[FAIL] ${file}: missing or invalid id`);
      errors++;
    }
    if (!doc.slug) {
      console.error(`[FAIL] ${file}: missing slug`);
      errors++;
    }
    if (!doc.title) {
      console.error(`[FAIL] ${file}: missing title`);
      errors++;
    }
    if (!Array.isArray(doc.steps) || doc.steps.length === 0) {
      console.error(`[FAIL] ${file}: missing steps array`);
      errors++;
    }

    let lessonQuizzes = 0;
    doc.steps.forEach((step, idx) => {
      if (step.stepIndex !== idx) {
        // Warning if index mismatches
      }
      if (step.quiz) {
        lessonQuizzes++;
        if (typeof step.quiz.correctIndex !== 'number' || !Array.isArray(step.quiz.options)) {
          console.error(`[FAIL] ${file} step ${idx}: invalid quiz structure`);
          errors++;
        }
      }
    });

    totalSteps += doc.steps.length;
    totalQuizzes += lessonQuizzes;
    console.log(`[OK] ${file.padEnd(25)} | id: ${String(doc.id).padStart(3)} | steps: ${String(doc.steps.length).padStart(2)} | quizzes: ${lessonQuizzes} | title: ${doc.title}`);
  } catch (err) {
    console.error(`[ERROR] ${file}: ${err.message}`);
    errors++;
  }
}

console.log('----------------------------------------------------');
console.log(`Total lesson files: ${files.length}`);
console.log(`Total interactive steps: ${totalSteps}`);
console.log(`Total quizzes: ${totalQuizzes}`);
console.log(`Errors: ${errors}`);

if (errors > 0) {
  process.exit(1);
}
