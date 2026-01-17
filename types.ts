export interface SubjectAnalysis {
  subject: string;
  correct: number;
  incorrect: number;
  unattempted: number;
}

export interface AccuracyAttempt {
  subject: string;
  accuracyPercent: string;
  attemptPercent: string;
}

export interface SpeedAnalysis {
  subject: string;
  timeTaken: string;
  avgTimeForCorrectQues: string;
  avgTimeSpentInIncorrectQues: string;
  avgTimeSpentInUnattemptedQues: string;
  marksEarnedPerMin: string;
}

export interface Question {
  qNo: number;
  status: "Correct" | "Incorrect" | "Unattempted";
  chapter: string;
  subtopic: string;
  incorrectReason: string;
  studentCorrectPercentage: number;
  "timeTaken/AvgCorrectTimeByOthers": string;
}

export interface QuestionAnalysis {
  subject: string;
  questions: Question[];
}

export interface ChapterPerformance {
  chapter: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  subtopic: string;
}

export interface SubjectChapterPerformance {
  subject: string;
  chapters: ChapterPerformance[];
}

export interface LevelAnalysis {
  subject: string;
  correct: { easy: number; medium: number; tough: number };
  incorrect: { easy: number; medium: number; tough: number };
  unattempted: { easy: number; medium: number; tough: number };
}

export interface TestReport {
  subjectWiseAnalysis: SubjectAnalysis[];
  accuracyAndAttemptAnalysis: AccuracyAttempt[];
  speedAndTimeAnalysis: SpeedAnalysis[];
  questionWiseAnalysis: QuestionAnalysis[];
  chaperWisePerformance: SubjectChapterPerformance[];
  levelWiseAnalysis: LevelAnalysis[];
}

export interface AnalysisSection {
  title: string;
  content: string;
}
