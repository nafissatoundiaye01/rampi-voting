'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Vote, VoteRecord, Admin, VoterInfo } from './types';

interface DataContextType {
  votes: Vote[];
  voteRecords: VoteRecord[];
  isAdminLoggedIn: boolean;
  createVote: (vote: Omit<Vote, 'id' | 'createdAt'>) => Vote;
  updateVote: (id: string, vote: Partial<Vote>) => void;
  deleteVote: (id: string) => void;
  castVote: (voteId: string, optionId: string, visitorId: string, voterInfo: VoterInfo) => boolean;
  hasVoted: (voteId: string, visitorId: string) => boolean;
  hasEmailVoted: (voteId: string, email: string) => boolean;
  getActiveVotes: () => Vote[];
  getVoteById: (id: string) => Vote | undefined;
  getVoteRecords: (voteId: string) => VoteRecord[];
  loginAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const ADMIN_CREDENTIALS: Admin = {
  email: 'admin@rampi.com',
  password: 'admin123'
};

const STORAGE_KEYS = {
  VOTES: 'rampi_votes',
  RECORDS: 'rampi_records',
  ADMIN: 'rampi_admin',
  VISITOR: 'rampi_visitor'
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voteRecords, setVoteRecords] = useState<VoteRecord[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVotes = localStorage.getItem(STORAGE_KEYS.VOTES);
      const savedRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
      const savedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN);

      if (savedVotes) {
        setVotes(JSON.parse(savedVotes));
      } else {
        // Create demo votes
        const demoVotes: Vote[] = [
          {
            id: uuidv4(),
            title: 'Meilleur langage de programmation 2024',
            description: 'Votez pour votre langage de programmation favori cette annee.',
            options: [
              { id: uuidv4(), label: 'JavaScript', votes: 15 },
              { id: uuidv4(), label: 'Python', votes: 22 },
              { id: uuidv4(), label: 'TypeScript', votes: 18 },
              { id: uuidv4(), label: 'Rust', votes: 8 }
            ],
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            showResults: true,
            createdAt: new Date().toISOString()
          },
          {
            id: uuidv4(),
            title: 'Choix du theme pour la prochaine conference',
            description: 'Aidez-nous a choisir le theme de notre prochaine conference tech.',
            options: [
              { id: uuidv4(), label: 'Intelligence Artificielle', votes: 30 },
              { id: uuidv4(), label: 'Developpement Web', votes: 20 },
              { id: uuidv4(), label: 'Cybersecurite', votes: 25 },
              { id: uuidv4(), label: 'Cloud Computing', votes: 12 }
            ],
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            showResults: true,
            createdAt: new Date().toISOString()
          }
        ];
        setVotes(demoVotes);
        localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(demoVotes));
      }

      if (savedRecords) {
        setVoteRecords(JSON.parse(savedRecords));
      }

      if (savedAdmin === 'true') {
        setIsAdminLoggedIn(true);
      }

      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
    }
  }, [votes, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(voteRecords));
    }
  }, [voteRecords, isLoaded]);

  const createVote = (voteData: Omit<Vote, 'id' | 'createdAt'>): Vote => {
    const newVote: Vote = {
      ...voteData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      options: voteData.options.map(opt => ({
        ...opt,
        id: opt.id || uuidv4(),
        votes: 0
      }))
    };
    setVotes(prev => [...prev, newVote]);
    return newVote;
  };

  const updateVote = (id: string, voteData: Partial<Vote>) => {
    setVotes(prev => prev.map(vote =>
      vote.id === id ? { ...vote, ...voteData } : vote
    ));
  };

  const deleteVote = (id: string) => {
    setVotes(prev => prev.filter(vote => vote.id !== id));
    setVoteRecords(prev => prev.filter(record => record.voteId !== id));
  };

  const castVote = (voteId: string, optionId: string, visitorId: string, voterInfo: VoterInfo): boolean => {
    if (hasVoted(voteId, visitorId) || hasEmailVoted(voteId, voterInfo.email)) {
      return false;
    }

    const vote = votes.find(v => v.id === voteId);
    const option = vote?.options.find(o => o.id === optionId);

    if (!vote || !option) {
      return false;
    }

    // Update vote count
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

    // Record the vote
    const record: VoteRecord = {
      id: uuidv4(),
      voteId,
      optionId,
      optionLabel: option.label,
      visitorId,
      voterInfo,
      votedAt: new Date().toISOString()
    };
    setVoteRecords(prev => [...prev, record]);

    return true;
  };

  const hasVoted = (voteId: string, visitorId: string): boolean => {
    return voteRecords.some(record =>
      record.voteId === voteId && record.visitorId === visitorId
    );
  };

  const hasEmailVoted = (voteId: string, email: string): boolean => {
    return voteRecords.some(record =>
      record.voteId === voteId && record.voterInfo?.email?.toLowerCase() === email.toLowerCase()
    );
  };

  const getActiveVotes = (): Vote[] => {
    const now = new Date();
    return votes.filter(vote => {
      const start = new Date(vote.startDate);
      const end = new Date(vote.endDate);
      end.setHours(23, 59, 59, 999);
      return now >= start && now <= end;
    });
  };

  const getVoteById = (id: string): Vote | undefined => {
    return votes.find(vote => vote.id === id);
  };

  const getVoteRecords = (voteId: string): VoteRecord[] => {
    return voteRecords.filter(record => record.voteId === voteId);
  };

  const loginAdmin = (email: string, password: string): boolean => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setIsAdminLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN, 'true');
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ADMIN);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <DataContext.Provider value={{
      votes,
      voteRecords,
      isAdminLoggedIn,
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
      logoutAdmin
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

// Get or create visitor ID
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR);
  if (!visitorId) {
    visitorId = uuidv4();
    localStorage.setItem(STORAGE_KEYS.VISITOR, visitorId);
  }
  return visitorId;
}
