import { GoogleGenAI } from "@google/genai";
import { TestReport } from '../types';

const SYSTEM_PROMPT = `
You are an Academic Performance Analyst & Entrance Exam Mentor AI (Specializing in JEE & NEET).
Your job is to analyze a test performance report provided in JSON and produce a category-specific, actionable improvement plan.
You must behave like:
A senior mentor (Ex-IITian or Medical Rank Holder context)
A test-analysis expert
A rank-improvement strategist
You are NOT:
A motivational speaker
A generic study advisor
A content summarizer
NON-NEGOTIABLE PRINCIPLES
Strategy must change by performance level (marks band).
Recommendations
Every conclusion must be tied to JSON data; never invent missing data.
Advice must be actionable, time-bound, exam-oriented (marks, accuracy, speed, selection).
No generic lines (“study more”, “revise properly”).
Highlight what exactly to do next test and what mentor must monitor.
SCORING RULES (CRITICAL)
If JSON contains totalMarks or totalScore, use it.
Else compute score using:
Default: +4 per correct, −1 per incorrect, 0 unattempted.
DATA EXTRACTION RULES (STRICT)
Use ONLY these fields:
subjectWiseAnalysis (correct/incorrect/unattempted)
accuracyAndAttemptAnalysis (accuracyPercent/attemptPercent)
speedAndTimeAnalysis (timeTaken, avgTimeCorrect, avgTimeIncorrect, marksEarnedPerMin)
questionWiseAnalysis (chapter, subtopic, status, incorrectReason, timeTaken vs AvgCorrectTimeByOthers)
chaperWisePerformance (chapter-wise correct/incorrect/unanswered)
levelWiseAnalysis (easy/medium/tough breakdown)
ERROR TAXONOMY (MANDATORY)
Classify improvement points into:
Conceptual gap
Formula recall/knowledge gap
Calculation mistake
Careless/silly mistake
Time-management / question-selection issue
Additionally classify errors as:
Unforced errors (preventable: silly, misread, wrong formula, unit, rushed)
Recommendations
Forced errors (due to difficulty/time pressure)
Recommendations
CHAPTER SELECTION RULES (NO HALLUCINATION)
Strong Chapters must be picked only from chaperWisePerformance where:
(correct ≥ 1) AND (incorrect = 0) AND (unanswered ≤ 1)
Weak Chapters must be picked only from chaperWisePerformance where:
(incorrect ≥ 1) OR (unanswered ≥ 1 AND correct = 0) OR (accuracy low from question outcomes)
If there are too few chapters to classify, state: “Insufficient chapter-level attempts to label reliably.”
OUTPUT DISCIPLINE
Use only the headings requested.
Use bullet points and compact tables.
No emojis, no storytelling, no repetition, no filler explanations.
Keep all recommendations “do X for Y days with Z measurable target”.
Failure to follow structure or using non-data-based claims is unacceptable.
`;

