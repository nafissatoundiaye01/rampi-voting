'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useData, getVisitorId } from '@/lib/data-context';
import { VoterInfo } from '@/lib/types';
import ResultsChart from '@/components/ResultsChart';

const COUNTRIES = [
  'Sénégal', 'France', 'Belgique', 'Suisse', 'Canada', 'Côte d\'Ivoire',
  'Mali', 'Guinée', 'Burkina Faso', 'Niger', 'Togo', 'Bénin', 'Cameroun',
  'Gabon', 'Congo', 'Maroc', 'Tunisie', 'Algérie', 'Mauritanie', 'Autre'
];

export default function VotePage() {
  const params = useParams();
  const { getVoteById, hasVoted, hasEmailVoted, castVote } = useData();
  const [visitorId, setVisitorId] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [step, setStep] = useState<'info' | 'vote'>('info');
  const [voterInfo, setVoterInfo] = useState<VoterInfo>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    pays: 'Sénégal'
  });
  const [errors, setErrors] = useState<Partial<VoterInfo>>({});
  const [emailAlreadyVoted, setEmailAlreadyVoted] = useState(false);

  const vote = getVoteById(params.id as string);

  useEffect(() => {
    setVisitorId(getVisitorId());
  }, []);

  useEffect(() => {
    if (visitorId && vote && hasVoted(vote.id, visitorId)) {
      setVoteSubmitted(true);
    }
  }, [visitorId, vote, hasVoted]);

  if (!vote) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl p-12 max-w-md w-full text-center shadow-xl border border-navy-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-navy-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy-800 mb-4">Vote non trouve</h1>
          <p className="text-navy-500">Ce vote n&apos;existe pas ou a ete supprime.</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const startDate = new Date(vote.startDate);
  const endDate = new Date(vote.endDate);
  endDate.setHours(23, 59, 59, 999);
  const isActive = now >= startDate && now <= endDate;
  const hasNotStarted = now < startDate;
  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);

  const validateInfo = (): boolean => {
    const newErrors: Partial<VoterInfo> = {};

    if (!voterInfo.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    if (!voterInfo.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    if (!voterInfo.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(voterInfo.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!voterInfo.telephone.trim()) {
      newErrors.telephone = 'Le numéro est requis';
    }
    if (!voterInfo.pays) {
      newErrors.pays = 'Le pays est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToVote = () => {
    if (!validateInfo()) return;

    if (vote && hasEmailVoted(vote.id, voterInfo.email)) {
      setEmailAlreadyVoted(true);
      return;
    }

    setStep('vote');
  };

  const handleVote = () => {
    if (!selectedOption || !visitorId || !vote) return;

    const success = castVote(vote.id, selectedOption, visitorId, voterInfo);
    if (success) {
      setVoteSubmitted(true);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Notification de confirmation */}
      {showConfirmation && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 font-medium">
          Votre vote a ete enregistre avec succes !
        </div>
      )}

      {/* Header simple */}
      <header className="bg-white border-b border-navy-200 shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
              <Image
                src="/logo.jpeg"
                alt="RAMPI Vote"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-navy-800">RAMPI <span className="text-gold-500">Vote</span></span>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-navy-100">
            {/* En-tete du vote */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  isActive
                    ? 'bg-gold-100 text-gold-700 border border-gold-300'
                    : hasNotStarted
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-navy-100 text-navy-700 border border-navy-300'
                }`}>
                  {isActive ? 'Vote en cours' : hasNotStarted ? 'Commence bientot' : 'Vote termine'}
                </span>
                <span className="text-navy-500">
                  <span className="text-gold-600 font-semibold">{totalVotes}</span> vote{totalVotes !== 1 ? 's' : ''}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-navy-900 mb-3">{vote.title}</h1>
              <p className="text-navy-600">{vote.description}</p>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-6 text-sm text-navy-500 mb-8 pb-6 border-b border-navy-200">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Debut: <span className="text-navy-700 font-medium">{new Date(vote.startDate).toLocaleDateString('fr-FR')}</span>
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fin: <span className="text-navy-700 font-medium">{new Date(vote.endDate).toLocaleDateString('fr-FR')}</span>
              </span>
            </div>

            {/* Vote pas encore commence */}
            {hasNotStarted && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-navy-600 text-lg">
                  Ce vote commence le <span className="text-gold-600 font-medium">{new Date(vote.startDate).toLocaleDateString('fr-FR')}</span>
                </p>
                <p className="text-navy-400 mt-2">Revenez a cette date pour participer.</p>
              </div>
            )}

            {/* Etape 1: Formulaire d'inscription */}
            {!voteSubmitted && isActive && step === 'info' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold text-sm">1</div>
                  <h2 className="text-lg font-semibold text-primary">
                    Vos informations
                  </h2>
                </div>

                {emailAlreadyVoted && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-700 font-medium">Cette adresse email a déjà été utilisée pour voter.</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nom <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={voterInfo.nom}
                        onChange={(e) => setVoterInfo({...voterInfo, nom: e.target.value})}
                        placeholder="Votre nom"
                        className={`input ${errors.nom ? 'input-error' : ''}`}
                      />
                      {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
                    </div>
                    <div>
                      <label className="label">Prénom <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={voterInfo.prenom}
                        onChange={(e) => setVoterInfo({...voterInfo, prenom: e.target.value})}
                        placeholder="Votre prénom"
                        className={`input ${errors.prenom ? 'input-error' : ''}`}
                      />
                      {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={voterInfo.email}
                      onChange={(e) => {
                        setVoterInfo({...voterInfo, email: e.target.value});
                        setEmailAlreadyVoted(false);
                      }}
                      placeholder="votre@email.com"
                      className={`input ${errors.email || emailAlreadyVoted ? 'input-error' : ''}`}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Numéro de téléphone <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        value={voterInfo.telephone}
                        onChange={(e) => setVoterInfo({...voterInfo, telephone: e.target.value})}
                        placeholder="+221 77 123 45 67"
                        className={`input ${errors.telephone ? 'input-error' : ''}`}
                      />
                      {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
                    </div>
                    <div>
                      <label className="label">Pays <span className="text-red-500">*</span></label>
                      <select
                        value={voterInfo.pays}
                        onChange={(e) => setVoterInfo({...voterInfo, pays: e.target.value})}
                        className={`input ${errors.pays ? 'input-error' : ''}`}
                      >
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      {errors.pays && <p className="text-red-500 text-sm mt-1">{errors.pays}</p>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleContinueToVote}
                  className="btn btn-accent w-full py-4 text-lg"
                >
                  Continuer vers le vote
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Etape 2: Formulaire de vote */}
            {!voteSubmitted && isActive && step === 'vote' && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white font-bold text-sm">2</div>
                  <h2 className="text-lg font-semibold text-primary">
                    Sélectionnez votre choix
                  </h2>
                </div>

                <div className="bg-primary/5 rounded-xl p-4 mb-6">
                  <p className="text-sm text-primary-light">
                    <span className="font-medium">{voterInfo.prenom} {voterInfo.nom}</span> • {voterInfo.email}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {vote.options.map((option) => (
                    <label
                      key={option.id}
                      className={`radio-option ${selectedOption === option.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="vote-option"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="sr-only"
                      />
                      <div className="radio-circle">
                        <div className="radio-circle-inner" />
                      </div>
                      <span className="font-medium">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('info')}
                    className="btn btn-outline flex-1 py-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Retour
                  </button>
                  <button
                    onClick={handleVote}
                    disabled={!selectedOption}
                    className={`flex-[2] py-4 rounded-xl font-medium text-lg transition-all ${
                      selectedOption
                        ? 'btn btn-accent'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    }`}
                  >
                    Confirmer mon vote
                  </button>
                </div>
              </div>
            )}

            {/* Vote deja soumis */}
            {voteSubmitted && (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-700 font-medium">Merci ! Votre vote a ete enregistre.</span>
                  </div>
                </div>

                {vote.showResults ? (
                  <>
                    <h2 className="text-lg font-semibold text-navy-800 mb-4">
                      Resultats actuels
                    </h2>
                    <ResultsChart options={vote.options} />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    </div>
                    <p className="text-navy-500">Les resultats seront disponibles a la fin du vote.</p>
                  </div>
                )}
              </div>
            )}

            {/* Vote termine */}
            {!isActive && !hasNotStarted && !voteSubmitted && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-navy-500 mb-8">Ce vote est termine. Vous ne pouvez plus voter.</p>

                {vote.showResults && (
                  <>
                    <h2 className="text-lg font-semibold text-navy-800 mb-4">
                      Resultats finaux
                    </h2>
                    <ResultsChart options={vote.options} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer simple */}
      <footer className="bg-white border-t border-navy-200 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-navy-400 text-sm">
            Propulse par <span className="text-gold-600 font-medium">RAMPI Vote</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
