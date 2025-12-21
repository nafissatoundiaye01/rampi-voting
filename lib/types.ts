export interface VoteOption {
  id: string;
  label: string;
  votes: number;
}

export interface Vote {
  id: string;
  title: string;
  description: string;
  options: VoteOption[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  showResults: boolean;
  createdAt: string;
}

export interface VoterInfo {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  pays: string;
}

export interface VoteRecord {
  id: string;
  voteId: string;
  optionId: string;
  optionLabel: string;
  visitorId: string;
  voterInfo: VoterInfo;
  votedAt: string;
}

export interface Admin {
  email: string;
  password: string;
}
