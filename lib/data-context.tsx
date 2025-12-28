'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, DbVote, DbVoteOption, DbVoteRecord } from './supabase';
import { Vote, VoteOption, VoteRecord, VoterInfo } from './types';

interface DataContextType {
  votes: Vote[];
  voteRecords: VoteRecord[];
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  createVote: (vote: Omit<Vote, 'id' | 'createdAt'>) => Promise<Vote | null>;
  updateVote: (id: string, vote: Partial<Vote>) => Promise<void>;
  deleteVote: (id: string) => Promise<void>;
  castVote: (voteId: string, optionId: string, visitorId: string, voterInfo: VoterInfo) => Promise<boolean>;
  hasVoted: (voteId: string, visitorId: string) => boolean;
  hasEmailVoted: (voteId: string, email: string) => boolean;
  getActiveVotes: () => Vote[];
  getVoteById: (id: string) => Vote | undefined;
  getVoteRecords: (voteId: string) => VoteRecord[];
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  refreshVotes: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ADMIN: 'rampi_admin',
  VISITOR: 'rampi_visitor'
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convertir les donnees Supabase en format local
  const convertDbToVote = (dbVote: DbVote, options: DbVoteOption[]): Vote => ({
    id: dbVote.id,
    title: dbVote.title,
    description: dbVote.description || '',
    startDate: dbVote.start_date,
    startTime: dbVote.start_time || '00:00',
    endDate: dbVote.end_date,
    endTime: dbVote.end_time || '23:59',
    showResults: dbVote.show_results,
    createdAt: dbVote.created_at,
    options: options.map(opt => ({
      id: opt.id,
      label: opt.label,
      votes: opt.votes_count
    }))
  });

  const convertDbToRecord = (dbRecord: DbVoteRecord): VoteRecord => ({
    id: dbRecord.id,
    voteId: dbRecord.vote_id,
    optionId: dbRecord.option_id,
    optionLabel: dbRecord.option_label,
    visitorId: dbRecord.visitor_id,
    voterInfo: {
      nom: dbRecord.voter_nom,
      prenom: dbRecord.voter_prenom,
      email: dbRecord.voter_email,
      telephone: dbRecord.voter_telephone,
      pays: dbRecord.voter_pays
    },
    votedAt: dbRecord.voted_at
  });

  // Charger les votes depuis Supabase
  const loadVotes = useCallback(async () => {
    try {
      // Charger tous les votes
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .order('created_at', { ascending: false });

      if (votesError) throw votesError;

      // Charger toutes les options
      const { data: optionsData, error: optionsError } = await supabase
        .from('vote_options')
        .select('*');

      if (optionsError) throw optionsError;

      // Charger tous les enregistrements
      const { data: recordsData, error: recordsError } = await supabase
        .from('vote_records')
        .select('*')
        .order('voted_at', { ascending: false });

      if (recordsError) {
        console.error('Erreur lors du chargement des vote_records:', recordsError);
      }

      console.log('Vote records charges:', recordsData?.length || 0, 'enregistrements');

      // Convertir les donnees
      const convertedVotes: Vote[] = (votesData || []).map((dbVote: DbVote) => {
        const voteOptions = (optionsData || []).filter(
          (opt: DbVoteOption) => opt.vote_id === dbVote.id
        );
        return convertDbToVote(dbVote, voteOptions);
      });

      const convertedRecords: VoteRecord[] = (recordsData || []).map(convertDbToRecord);

      setVotes(convertedVotes);
      setVoteRecords(convertedRecords);
    } catch (error) {
      console.error('Erreur lors du chargement des votes:', error);
    }
  }, []);

