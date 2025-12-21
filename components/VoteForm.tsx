'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '@/lib/data-context';
import { Vote, VoteOption } from '@/lib/types';

interface VoteFormProps {
  vote?: Vote;
  mode: 'create' | 'edit';
}

export default function VoteForm({ vote, mode }: VoteFormProps) {
  const router = useRouter();
  const { createVote, updateVote, isAdminLoggedIn } = useData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<VoteOption[]>([
    { id: uuidv4(), label: '', votes: 0 },
    { id: uuidv4(), label: '', votes: 0 }
  ]);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');
  const [showResults, setShowResults] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      router.push('/admin/login');
    }
  }, [isAdminLoggedIn, router]);

  useEffect(() => {
    if (vote && mode === 'edit') {
      setTitle(vote.title);
      setDescription(vote.description);
      setOptions(vote.options);
      setStartDate(vote.startDate);
      setStartTime(vote.startTime || '00:00');
      setEndDate(vote.endDate);
      setEndTime(vote.endTime || '23:59');
      setShowResults(vote.showResults);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(today);
      setStartTime('00:00');
      setEndDate(nextMonth);
      setEndTime('23:59');
    }
  }, [vote, mode]);

  const addOption = () => {
    setOptions([...options, { id: uuidv4(), label: '', votes: 0 }]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const updateOptionLabel = (id: string, label: string) => {
    setOptions(options.map(opt =>
      opt.id === id ? { ...opt, label } : opt
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    if (!description.trim()) {
      setError('La description est requise');
      return;
    }

    const validOptions = options.filter(opt => opt.label.trim());
    if (validOptions.length < 2) {
      setError('Au moins 2 options sont requises');
      return;
    }

    if (!startDate || !endDate) {
      setError('Les dates de debut et fin sont requises');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('La date de fin doit etre apres la date de debut');
      return;
    }

    const voteData = {
      title: title.trim(),
      description: description.trim(),
      options: validOptions,
      startDate,
      startTime,
      endDate,
      endTime,
      showResults
    };

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createVote(voteData);
      } else if (vote) {
        await updateVote(vote.id, voteData);
      }
      router.push('/admin/votes');
    } catch (err) {
      setError('Une erreur est survenue. Veuillez reessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <Link href="/admin/votes" className="hover:text-navy-600 transition-colors flex items-center gap-1 font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Votes
            </Link>
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-700 font-semibold">{mode === 'create' ? 'Nouveau' : 'Modifier'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {mode === 'create' ? 'Creer un nouveau vote' : 'Modifier le vote'}
          </h1>
        </div>
      </div>

      {/* Form card */}
      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="px-6 py-5 bg-navy-900 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center">
              {mode === 'create' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Informations du vote</h2>
              <p className="text-sm text-slate-300">Remplissez les champs ci-dessous</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-700">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
                Titre du vote <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-100 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-slate-800 placeholder-slate-500"
                placeholder="Ex: Meilleur langage de programmation"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3.5 bg-slate-100 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all resize-none text-slate-800 placeholder-slate-500"
                placeholder="Decrivez le vote en quelques mots..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Options de vote <span className="text-red-500">*</span>
                <span className="font-medium text-slate-500 ml-2">(minimum 2)</span>
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => updateOptionLabel(option.id, e.target.value)}
                      className="flex-1 px-4 py-3.5 bg-slate-100 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-slate-800 placeholder-slate-500"
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-100 transition-all border-2 border-transparent hover:border-red-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter une option
              </button>
            </div>

            {/* Date et heure de debut */}
            <div className="p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Debut du vote <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-xs font-medium text-slate-500 mb-1.5">
                    Date
                  </label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="startTime" className="block text-xs font-medium text-slate-500 mb-1.5">
                    Heure
                  </label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date et heure de fin */}
            <div className="p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Fin du vote <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="endDate" className="block text-xs font-medium text-slate-500 mb-1.5">
                    Date
                  </label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-xs font-medium text-slate-500 mb-1.5">
                    Heure
                  </label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-slate-100 rounded-xl border-2 border-slate-200">
              <div className="relative">
                <input
                  type="checkbox"
                  id="showResults"
                  checked={showResults}
                  onChange={(e) => setShowResults(e.target.checked)}
                  className="w-6 h-6 rounded-lg border-2 border-slate-300 text-navy-600 focus:ring-navy-500 focus:ring-offset-0 cursor-pointer"
                />
              </div>
              <label htmlFor="showResults" className="text-sm text-slate-700 cursor-pointer flex-1 font-medium">
                Afficher les resultats aux utilisateurs apres leur vote
              </label>
            </div>

            {/* Form actions */}
            <div className="flex gap-4 pt-6 border-t-2 border-slate-100">
              <Link
                href="/admin/votes"
                className={`flex-1 py-3.5 text-center border-2 border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-semibold ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {mode === 'create' ? 'Creation...' : 'Enregistrement...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {mode === 'create' ? 'Creer le vote' : 'Enregistrer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
