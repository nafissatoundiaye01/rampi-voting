'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { useData } from '@/lib/data-context';
import VoteForm from '@/components/VoteForm';

export default function EditVotePage() {
  const params = useParams();
  const router = useRouter();
  const { getVoteById, isAdminLoggedIn } = useData();

  const vote = getVoteById(params.id as string);

  if (!isAdminLoggedIn) {
    return null;
  }

  if (!vote) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white rounded-2xl p-12 shadow-sm border border-slate-100 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Vote non trouve</h1>
            <p className="text-slate-500 mb-6">Ce vote n&apos;existe pas ou a ete supprime.</p>
            <Link
              href="/admin/votes"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl font-medium hover:bg-navy-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux votes
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <VoteForm vote={vote} mode="edit" />
    </AdminLayout>
  );
}