  // Charger les donnees au demarrage
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      // Verifier l'etat de connexion admin
      if (typeof window !== 'undefined') {
        const savedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN);
        if (savedAdmin === 'true') {
          setIsAdminLoggedIn(true);
        }
      }

      await loadVotes();
      setIsLoading(false);
    };

    init();
  }, [loadVotes]);

  // Rafraichir les votes
  const refreshVotes = async () => {
    await loadVotes();
  };

  // Creer un nouveau vote
  const createVote = async (voteData: Omit<Vote, 'id' | 'createdAt'>): Promise<Vote | null> => {
    try {
      // Inserer le vote
      const { data: newVote, error: voteError } = await supabase
        .from('votes')
        .insert({
          title: voteData.title,
          description: voteData.description,
          start_date: voteData.startDate,
          start_time: voteData.startTime || '00:00',
          end_date: voteData.endDate,
          end_time: voteData.endTime || '23:59',
          show_results: voteData.showResults
        })
        .select()
        .single();

      if (voteError) throw voteError;

      // Inserer les options
      const optionsToInsert = voteData.options.map(opt => ({
        vote_id: newVote.id,
        label: opt.label,
        votes_count: 0
      }));

      const { data: newOptions, error: optionsError } = await supabase
        .from('vote_options')
        .insert(optionsToInsert)
        .select();

      if (optionsError) throw optionsError;

      const createdVote = convertDbToVote(newVote, newOptions || []);
      setVotes(prev => [createdVote, ...prev]);

      return createdVote;
    } catch (error) {
      console.error('Erreur lors de la creation du vote:', error);
      return null;
    }
  };

  // Mettre a jour un vote
  const updateVote = async (id: string, voteData: Partial<Vote>) => {
    try {
      // Mettre a jour le vote
      const updateData: Record<string, unknown> = {};
      if (voteData.title) updateData.title = voteData.title;
      if (voteData.description !== undefined) updateData.description = voteData.description;
      if (voteData.startDate) updateData.start_date = voteData.startDate;
      if (voteData.startTime) updateData.start_time = voteData.startTime;
      if (voteData.endDate) updateData.end_date = voteData.endDate;
      if (voteData.endTime) updateData.end_time = voteData.endTime;
      if (voteData.showResults !== undefined) updateData.show_results = voteData.showResults;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('votes')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
      }

      // Si les options sont mises a jour
      if (voteData.options) {
        // Supprimer les anciennes options
        await supabase.from('vote_options').delete().eq('vote_id', id);

        // Inserer les nouvelles options
        const optionsToInsert = voteData.options.map(opt => ({
          vote_id: id,
          label: opt.label,
          votes_count: opt.votes || 0
        }));

        await supabase.from('vote_options').insert(optionsToInsert);
      }

      await refreshVotes();
    } catch (error) {
      console.error('Erreur lors de la mise a jour du vote:', error);
    }
  };

  // Supprimer un vote
  const deleteVote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVotes(prev => prev.filter(vote => vote.id !== id));
      setVoteRecords(prev => prev.filter(record => record.voteId !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du vote:', error);
    }
  };

  // Voter
  const castVote = async (voteId: string, optionId: string, visitorId: string, voterInfo: VoterInfo): Promise<boolean> => {
    if (hasVoted(voteId, visitorId) || hasEmailVoted(voteId, voterInfo.email)) {
      return false;
    }

    const vote = votes.find(v => v.id === voteId);
    const option = vote?.options.find(o => o.id === optionId);

    if (!vote || !option) {
      return false;
    }

    try {
      // Incrementer le compteur de votes
      const { error: updateError } = await supabase
        .from('vote_options')
        .update({ votes_count: option.votes + 1 })
        .eq('id', optionId);

      if (updateError) throw updateError;

      // Enregistrer le vote
      const { data: newRecord, error: recordError } = await supabase
        .from('vote_records')
        .insert({
          vote_id: voteId,
          option_id: optionId,
          option_label: option.label,
          visitor_id: visitorId,
          voter_nom: voterInfo.nom,
          voter_prenom: voterInfo.prenom,
          voter_email: voterInfo.email,
          voter_telephone: voterInfo.telephone,
          voter_pays: voterInfo.pays
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Mettre a jour l'etat local
      setVotes(prev => prev.map(v => {
        if (v.id === voteId) {
          return {
            ...v,
            options: v.options.map(o =>
              o.id === optionId ? { ...o, votes: o.votes + 1 } : o
            )
          };
        }
        return v;
      }));

      setVoteRecords(prev => [convertDbToRecord(newRecord), ...prev]);

      return true;
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      return false;
    }
  };

  // Verifier si un visiteur a deja vote
  const hasVoted = (voteId: string, visitorId: string): boolean => {
    return voteRecords.some(record =>
      record.voteId === voteId && record.visitorId === visitorId
    );
  };

  // Verifier si un email a deja vote
  const hasEmailVoted = (voteId: string, email: string): boolean => {
    return voteRecords.some(record =>
      record.voteId === voteId && record.voterInfo?.email?.toLowerCase() === email.toLowerCase()
    );
  };

  // Obtenir les votes actifs
  const getActiveVotes = (): Vote[] => {
    const now = new Date();
    return votes.filter(vote => {
      const start = new Date(vote.startDate);
      if (vote.startTime) {
        const [startHours, startMinutes] = vote.startTime.split(':').map(Number);
        start.setHours(startHours, startMinutes, 0, 0);
      } else {
        start.setHours(0, 0, 0, 0);
      }

      const end = new Date(vote.endDate);
      if (vote.endTime) {
        const [endHours, endMinutes] = vote.endTime.split(':').map(Number);
        end.setHours(endHours, endMinutes, 59, 999);
      } else {
        end.setHours(23, 59, 59, 999);
      }

      return now >= start && now <= end;
    });
  };

  // Obtenir un vote par ID
  const getVoteById = (id: string): Vote | undefined => {
    return votes.find(vote => vote.id === id);
  };

  // Obtenir les enregistrements d'un vote
  const getVoteRecords = (voteId: string): VoteRecord[] => {
    return voteRecords.filter(record => record.voteId === voteId);
  };

  // Connexion admin
  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        return false;
      }

      setIsAdminLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN, 'true');
      }
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  };

  // Deconnexion admin
  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ADMIN);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{
      votes,
      voteRecords,
      isAdminLoggedIn,
      isLoading,
      createVote,
      updateVote,
      deleteVote,
      castVote,
      hasVoted,
      hasEmailVoted,
      getActiveVotes,
      getVoteById,
      getVoteRecords,
      loginAdmin,
      logoutAdmin,
      refreshVotes
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Obtenir ou creer l'ID visiteur
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR);
  if (!visitorId) {
    visitorId = uuidv4();
    localStorage.setItem(STORAGE_KEYS.VISITOR, visitorId);
  }
  return visitorId;
}
