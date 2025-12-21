'use client';

import { VoteOption } from '@/lib/types';

interface ResultsChartProps {
  options: VoteOption[];
  showPercentage?: boolean;
}

export default function ResultsChart({ options, showPercentage = true }: ResultsChartProps) {
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(...options.map(o => o.votes));

  return (
    <div className="space-y-4">
      {sortedOptions.map((option, index) => {
        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        const isWinner = option.votes === maxVotes && maxVotes > 0;

        return (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isWinner && index === 0 && (
                  <svg className="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
                <span className={`font-medium ${isWinner && index === 0 ? 'text-gold-600' : 'text-navy-800'}`}>
                  {option.label}
                </span>
              </div>
              <span className="text-navy-500">
                <span className="text-navy-800 font-semibold">{option.votes}</span> vote{option.votes !== 1 ? 's' : ''}
                {showPercentage && totalVotes > 0 && (
                  <span className="ml-2 text-gold-600 font-medium">({percentage.toFixed(1)}%)</span>
                )}
              </span>
            </div>
            <div className="h-3 bg-navy-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isWinner && index === 0
                    ? 'bg-gradient-to-r from-gold-400 to-gold-500'
                    : 'bg-gradient-to-r from-navy-400 to-navy-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="pt-4 mt-4 border-t border-navy-200">
        <p className="text-center text-navy-500">
          Total: <span className="font-semibold text-gold-600">{totalVotes}</span> vote{totalVotes !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
