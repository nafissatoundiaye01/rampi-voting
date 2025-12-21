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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy-50 via-white to-gold-50">
        {/* Logo Watermark */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
          <Image
            src="/logo.jpeg"
            alt=""
            width={800}
            height={800}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>

        <div className="card-elevated rounded-2xl p-12 max-w-md w-full text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/logo.jpeg"
              alt="RAMPI"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
            <svg className="w-10 h-10 text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mb-4">Vote non trouve</h1>
          <p className="text-navy-500">Ce vote n&apos;existe pas ou a ete supprime.</p>
        </div>
      </div>
    );
  }

  const now = new Date();

  // Parse start date and time
  const startDateTime = new Date(vote.startDate);
  if (vote.startTime) {
    const [startHours, startMinutes] = vote.startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
  } else {
    startDateTime.setHours(0, 0, 0, 0);
  }

  // Parse end date and time
  const endDateTime = new Date(vote.endDate);
  if (vote.endTime) {
    const [endHours, endMinutes] = vote.endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 59, 999);
  } else {
    endDateTime.setHours(23, 59, 59, 999);
  }

  const isActive = now >= startDateTime && now <= endDateTime;
  const hasNotStarted = now < startDateTime;
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

  const handleVote = async () => {
    if (!selectedOption || !visitorId || !vote || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const success = await castVote(vote.id, selectedOption, visitorId, voterInfo);
      if (success) {
        setVoteSubmitted(true);
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy-50 via-white to-gold-50">
      {/* Logo Watermark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.02]">
        <Image
          src="/logo.jpeg"
          alt=""
          width={800}
          height={800}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-navy-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border-2 border-gold-200">
              <Image
                src="/logo.jpeg"
                alt="RAMPI"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-navy-900">RAMPI</h1>
              <p className="text-xs text-navy-500">Plateforme de Vote</p>
            </div>
          </div>
        </div>
      </header>

      {/* Notification de confirmation */}
      {showConfirmation && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 font-medium flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          Votre vote a ete enregistre avec succes !
        </div>
      )}


      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center p-4 py-8 relative z-10">
        <div className="w-full max-w-2xl">
          <div className="card-elevated rounded-2xl overflow-hidden">
            {/* Header du vote avec gradient */}
            <div className="bg-gradient-to-r from-navy-800 via-navy-900 to-navy-950 p-6 text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-400/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

              {/* Logo decoratif en haut a droite */}
              <div className="absolute top-4 right-4 w-16 h-16 rounded-xl overflow-hidden opacity-20">
                <Image
                  src="/logo.jpeg"
                  alt=""
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    isActive
                      ? 'bg-gold-400 text-navy-900'
                      : hasNotStarted
                      ? 'bg-blue-400 text-navy-900'
                      : 'bg-navy-600 text-white'
                  }`}>
                    {isActive ? 'Vote en cours' : hasNotStarted ? 'Commence bientot' : 'Vote termine'}
                  </span>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gold-300 font-semibold">{totalVotes}</span>
                    <span className="text-white/70 text-sm">vote{totalVotes !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{vote.title}</h1>
                <p className="text-white/80">{vote.description}</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Dates */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-8 pb-6 border-b border-navy-100">
                <div className="flex items-center gap-2 bg-navy-50 px-4 py-2 rounded-xl">
                  <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-navy-500">Debut:</span>
                  <span className="text-navy-700 font-semibold">
                    {new Date(vote.startDate).toLocaleDateString('fr-FR')} a {vote.startTime || '00:00'}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-navy-50 px-4 py-2 rounded-xl">
                  <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-navy-500">Fin:</span>
                  <span className="text-navy-700 font-semibold">
                    {new Date(vote.endDate).toLocaleDateString('fr-FR')} a {vote.endTime || '23:59'}
                  </span>
                </div>
              </div>

              {/* Vote pas encore commence */}
              {hasNotStarted && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-navy-600 text-lg mb-2">
                    Ce vote commence le <span className="text-gold-600 font-bold">{new Date(vote.startDate).toLocaleDateString('fr-FR')}</span> a <span className="text-gold-600 font-bold">{vote.startTime || '00:00'}</span>
                  </p>
                  <p className="text-navy-400">Revenez a cette date pour participer.</p>
                </div>
              )}

              {/* Etape 1: Formulaire d'inscription */}
              {!voteSubmitted && isActive && step === 'info' && (
                <div>
                  {/* Progress indicator */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-navy-900 text-gold-400 font-bold flex items-center justify-center shadow-lg">
                        1
                      </div>
                      <span className="font-semibold text-navy-900">Vos informations</span>
                    </div>
                    <div className="flex-1 h-1 bg-navy-100 rounded-full">
                      <div className="h-full w-1/2 bg-gradient-to-r from-navy-600 to-navy-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy-400 font-bold flex items-center justify-center">
                        2
                      </div>
                      <span className="text-navy-400">Vote</span>
                    </div>
                  </div>

                  {emailAlreadyVoted && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-red-700 font-medium">Cette adresse email a deja ete utilisee pour voter.</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={voterInfo.nom}
                          onChange={(e) => setVoterInfo({...voterInfo, nom: e.target.value})}
                          placeholder="Votre nom"
                          className={`w-full px-4 py-3 input-light rounded-xl ${errors.nom ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                        />
                        {errors.nom && <p className="text-red-500 text-sm mt-1.5">{errors.nom}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                          Prenom <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={voterInfo.prenom}
                          onChange={(e) => setVoterInfo({...voterInfo, prenom: e.target.value})}
                          placeholder="Votre prenom"
                          className={`w-full px-4 py-3 input-light rounded-xl ${errors.prenom ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                        />
                        {errors.prenom && <p className="text-red-500 text-sm mt-1.5">{errors.prenom}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={voterInfo.email}
                        onChange={(e) => {
                          setVoterInfo({...voterInfo, email: e.target.value});
                          setEmailAlreadyVoted(false);
                        }}
                        placeholder="votre@email.com"
                        className={`w-full px-4 py-3 input-light rounded-xl ${errors.email || emailAlreadyVoted ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1.5">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                          Telephone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={voterInfo.telephone}
                          onChange={(e) => setVoterInfo({...voterInfo, telephone: e.target.value})}
                          placeholder="+221 77 123 45 67"
                          className={`w-full px-4 py-3 input-light rounded-xl ${errors.telephone ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                        />
                        {errors.telephone && <p className="text-red-500 text-sm mt-1.5">{errors.telephone}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-700 mb-2">
                          Pays <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={voterInfo.pays}
                            onChange={(e) => setVoterInfo({...voterInfo, pays: e.target.value})}
                            className={`w-full px-4 py-3 input-light rounded-xl appearance-none cursor-pointer ${errors.pays ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                          >
                            {COUNTRIES.map((country) => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {errors.pays && <p className="text-red-500 text-sm mt-1.5">{errors.pays}</p>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToVote}
                    className="btn-gold w-full py-4 rounded-xl text-lg flex items-center justify-center gap-2"
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
                  {/* Progress indicator */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-green-600 text-white font-bold flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-green-700 font-medium">Informations</span>
                    </div>
                    <div className="flex-1 h-1 bg-gradient-to-r from-green-500 to-navy-500 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-navy-900 text-gold-400 font-bold flex items-center justify-center shadow-lg">
                        2
                      </div>
                      <span className="font-semibold text-navy-900">Vote</span>
                    </div>
                  </div>

                  {/* Voter info card */}
                  <div className="bg-gradient-to-r from-navy-50 to-slate-100 rounded-xl p-4 mb-6 flex items-center justify-between border-2 border-navy-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center text-gold-400 font-bold shadow-lg">
                        {voterInfo.prenom?.[0]}{voterInfo.nom?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-navy-900">{voterInfo.prenom} {voterInfo.nom}</p>
                        <p className="text-sm text-navy-600">{voterInfo.email}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg overflow-hidden opacity-30">
                      <Image
                        src="/logo.jpeg"
                        alt=""
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-navy-900 mb-4">Selectionnez votre choix</h3>

                  <div className="space-y-3 mb-8">
                    {vote.options.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedOption === option.id
                            ? 'border-gold-400 bg-gold-50 shadow-gold'
                            : 'border-navy-200 bg-white hover:border-gold-300 hover:bg-gold-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="vote-option"
                          value={option.id}
                          checked={selectedOption === option.id}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedOption === option.id
                            ? 'border-gold-500 bg-gold-500'
                            : 'border-navy-300'
                        }`}>
                          {selectedOption === option.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className={`font-medium ${selectedOption === option.id ? 'text-navy-900' : 'text-navy-700'}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep('info')}
                      className="btn-outline flex-1 py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      Retour
                    </button>
                    <button
                      onClick={handleVote}
                      disabled={!selectedOption || isSubmitting}
                      className={`flex-[2] py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                        selectedOption && !isSubmitting
                          ? 'btn-gold'
                          : 'bg-navy-100 text-navy-400 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin"></span>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Confirmer mon vote
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Vote deja soumis */}
              {voteSubmitted && (
                <div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border-2 border-green-300">
                        <Image
                          src="/logo.jpeg"
                          alt="RAMPI"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-green-700 font-semibold text-lg">Merci pour votre participation !</p>
                        <p className="text-green-600 text-sm">Votre vote a ete enregistre avec succes.</p>
                      </div>
                    </div>
                  </div>

                  {vote.showResults ? (
                    <>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold text-navy-900">Resultats actuels</h2>
                      </div>
                      <ResultsChart options={vote.options} />
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
                        <svg className="w-10 h-10 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </div>
                      <p className="text-navy-600 text-lg">Les resultats seront disponibles a la fin du vote.</p>
                      <p className="text-navy-400 text-sm mt-2">Revenez apres le {new Date(vote.endDate).toLocaleDateString('fr-FR')} a {vote.endTime || '23:59'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Vote termine */}
              {!isActive && !hasNotStarted && !voteSubmitted && (
                <div>
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
                      <svg className="w-10 h-10 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-navy-600 text-lg mb-2">Ce vote est termine</p>
                    <p className="text-navy-400">Vous ne pouvez plus participer a ce vote.</p>
                  </div>

                  {vote.showResults && (
                    <>
                      <div className="flex items-center gap-3 mb-6 pt-6 border-t border-navy-100">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold text-navy-900">Resultats finaux</h2>
                      </div>
                      <ResultsChart options={vote.options} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-navy-100 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm border border-gold-200">
                <Image
                  src="/logo.jpeg"
                  alt="RAMPI"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">RAMPI</p>
                <p className="text-xs text-navy-500">Reseau Africain des Magistrats de Propriete Intellectuelle</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-navy-400">
                &copy; {new Date().getFullYear()} RAMPI. Tous droits reserves.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
