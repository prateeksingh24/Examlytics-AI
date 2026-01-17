import React, { useState } from 'react';

interface BotAnalysisProps {
  analysisText: string;
  planText?: string;
  loading: boolean;
  onGenerate: () => void;
  onGeneratePlan: () => void;
}

interface Section {
  title: string;
  type: 'neutral' | 'positive' | 'negative' | 'info' | 'strategy';
  content: string[];
}

export const BotAnalysis: React.FC<BotAnalysisProps> = ({ 
  analysisText, 
  planText, 
  loading, 
  onGenerate, 
  onGeneratePlan 
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'plan'>('report');
  
  // Helper: Detect bold text **text** and render it
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Parser: Groups raw text lines into logical sections
  const parseAnalysis = (text: string): Section[] => {
    if (!text) return [];
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && l !== '•');
    const sections: Section[] = [];
    let currentSection: Section = { title: "Executive Summary", type: 'neutral', content: [] };

    // Keywords to identify section types
    const sectionTypes: Record<string, Section['type']> = {
      "strength": "positive",
      "strong": "positive",
      "weak": "negative",
      "improve": "negative",
      "risk": "negative",
      "recommendation": "strategy",
      "plan": "strategy",
      "day": "strategy",
      "timeline": "info",
      "mentor": "info",
      "category": "info"
    };

    lines.forEach(line => {
      // Check if line is a header (starts/ends with ** or ## or is a known section)
      const isHeaderLine = (line.startsWith('**') && line.endsWith('**')) || 
                           (line.startsWith('##')) || 
                           (line.endsWith(':') && line.length < 50);

      const cleanLine = line.replace(/\*\*/g, '').replace(/##/g, '').replace(/:$/, '').trim();
      
      if (isHeaderLine) {
        // Determine type based on keywords
        let type: Section['type'] = 'neutral';
        const lowerTitle = cleanLine.toLowerCase();
        
        // Default logic
        for (const [key, t] of Object.entries(sectionTypes)) {
          if (lowerTitle.includes(key)) {
            type = t;
            break;
          }
        }

        // Specific overrides for Study Plan
        if (lowerTitle.includes('day') || lowerTitle.includes('weekend')) type = 'info';

        // Push previous section if it has content
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        
        currentSection = { title: cleanLine, type, content: [] };
      } else {
        // Clean list bullets
        const contentLine = line.replace(/^[•\-\*]\s*/, '');
        if (contentLine) {
          currentSection.content.push(contentLine);
        }
      }
    });

    // Push final section
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  };

  // Determine which text to show based on tab
  const currentText = activeTab === 'report' ? analysisText : (planText || '');
  const sections = parseAnalysis(currentText);

  // Helper: Get color classes based on section type
  const getColors = (type: Section['type']) => {
    switch (type) {
      case 'positive': return 'bg-emerald-50 border-emerald-100 text-emerald-900 icon-emerald-500';
      case 'negative': return 'bg-rose-50 border-rose-100 text-rose-900 icon-rose-500';
      case 'strategy': return 'bg-blue-50 border-blue-100 text-blue-900 icon-blue-500';
      case 'info': return 'bg-indigo-50 border-indigo-100 text-indigo-900 icon-indigo-500';
      default: return 'bg-white border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden flex flex-col h-full relative">
      
      {/* Tab Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 pt-4 pb-0 flex flex-col shrink-0">
        <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="text-white">
                <h2 className="text-lg font-bold tracking-tight">Mentor Intelligence</h2>
                <p className="text-indigo-100 text-xs opacity-80">AI-Driven Insights</p>
              </div>
            </div>
            
            {!loading && !analysisText && activeTab === 'report' && (
              <button 
                onClick={onGenerate}
                className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-50 transition shadow-lg text-xs flex items-center gap-2"
              >
                <span>Generate Report</span>
              </button>
            )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-2">
            <button 
                onClick={() => setActiveTab('report')}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative top-[1px] ${
                    activeTab === 'report' 
                    ? 'bg-white text-indigo-600 border-t border-x border-white' 
                    : 'bg-white/10 text-indigo-100 hover:bg-white/20'
                }`}
            >
                Analysis Report
            </button>
            <button 
                onClick={() => setActiveTab('plan')}
                disabled={!analysisText}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors relative top-[1px] flex items-center gap-2 ${
                    activeTab === 'plan' 
                    ? 'bg-white text-indigo-600 border-t border-x border-white' 
                    : 'bg-white/10 text-indigo-100 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
            >
                Study Plan 
                {activeTab !== 'plan' && !planText && analysisText && <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>}
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 bg-gray-50/50 min-h-[450px] flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-indigo-50 rounded-full"></div>
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-indigo-900 font-bold text-lg">
                    {activeTab === 'report' ? 'Analyzing Performance...' : 'Designing Study Plan...'}
                </p>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    {activeTab === 'report' 
                        ? 'Identifying weak spots, time sinks, and strength areas.' 
                        : 'Structuring daily goals, revision blocks, and mock test schedules.'}
                </p>
            </div>
          </div>
        ) : (
            <>
                {activeTab === 'report' && !analysisText && (
                    <div className="flex flex-col items-center justify-center h-80 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium">No Analysis Yet</p>
                        <p className="text-xs mt-1 max-w-xs">Generate the report first to unlock the study plan.</p>
                    </div>
                )}

                {activeTab === 'plan' && !planText && analysisText && (
                     <div className="flex flex-col items-center justify-center h-80 text-center bg-white rounded-xl border border-indigo-100 p-8">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to take action?</h3>
                        <p className="text-gray-500 mb-6 max-w-sm">Generate a personalized 1-week study plan based on your weak chapters and time management analysis.</p>
                        <button 
                            onClick={onGeneratePlan}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 transform active:scale-95 duration-150"
                        >
                           <span>Generate Personalized Plan</span>
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </button>
                     </div>
                )}

                {/* Content Render */}
                {((activeTab === 'report' && analysisText) || (activeTab === 'plan' && planText)) && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {sections.map((section, idx) => {
                        const colors = getColors(section.type);
                        return (
                            <div key={idx} className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${colors}`}>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-sm opacity-90 border-b border-black/5 pb-2">
                                {section.type === 'positive' && <span className="text-xl">✅</span>}
                                {section.type === 'negative' && <span className="text-xl">⚠️</span>}
                                {section.type === 'strategy' && <span className="text-xl">🎯</span>}
                                {section.type === 'info' && <span className="text-xl">📅</span>}
                                {section.title}
                            </h3>
                            <div className="space-y-3">
                                {section.content.map((line, lIdx) => (
                                <div key={lIdx} className="flex items-start gap-3 group">
                                    <span className={`mt-2 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0 group-hover:scale-125 transition-transform`} />
                                    <p className="text-sm leading-relaxed opacity-90">{renderText(line)}</p>
                                </div>
                                ))}
                            </div>
                            </div>
                        );
                        })}
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};
