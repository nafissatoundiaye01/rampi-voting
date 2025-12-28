'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, DbVote, DbVoteOption, DbVoteRecord, DbAdmin } from './supabase';
import { Vote, VoteOption, VoteRecord, VoterInfo, Admin } from './types';

interface DataContextType {
  votes: Vote[];
  voteRecords: VoteRecord[];
  admins: Admin[];
  currentAdmin: Admin | null;
  isAdminLoggedIn: boolean;
  isSuperAdmin: boolean;
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
  addAdmin: (email: string, password: string) => Promise<boolean>;
  deleteAdmin: (id: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshAdmins: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ADMIN: 'rampi_admin',
  ADMIN_EMAIL: 'rampi_admin_email',
  VISITOR: 'rampi_visitor'
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convertir DbAdmin en Admin
  const convertDbToAdmin = (dbAdmin: DbAdmin): Admin => ({
    id: dbAdmin.id,
    email: dbAdmin.email,
    isSuperAdmin: dbAdmin.is_super_admin,
    createdAt: dbAdmin.created_at
  });

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

      if (recordsError) throw recordsError;

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

  // Charger les admins
  const loadAdmins = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const convertedAdmins = (data || []).map(convertDbToAdmin);
      setAdmins(convertedAdmins);
    } catch (error) {
      console.error('Erreur lors du chargement des admins:', error);
    }
  }, []);

  // Charger les donnees au demarrage
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      // Verifier l'etat de connexion admin
      if (typeof window !== 'undefined') {
        const savedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN);
        const savedEmail = localStorage.getItem(STORAGE_KEYS.ADMIN_EMAIL);

        if (savedAdmin === 'true' && savedEmail) {
          setIsAdminLoggedIn(true);

          // Recuperer les infos de l'admin
          try {
            const { data } = await supabase
              .from('admins')
              .select('*')
              .eq('email', savedEmail)
              .single();

            if (data) {
              const admin = convertDbToAdmin(data);
              setCurrentAdmin(admin);

              // Charger les admins si c'est un super admin
              if (admin.isSuperAdmin) {
                await loadAdmins();
              }
            }
          } catch (error) {
            console.error('Erreur lors de la recuperation de l\'admin:', error);
          }
        }
      }

      await loadVotes();
      setIsLoading(false);
    };

    init();
  }, [loadVotes, loadAdmins]);

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

  // Rafraichir les admins
  const refreshAdmins = async () => {
    await loadAdmins();
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

      const admin = convertDbToAdmin(data);
      setCurrentAdmin(admin);
      setIsAdminLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN, 'true');
        localStorage.setItem(STORAGE_KEYS.ADMIN_EMAIL, email);
      }

      // Charger les admins si c'est un super admin
      if (admin.isSuperAdmin) {
        await loadAdmins();
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
    setCurrentAdmin(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ADMIN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_EMAIL);
    }
  };

  // Ajouter un admin
  const addAdmin = async (email: string, password: string): Promise<boolean> => {
    if (!currentAdmin?.isSuperAdmin) {
      console.error('Seul un super admin peut ajouter des admins');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('admins')
        .insert({
          email,
          password_hash: password,
          is_super_admin: false
        })
        .select()
        .single();

      if (error) throw error;

      const newAdmin = convertDbToAdmin(data);
      setAdmins(prev => [...prev, newAdmin]);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'admin:', error);
      return false;
    }
  };

  // Supprimer un admin
  const deleteAdmin = async (id: string): Promise<boolean> => {
    if (!currentAdmin?.isSuperAdmin) {
      console.error('Seul un super admin peut supprimer des admins');
      return false;
    }

    // Empecher la suppression du super admin
    const adminToDelete = admins.find(a => a.id === id);
    if (adminToDelete?.isSuperAdmin) {
      console.error('Impossible de supprimer le super admin');
      return false;
    }

    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAdmins(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'admin:', error);
      return false;
    }
  };

  // Changer son mot de passe
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentAdmin) {
      console.error('Aucun admin connecte');
      return false;
    }

    try {
      // Verifier le mot de passe actuel
      const { data: verifyData, error: verifyError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', currentAdmin.id)
        .eq('password_hash', currentPassword)
        .single();

      if (verifyError || !verifyData) {
        console.error('Mot de passe actuel incorrect');
        return false;
      }

      // Mettre a jour le mot de passe
      const { error: updateError } = await supabase
        .from('admins')
        .update({ password_hash: newPassword })
        .eq('id', currentAdmin.id);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return false;
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

  const isSuperAdmin = currentAdmin?.isSuperAdmin || false;

  return (
    <DataContext.Provider value={{
      votes,
      voteRecords,
      admins,
      currentAdmin,
      isAdminLoggedIn,
      isSuperAdmin,
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
      refreshVotes,
      addAdmin,
      deleteAdmin,
      changePassword,
      refreshAdmins
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
