'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/lib/data-context';
import VoteForm from '@/components/VoteForm';

export default function EditVotePage() {
  const params = useParams();
  const { getVoteById } = useData();

  const vote = getVoteById(params.id as string);

  if (!vote) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Vote non trouve</h1>
        <p className="text-gray-600 mb-6">Ce vote n&apos;existe pas ou a ete supprime.</p>
        <Link
          href="/admin"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour au dashboard
        </Link>
      </div>
    );
  }

  return <VoteForm vote={vote} mode="edit" />;
}
