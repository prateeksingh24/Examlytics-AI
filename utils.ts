import { TestReport, ChapterPerformance } from './types';

// Scoring Logic: +4 for correct, -1 for incorrect
export const calculateTotalScore = (report: TestReport): number => {
  // If JSON has a total score field, we would use it, but based on current types we calculate it.
  let score = 0;
  report.subjectWiseAnalysis.forEach((sub) => {
    score += (sub.correct * 4) - (sub.incorrect * 1);
  });
  return score;
};

// Updated Category Assignment based on the new prompt:
// 275–300 → Elite, 250–274 → Excellent, 225–249 → Very Strong, 200–224 → Strong
// 175–199 → Good, 150–174 → Improving, 125–149 → Average, 100–124 → Weak, 75–99 → Very Weak, < 75 → Critical
export const getCategory = (score: number): { label: string; color: string } => {
  if (score >= 275) return { label: 'Elite', color: 'text-purple-600 bg-purple-50 border-purple-200' };
  if (score >= 250) return { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (score >= 225) return { label: 'Very Strong', color: 'text-green-600 bg-green-50 border-green-200' };
  if (score >= 200) return { label: 'Strong', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (score >= 175) return { label: 'Good', color: 'text-blue-500 bg-blue-50 border-blue-200' };
  if (score >= 150) return { label: 'Improving', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
  if (score >= 125) return { label: 'Average', color: 'text-orange-500 bg-orange-50 border-orange-200' };
  if (score >= 100) return { label: 'Weak', color: 'text-orange-600 bg-orange-50 border-orange-200' };
  if (score >= 75) return { label: 'Very Weak', color: 'text-red-500 bg-red-50 border-red-200' };
  return { label: 'Critical', color: 'text-red-700 bg-red-50 border-red-200' };
};

// Strict rules from prompt: (correct >= 1) AND (incorrect = 0) AND (unanswered <= 1)
export const identifyStrongChapters = (report: TestReport): ChapterPerformance[] => {
  const strong: ChapterPerformance[] = [];
  report.chaperWisePerformance.forEach(subject => {
    subject.chapters.forEach(ch => {
      if (ch.correct >= 1 && ch.incorrect === 0 && ch.unanswered <= 1) {
        strong.push(ch);
      }
    });
  });
  return strong;
};

// Strict rules from prompt: (incorrect >= 1) OR (unanswered >= 1 AND correct = 0)
export const identifyWeakChapters = (report: TestReport): ChapterPerformance[] => {
  const weak: ChapterPerformance[] = [];
  report.chaperWisePerformance.forEach(subject => {
    subject.chapters.forEach(ch => {
      if ((ch.incorrect >= 1) || (ch.unanswered >= 1 && ch.correct === 0)) {
        weak.push(ch);
      }
    });
  });
  return weak;
};

export const formatTime = (secondsString: string): string => {
   return secondsString;
}

export const cleanText = (text: string) => {
  return text.replace(/\*\*/g, '').replace(/###/g, '');
}
