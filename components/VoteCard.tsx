'use client';

import Link from 'next/link';
import { Vote } from '@/lib/types';

interface VoteCardProps {
  vote: Vote;
  hasVoted?: boolean;
}

export default function VoteCard({ vote, hasVoted }: VoteCardProps) {
  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
  const endDate = new Date(vote.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="card rounded-2xl p-6 hover:shadow-lg hover:border-gold-400 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-navy-900 group-hover:text-gold-600 transition-colors">{vote.title}</h3>
        {hasVoted && (
          <span className="badge-gold px-3 py-1 text-sm rounded-full font-medium">
            Vote enregistre
          </span>
        )}
      </div>

      <p className="text-navy-600 mb-4 line-clamp-2">{vote.description}</p>

      <div className="flex items-center gap-4 text-sm text-navy-500 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-navy-700 font-medium">{totalVotes}</span> vote{totalVotes !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {daysLeft > 0 ? `${daysLeft} jour${daysLeft !== 1 ? 's' : ''} restant${daysLeft !== 1 ? 's' : ''}` : 'Se termine aujourd\'hui'}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-5">
        {vote.options.slice(0, 3).map((option) => (
          <span
            key={option.id}
            className="badge-navy px-3 py-1 text-xs rounded-full"
          >
            {option.label}
          </span>
        ))}
        {vote.options.length > 3 && (
          <span className="text-xs text-navy-400">+{vote.options.length - 3} autres</span>
        )}
      </div>

      <Link
        href={`/vote/${vote.id}`}
        className="block w-full text-center py-3 btn-gold rounded-xl"
      >
        {hasVoted ? 'Voir les resultats' : 'Participer au vote'}
      </Link>
    </div>
  );
}
