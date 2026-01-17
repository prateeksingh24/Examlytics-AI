import React, { useState } from 'react';
import { calculateTotalScore, getCategory, identifyStrongChapters, identifyWeakChapters } from './utils';
import { generateAnalysis, generateStudyPlan } from './services/geminiService';
import { TestReport } from './types';
import { ScoreDistributionChart, AttemptDistributionChart, DifficultyAnalysisChart } from './components/Charts';
import { BotAnalysis } from './components/BotAnalysis';

const App: React.FC = () => {
  const [report, setReport] = useState<TestReport | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [studyPlan, setStudyPlan] = useState<string>(""); // State for Study Plan
  const [loading, setLoading] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>("");
  const [inputError, setInputError] = useState<string>("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setReport(json);
          setAnalysis(""); 
          setStudyPlan("");
          setInputError("");
        } catch (err) {
          setInputError("Invalid JSON file. Please check the file content.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteSubmit = () => {
    try {
      if (!jsonInput.trim()) {
        setInputError("Please enter JSON data.");
        return;
      }
      const json = JSON.parse(jsonInput);
      setReport(json);
      setAnalysis("");
      setStudyPlan("");
      setInputError("");
    } catch (err) {
      setInputError("Invalid JSON text. Please check the format.");
    }
  };

  const loadDemoData = () => {
    // Demo data based on the provided example
    const demo: TestReport = {
      "subjectWiseAnalysis": [
        { "subject": "Physics", "correct": 23, "incorrect": 1, "unattempted": 1 },
        { "subject": "Chemistry", "correct": 23, "incorrect": 1, "unattempted": 1 },
        { "subject": "Mathematics", "correct": 23, "incorrect": 0, "unattempted": 2 }
      ],
      "accuracyAndAttemptAnalysis": [
        { "subject": "Physics", "accuracyPercent": "95.8", "attemptPercent": "96.0" },
        { "subject": "Chemistry", "accuracyPercent": "95.8", "attemptPercent": "96.0" },
        { "subject": "Mathematics", "accuracyPercent": "100.0", "attemptPercent": "92.0" }
      ],
      "speedAndTimeAnalysis": [
        { "subject": "Physics", "timeTaken": "56m 26s", "avgTimeForCorrectQues": "2m 24s", "avgTimeSpentInIncorrectQues": "2m 20s", "avgTimeSpentInUnattemptedQues": "5s", "marksEarnedPerMin": "1.6" },
        { "subject": "Chemistry", "timeTaken": "57m 48s", "avgTimeForCorrectQues": "2m 7s", "avgTimeSpentInIncorrectQues": "2m 16s", "avgTimeSpentInUnattemptedQues": "3m 19s", "marksEarnedPerMin": "1.6" },
        { "subject": "Mathematics", "timeTaken": "1h 45s", "avgTimeForCorrectQues": "2m 11s", "avgTimeSpentInIncorrectQues": "2m 11s", "avgTimeSpentInUnattemptedQues": "5m 14s", "marksEarnedPerMin": "1.5" }
      ],
      "questionWiseAnalysis": [], 
      "chaperWisePerformance": [
        { "subject": "Physics", "chapters": [
          { "chapter": "Unit and Dimension", "correct": 1, "incorrect": 0, "unanswered": 0, "subtopic": "Applications of Dimensions" },
          { "chapter": "Magnetic Effect of Current", "correct": 2, "incorrect": 1, "unanswered": 1, "subtopic": "Magnetic Force" }
        ]},
        { "subject": "Chemistry", "chapters": [
          { "chapter": "Chemical Bonding", "correct": 2, "incorrect": 0, "unanswered": 0, "subtopic": "Hybridisation" },
          { "chapter": "POC", "correct": 0, "incorrect": 1, "unanswered": 0, "subtopic": "Quantitative analysis" }
        ]},
        { "subject": "Mathematics", "chapters": [
          { "chapter": "Vector -Math", "correct": 1, "incorrect": 0, "unanswered": 1, "subtopic": "Geometry of Vectors" },
          { "chapter": "Calculus", "correct": 2, "incorrect": 0, "unanswered": 0, "subtopic": "Limits" }
        ]}
      ],
      "levelWiseAnalysis": [
        { "subject": "Overall", "correct": { "easy": 28, "medium": 40, "tough": 1 }, "incorrect": { "easy": 1, "medium": 1, "tough": 0 }, "unattempted": { "easy": 1, "medium": 3, "tough": 0 } }
      ]
    };
    setReport(demo);
  };

  const handleGenerateReport = async () => {
    if (!report) return;
    setLoading(true);
    const result = await generateAnalysis(report);
    setAnalysis(result);
    setLoading(false);
  };

  const handleGeneratePlan = async () => {
    if (!report) return;
    setLoading(true);
    const plan = await generateStudyPlan(report);
    setStudyPlan(plan);
    setLoading(false);
  };

  const handleReset = () => {
    setReport(null);
    setAnalysis("");
    setStudyPlan("");
    setJsonInput("");
    setInputError("");
  };

  // ----------------------------------------------------------------------
  // RENDER: Landing / Input View
  // ----------------------------------------------------------------------
  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6 font-inter">
        
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Marketing / Hero */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              AI-Powered Mentor
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Master Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                JEE & NEET
              </span> Scores
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Stop guessing where you lost marks. Upload your test JSON and get a senior mentor-level analysis, personalized strategy, and rank improvement roadmap instantly.
            </p>

            <div className="flex gap-6 pt-4">
              <div className="flex flex-col gap-1">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <span className="font-bold text-gray-800">Deep Analysis</span>
                <span className="text-sm text-gray-500">Pinpoint weak chapters</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-bold text-gray-800">Time Strategy</span>
                <span className="text-sm text-gray-500">Optimize attempt speed</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <span className="font-bold text-gray-800">Rank Booster</span>
                <span className="text-sm text-gray-500">Actionable 6-week plan</span>
              </div>
            </div>
          </div>

          {/* Right Side: Upload Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-100 border border-white p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Analyze Your Performance</h3>
            
            <div className="space-y-6">
              {/* File Upload Area */}
              <label className="block group cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50/50 transition-all group-hover:border-indigo-500 group-hover:bg-indigo-50/30">
                  <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-indigo-500 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <p className="text-gray-900 font-semibold mb-1">Click to upload report</p>
                  <p className="text-sm text-gray-500">Support for .json format</p>
                  <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
                </div>
              </label>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">Or paste JSON</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Text Area Input */}
              <div className="relative">
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Paste your JSON content here...'
                  className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs font-mono text-gray-700 bg-white resize-none"
                />
              </div>

              {inputError && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {inputError}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={handlePasteSubmit}
                  className="flex-1 bg-gray-900 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-gray-800 transition shadow-lg hover:shadow-xl active:scale-95 transform duration-150"
                >
                  Analyze Now
                </button>
                <button 
                  onClick={loadDemoData}
                  className="px-6 py-3.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition border border-gray-200 hover:border-gray-300"
                >
                  Try Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // RENDER: Dashboard View
  // ----------------------------------------------------------------------
  
  const totalScore = calculateTotalScore(report);
  const category = getCategory(totalScore);
  const strongChapters = identifyStrongChapters(report);
  const weakChapters = identifyWeakChapters(report);

  // Calculate Overall Accuracy
  const totalQuestions = report.subjectWiseAnalysis.reduce((acc, curr) => acc + curr.correct + curr.incorrect + curr.unattempted, 0);
  const totalCorrect = report.subjectWiseAnalysis.reduce((acc, curr) => acc + curr.correct, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / (totalQuestions - report.subjectWiseAnalysis.reduce((a,c) => a + c.unattempted, 0))) * 100) : 0;

  return (
    <div className="min-h-screen pb-12 bg-gray-50 font-inter">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                 E
               </div>
               <span className="text-xl font-bold text-gray-900 tracking-tight">
                 Examlytics <span className="text-indigo-600">AI</span>
               </span>
            </div>
            <div className="flex items-center">
              <button onClick={handleReset} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Upload New
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Scoreboard Section */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <span className="text-xl">📊</span> Performance Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Main Score Card */}
              <div className={`rounded-xl p-6 border flex flex-col items-center justify-center text-center relative overflow-hidden ${category.color}`}>
                <div className="absolute top-0 right-0 p-2 opacity-10">
                   <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                </div>
                <span className="font-semibold text-xs uppercase tracking-widest opacity-70 mb-1">Total Score</span>
                <span className="text-5xl font-black tracking-tight mb-2">{totalScore}<span className="text-2xl font-medium opacity-60">/300</span></span>
                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/60 backdrop-blur-md shadow-sm border border-white/40 uppercase tracking-wide">
                  {category.label}
                </span>
              </div>

              {/* Accuracy Card */}
              <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex flex-col items-center justify-center text-center relative group hover:border-blue-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-blue-900 font-medium text-xs uppercase tracking-wider mb-1">Accuracy</span>
                <span className="text-3xl font-bold text-gray-900 mb-1">{accuracy}%</span>
                <span className="text-xs text-blue-500 font-medium bg-blue-100/50 px-2 py-0.5 rounded">Target: >85%</span>
              </div>

               {/* Attempt Card */}
               <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-100 flex flex-col items-center justify-center text-center group hover:border-purple-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <span className="text-purple-900 font-medium text-xs uppercase tracking-wider mb-1">Attempted</span>
                <span className="text-3xl font-bold text-gray-900 mb-1">
                  {report.subjectWiseAnalysis.reduce((a,c) => a+c.correct+c.incorrect, 0)}
                </span>
                <span className="text-xs text-purple-500 font-medium bg-purple-100/50 px-2 py-0.5 rounded">Questions</span>
              </div>

              {/* Breakdown Mini Chart */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col items-center justify-center relative">
                 <div className="absolute top-3 left-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Attempt Distribution</div>
                 <div className="h-28 w-full mt-2">
                    <AttemptDistributionChart data={report} />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout: Charts & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Column: Visual Data */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Subject Performance */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                 Subject Analysis
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {report.subjectWiseAnalysis.map((sub, idx) => (
                    <div key={idx} className="border border-gray-100 bg-gray-50/30 rounded-xl p-4 transition-all hover:shadow-md hover:border-indigo-100 group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-800 text-lg group-hover:text-indigo-700 transition-colors">{sub.subject}</span>
                        <span className={`text-sm font-black px-2 py-1 rounded-md ${
                          ((sub.correct*4 - sub.incorrect) > 30) ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {sub.correct*4 - sub.incorrect} pts
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-medium text-gray-500 gap-1">
                        <div className="flex items-center gap-1">
                           <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {sub.correct} Correct
                        </div>
                        <div className="flex items-center gap-1">
                           <span className="w-2 h-2 rounded-full bg-rose-500"></span> {sub.incorrect} Wrong
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(sub.correct / (sub.correct + sub.incorrect + sub.unattempted)) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
               </div>

               <div className="h-72 border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-center gap-6">
                 <div className="w-full md:w-1/2 h-full">
                    <h4 className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Score Contribution</h4>
                    <ScoreDistributionChart data={report} />
                 </div>
                 <div className="w-full md:w-px h-px md:h-full bg-gray-100"></div>
                 <div className="w-full md:w-1/2 h-full">
                    <h4 className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Difficulty Mastery</h4>
                    <DifficultyAnalysisChart data={report} />
                 </div>
               </div>
            </div>

            {/* Chapter Drill Down */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                Deep Dive: Chapter Level
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Strong Chapters */}
                <div className="bg-green-50/30 rounded-xl border border-green-100/50 p-5">
                  <h4 className="font-bold text-green-800 flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Power Chapters
                  </h4>
                  {strongChapters.length > 0 ? (
                    <div className="space-y-3">
                      {strongChapters.slice(0, 5).map((ch, i) => (
                        <div key={i} className="text-sm bg-white p-3 rounded-lg border border-green-100 shadow-sm flex justify-between items-center group hover:border-green-300 transition-colors">
                          <span className="font-semibold text-gray-700">{ch.chapter}</span>
                          <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                            +{ch.correct * 4} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">No clear strong chapters identified yet.</p>
                  )}
                </div>

                {/* Weak Chapters */}
                <div className="bg-red-50/30 rounded-xl border border-red-100/50 p-5">
                  <h4 className="font-bold text-red-800 flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-red-100 rounded-lg">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    Critical Fixes Needed
                  </h4>
                  {weakChapters.length > 0 ? (
                     <div className="space-y-3">
                     {weakChapters.slice(0, 5).map((ch, i) => (
                       <div key={i} className="text-sm bg-white p-3 rounded-lg border border-red-100 shadow-sm flex justify-between items-center group hover:border-red-300 transition-colors">
                         <span className="font-semibold text-gray-700">{ch.chapter}</span>
                         <div className="flex gap-1">
                            {ch.incorrect > 0 && <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded">-{ch.incorrect} Neg</span>}
                            {ch.unanswered > 0 && <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Skipped</span>}
                         </div>
                       </div>
                     ))}
                   </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center py-4">No critical weak chapters found.</p>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: AI Bot */}
          <div className="lg:col-span-1">
             <div>
                <BotAnalysis 
                  analysisText={analysis} 
                  planText={studyPlan}
                  loading={loading} 
                  onGenerate={handleGenerateReport} 
                  onGeneratePlan={handleGeneratePlan}
                />
                
                {/* Time Metrics Summary underneath */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                     <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                     Speed Efficiency
                   </h3>
                   <div className="space-y-5">
                      {report.speedAndTimeAnalysis.map((s, i) => (
                        <div key={i} className="text-sm group">
                           <div className="flex justify-between mb-2">
                              <span className="text-gray-600 font-medium">{s.subject}</span>
                              <span className="font-mono font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{s.marksEarnedPerMin} pts/min</span>
                           </div>
                           <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${parseFloat(s.marksEarnedPerMin) > 1.0 ? 'bg-indigo-500' : 'bg-orange-400'}`}
                                style={{ width: `${Math.min(parseFloat(s.marksEarnedPerMin) * 25, 100)}%` }}
                              ></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
