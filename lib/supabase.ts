import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwsnosftpxxnuphpltgu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3c25vc2Z0cHh4bnVwaHBsdGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMTQ4MjAsImV4cCI6MjA4MTg5MDgyMH0.QzcHT950FNKsxkoMmJDyu9B1k8Ruc-5HMopIltil2mU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables Supabase
export interface DbVote {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  show_results: boolean;
  created_at: string;
}

export interface DbVoteOption {
  id: string;
  vote_id: string;
  label: string;
  votes_count: number;
  created_at: string;
}

export interface DbVoteRecord {
  id: string;
  vote_id: string;
  option_id: string;
  option_label: string;
  visitor_id: string;
  voter_nom: string;
  voter_prenom: string;
  voter_email: string;
  voter_telephone: string;
  voter_pays: string;
  voted_at: string;
}

export interface DbAdmin {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}
