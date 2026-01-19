import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { TestReport } from '../types';

interface ChartsProps {
  data: TestReport;
}

const COLORS = {
  correct: '#10b981', // emerald-500
  incorrect: '#ef4444', // red-500
  unattempted: '#94a3b8', // slate-400
  physics: '#8b5cf6', // violet-500
  chemistry: '#3b82f6', // blue-500
  math: '#f59e0b', // amber-500
};

export const ScoreDistributionChart: React.FC<ChartsProps> = ({ data }) => {
  const chartData = data.subjectWiseAnalysis.map(sub => ({
    name: sub.subject,
    value: (sub.correct * 4) - (sub.incorrect * 1)
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.physics : index === 1 ? COLORS.chemistry : COLORS.math} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AttemptDistributionChart: React.FC<ChartsProps> = ({ data }) => {
    // Aggregating totals
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnattempted = 0;

    data.subjectWiseAnalysis.forEach(s => {
        totalCorrect += s.correct;
        totalIncorrect += s.incorrect;
        totalUnattempted += s.unattempted;
    });

    const chartData = [
        { name: 'Correct', value: totalCorrect, color: COLORS.correct },
        { name: 'Incorrect', value: totalIncorrect, color: COLORS.incorrect },
        { name: 'Unattempted', value: totalUnattempted, color: COLORS.unattempted },
    ];

    return (
        <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={false}
                    >
                         {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Legend verticalAlign="top" height={36}/>
                    <RechartsTooltip />
                </PieChart>
             </ResponsiveContainer>
        </div>
    )
}

export const DifficultyAnalysisChart: React.FC<ChartsProps> = ({ data }) => {
    // Overall difficulty
    const overall = data.levelWiseAnalysis.find(x => x.subject === 'Overall');
    if (!overall) return <div>No difficulty data</div>;

    const chartData = [
        { name: 'Easy', Correct: overall.correct.easy, Incorrect: overall.incorrect.easy, Skipped: overall.unattempted.easy },
        { name: 'Medium', Correct: overall.correct.medium, Incorrect: overall.incorrect.medium, Skipped: overall.unattempted.medium },
        { name: 'Tough', Correct: overall.correct.tough, Incorrect: overall.incorrect.tough, Skipped: overall.unattempted.tough },
    ];

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip cursor={{fill: 'transparent'}} />
                    <Legend />
                    <Bar dataKey="Correct" stackId="a" fill={COLORS.correct} barSize={40} isAnimationActive={false} />
                    <Bar dataKey="Incorrect" stackId="a" fill={COLORS.incorrect} barSize={40} isAnimationActive={false} />
                    <Bar dataKey="Skipped" stackId="a" fill={COLORS.unattempted} barSize={40} isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