export const generateAnalysis = async (data: TestReport): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userPrompt = `
  TASK: Generate a category-wise Test Analysis & Improvement Report derived strictly from JSON for a JEE/NEET aspirant.
  
  User JSON Data:
  ${JSON.stringify(data)}

  STEP 0: COMPUTE TOTAL SCORE (MANDATORY)
  If JSON has totalMarks/totalScore, use it.
  Else compute: Score = 4*(totalCorrect) − 1*(totalIncorrect) where totalCorrect/totalIncorrect come from subjectWiseAnalysis sum.
  State explicitly whether score was provided or computed and which scheme was assumed.
  STEP 1: CATEGORY ASSIGNMENT (0–300 scale or similar percentage)
  Based on total marks out of 300:
  275–300 → Elite 250–274 → Excellent 225–249 → Very Strong 200–224 → Strong 175–199 → Good 150–174 → Improving 125–149 → Average 100–124 → Weak 75–99 → Very Weak < 75 → Critical
  STEP 2: REPORT STRUCTURE (FOLLOW EXACT HEADINGS + ORDER)
  Category & Overall Diagnosis
  Strength
  Areas to Improve
  Strong Chapters
  Weak Chapters
  Your Focus Areas (NEW - CRITICAL SECTION)
  Recommendation (Category-Specific Strategy)
  Subject-Wise Action Plan (only for weak/inconsistent subjects)
  Physics (if applicable)
  Chemistry (if applicable)
  Mathematics / Biology (if applicable)
  Timeline & Milestones
  Mentor Action Items
  STEP 3: WHAT TO ANALYZE (DATA-DRIVEN)
  Use these analyses:
  A) Attempts & Accuracy
  Subject-wise attempt%, accuracy%, and “attempt vs accuracy imbalance”.
  B) Speed & Time
  Total time per subject
  avg time in correct vs incorrect
  marksEarnedPerMin per subject
  Identify “time sinks” where:
  avgTimeSpentInIncorrectQues is high OR
  student time is much higher than AvgCorrectTimeByOthers in questionWiseAnalysis.
  C) Chapter/Topic Signals
  Strong/weak chapters strictly from chaperWisePerformance
  Mention top 3 weak subtopics (from questionWiseAnalysis) only if present.
  D) Error Pattern Summary
  Count errors by incorrectReason when available.
  Convert to taxonomy: conceptual/formula/calculation/careless/time-selection.
  Split into forced vs unforced.
  STEP 4: LOGIC FOR "Your Focus Areas" (MANDATORY)
  Synthesize the Weak Chapters list and top Error Reasons (e.g., Calculation mistakes, Conceptual gaps).
  Identify exactly 3-5 highest priority areas.
  Format each bullet as: "**[Topic/Skill]**: [Specific Actionable Advice]".
  Example: "**Thermodynamics**: Revise cyclic process formulas; solve 15 PYQs to fix conceptual errors."
  STEP 5: RECOMMENDATION RULES (MUST INCLUDE)
  Daily structure (time blocks + objective)
  Weekly test strategy (sectional + full mock cadence)
  Revision method (short notes / formula sheets / spaced review)
  Error-log system (format + daily use)
  Subject time split (based on where marks/min & accuracy are worst)
  STEP 6: TIMELINE (MANDATORY OUTPUT)
  Provide:
  6-week goal (score + accuracy/attempt targets)
  3-month target
  6-month target
  1-year expected outcome (marks/rank oriented; if rank cannot be inferred, say so and give marks band only)
  STEP 7: MENTOR VIEW (END INSIDE “Mentor Action Items”)
  Must contain:
  Current category
  Target next category
  Expected mark jump next test (give a range + what must happen to achieve it)
  Chapters to monitor
  Risk flags (if any: low attempt, low accuracy, time wastage, high unforced errors)
  STRICT OUTPUT RULES:
  No emojis
  No motivational quotes
  No generic advice
  No repetition
  Data-driven only
  If any required field is missing in JSON, explicitly say what is missing and proceed with available data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate analysis. Please check your API key and try again.";
  }
};

export const generateStudyPlan = async (data: TestReport): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userPrompt = `
  TASK: Create a 1-Week Intensive Personalized Study Plan based on this test report.
  User JSON Data: ${JSON.stringify(data)}

  OBJECTIVE: Fix the specific weak chapters and time management issues found in the report while maintaining strengths.

  OUTPUT FORMAT STRICT RULES:
  1. Use Markdown headers for days (e.g., "**Day 1: Physics Fix & Chemistry Recall**").
  2. For each day, provide 3 blocks:
     - Morning (High Focus - New Concepts/Hard Weak Areas)
     - Afternoon (Practice - Question Solving/Timed Sets)
     - Evening (Revision - Formula Lists/Error Log)
  3. Specifically name the chapters from the JSON 'incorrect' or 'unattempted' list to study.
  4. Include a "Weekend Strategy" section at the end for Mock Tests.
  
  DO NOT give generic advice. Be specific: "Solve 30 Questions on [Weak Chapter Name]".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        // Higher thinking budget for planning complex schedules if needed, 
        // but for now standard is fine. We want creative planning.
        temperature: 0.7, 
      }
    });
    return response.text || "No plan generated.";
  } catch (error) {
    console.error("Gemini Plan Error:", error);
    return "Failed to generate study plan.";
  }
};