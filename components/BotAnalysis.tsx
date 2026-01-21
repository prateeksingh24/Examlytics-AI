import React, { useState } from 'react';

interface BotAnalysisProps {
  analysisText: string;
  planText?: string;
  loading: boolean;
}

interface Section {
  title: string;
  type: 'neutral' | 'positive' | 'negative' | 'info' | 'strategy';
  content: string[];
}

export const BotAnalysis: React.FC<BotAnalysisProps> = ({ 
  analysisText, 
  planText, 
  loading
}) => {
  const [copied, setCopied] = useState(false);
  
  // Robust Text Renderer: Handles **bold** text inline
  const renderText = (text: string) => {
    // Split by **text** pattern
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        return <strong key={index} className="font-bold text-gray-900">{content}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Improved Parser: Uses Regex to identify headers and content blocks
  const parseAnalysis = (text: string): Section[] => {
    if (!text) return [];
    
    // Split lines and remove pure empty lines
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && l !== '•');
    const sections: Section[] = [];
    
    let currentSection: Section = { 
      title: "Executive Summary", 
      type: 'neutral', 
      content: [] 
    };

    // Regex Definitions
    // Catch: "## Header", "**Header**", "Header:", "### **Header**"
    const headerRegex = /^(\#{1,6}\s+|(?:\*\*|__)(.*?)(?:\*\*|__)$|^[A-Z][\w\s&]+:$|^\d+\.\s+\*\*.*?\*\*$)/; 

    // Section Type Keyword Mapping
    const sectionTypes: Record<string, Section['type']> = {
      "strength": "positive",
      "strong": "positive",
      "weak": "negative",
      "improve": "negative",
      "risk": "negative",
      "recommendation": "strategy",
      "plan": "strategy",
      "action": "strategy",
      "strategy": "strategy",
      "day": "strategy",
      "timeline": "info",
      "mentor": "info",
      "category": "info",
      "summary": "neutral",
      "steps": "info",
      "focus": "strategy"
    };

    lines.forEach(line => {
      // Heuristic 1: Is it a clear header line?
      let isHeader = false;
      let cleanLine = line;

      // Check regex
      if (headerRegex.test(line)) {
        // Exclude lines that are actually list items with bold starts like "**Note:** content"
        // If line is long (> 60 chars) and contains bold at start, it's likely content key-value
        if (line.startsWith('**') && line.includes('**') && line.length > 60 && !line.endsWith('**')) {
          isHeader = false;
        } else {
           isHeader = true;
           // Cleanup marks: remove #, *, - from start and : from end
           cleanLine = line.replace(/^[#*-\s\d\.]+|[#*:\s]+$/g, '').trim();
        }
      } 
      // Heuristic 2: Short uppercase lines ending in colon
      else if (line.endsWith(':') && line.length < 40) {
        isHeader = true;
        cleanLine = line.replace(/:$/, '').trim();
      }

      if (isHeader && cleanLine.length > 0) {
        // Save previous section
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }

        // Determine Type
        let type: Section['type'] = 'neutral';
        const lowerTitle = cleanLine.toLowerCase();

        // Default type logic
        for (const [key, t] of Object.entries(sectionTypes)) {
          if (lowerTitle.includes(key)) {
            type = t;
            break;
          }
        }
        // Specific override for Plan tab specific keywords
        if (lowerTitle.includes('day') || lowerTitle.includes('weekend')) type = 'info';

        currentSection = { title: cleanLine, type, content: [] };
      } else {
        // It's Content
        let contentLine = line.trim();

        // Critical Fix: Only strip bullets if they are NOT part of bold formatting (**Text**)
        // Remove '• ', '- ', or '* ' (if single star)
        if (contentLine.startsWith('•')) {
            contentLine = contentLine.replace(/^•\s*/, '');
        } else if (contentLine.startsWith('-')) {
            contentLine = contentLine.replace(/^-\s*/, '');
        } else if (contentLine.startsWith('*') && !contentLine.startsWith('**')) {
            // Only remove asterisk if it's a list bullet, not bold start
            contentLine = contentLine.replace(/^\*\s*/, '');
        }

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

  const handleShare = async () => {
    const textToShare = `*Examlytics AI Report*\n\nANALYSIS:\n${analysisText.replace(/\*\*/g, '')}\n\n${planText ? `STUDY PLAN:\n${planText.replace(/\*\*/g, '')}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Examlytics Analysis',
          text: textToShare,
        });
      } catch (err) {
        console.debug("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  const analysisSections = parseAnalysis(analysisText);
  const planSections = parseAnalysis(planText || "");

  // Helper: Get color classes based on section type
  const getColors = (type: Section['type']) => {
    switch (type) {
      case 'positive': return 'bg-emerald-50 border-emerald-100 text-emerald-900';
      case 'negative': return 'bg-rose-50 border-rose-100 text-rose-900';
      case 'strategy': return 'bg-blue-50 border-blue-100 text-blue-900';
      case 'info': return 'bg-indigo-50 border-indigo-100 text-indigo-900';
      default: return 'bg-white border-gray-200 text-gray-800';
    }
  };

  const getIcon = (type: Section['type']) => {
    switch (type) {
        case 'positive': return '✅';
        case 'negative': return '⚠️';
        case 'strategy': return '🎯';
        case 'info': return '📅';
        default: return '📝';
    }
  }

  const renderSectionList = (sections: Section[]) => {
    return sections.map((section, idx) => {
        const colors = getColors(section.type);
        const icon = getIcon(section.type);
        return (
            <div key={idx} className={`rounded-xl border p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${colors} break-inside-avoid print:break-inside-avoid`}>
            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 uppercase tracking-wide opacity-90 border-b border-black/5 pb-2">
                <span className="text-xl shrink-0">{icon}</span>
                <span className="break-words">{section.title}</span>
            </h3>
            <div className="space-y-3">
                {section.content.map((line, lIdx) => (
                <div key={lIdx} className="flex items-start gap-3 group">
                    <span className={`mt-2 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0 group-hover:scale-125 transition-transform`} />
                    <p className="text-sm leading-relaxed opacity-90 break-words w-full">{renderText(line)}</p>
                </div>
                ))}
            </div>
            </div>
        );
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden flex flex-col h-full relative w-full print:h-auto print:border-none print:shadow-none print:overflow-visible print:block">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 sm:px-6 py-5 flex items-center justify-between shrink-0 print:bg-none print:text-black">
         <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm text-white shrink-0 print:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            </div>
            <div className="text-white print:text-indigo-900">
                <h2 className="text-lg font-bold tracking-tight leading-tight">Mentor Intelligence</h2>
                <p className="text-indigo-100 text-xs opacity-80 print:text-indigo-600">AI-Driven Insights & Planning</p>
            </div>
         </div>
         
         {/* Share Button */}
         {analysisText && !loading && (
             <button 
                onClick={handleShare} 
                className={`
                    p-2 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 text-sm font-medium print:hidden
                    ${copied ? 'bg-green-500/90 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}
                `}
                title="Share Analysis"
             >
                {copied ? (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="hidden sm:inline">Copied</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        <span className="hidden sm:inline">Share</span>
                    </>
                )}
             </button>
         )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6 bg-gray-50/50 min-h-[550px] max-h-[1200px] overflow-y-auto custom-scrollbar flex-grow print:overflow-visible print:h-auto print:max-h-none print:bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-indigo-50 rounded-full"></div>
                </div>
            </div>
            <div className="text-center space-y-2 px-4">
                <p className="text-indigo-900 font-bold text-lg">Analyzing Performance & Generating Plan...</p>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Identifying weak spots, time sinks, and creating your personalized study schedule.
                </p>
            </div>
          </div>
        ) : (
            <>
                {!analysisText ? (
                    <div className="flex flex-col items-center justify-center h-80 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 mx-4">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-medium">No Analysis Yet</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        
                        {/* Report Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
                                <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider">Part 1</span>
                                <h3 className="text-xl font-bold text-gray-800">Performance Report</h3>
                            </div>
                            {renderSectionList(analysisSections)}
                        </div>

                        {/* Divider */}
                        {planText && (
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-300 border-dashed"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-gray-50 px-4 text-sm text-gray-500 font-medium">Next Steps</span>
                                </div>
                            </div>
                        )}

                        {/* Plan Section */}
                        {planText && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
                                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider">Part 2</span>
                                    <h3 className="text-xl font-bold text-gray-800">Personalized Study Plan</h3>
                                </div>
                                {renderSectionList(planSections)}
                            </div>
                        )}
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};