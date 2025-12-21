'use client';

import AdminLayout from '@/components/AdminLayout';
import VoteForm from '@/components/VoteForm';

export default function NewVotePage() {
  return (
    <AdminLayout>
      <VoteForm mode="create" />
    </AdminLayout>
  );
}
