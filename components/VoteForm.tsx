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
  const [endDate, setEndDate] = useState('');
  const [showResults, setShowResults] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn) {
      router.push('/admin');
    }
  }, [isAdminLoggedIn, router]);

  useEffect(() => {
    if (vote && mode === 'edit') {
      setTitle(vote.title);
      setDescription(vote.description);
      setOptions(vote.options);
      setStartDate(vote.startDate);
      setEndDate(vote.endDate);
      setShowResults(vote.showResults);
    } else {
      // Default dates for new vote
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(nextMonth);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
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
      endDate,
      showResults
    };

    if (mode === 'create') {
      createVote(voteData);
    } else if (vote) {
      updateVote(vote.id, voteData);
    }

    router.push('/admin');
  };

  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/admin"
        className="inline-flex items-center text-navy-500 hover:text-gold-600 mb-6 transition-colors font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour au dashboard
      </Link>

      <div className="card-elevated rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 flex items-center justify-center">
            <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mode === 'create' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              )}
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              {mode === 'create' ? 'Creer un nouveau vote' : 'Modifier le vote'}
            </h1>
            <p className="text-navy-500 text-sm">Remplissez les informations ci-dessous</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-navy-700 mb-2">
              Titre du vote *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 input-light rounded-xl"
              placeholder="Ex: Meilleur langage de programmation"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-navy-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 input-light rounded-xl resize-none"
              placeholder="Decrivez le vote en quelques mots..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-3">
              Options de vote * (minimum 2)
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center text-navy-600 text-sm font-medium">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOptionLabel(option.id, e.target.value)}
                    className="flex-1 px-4 py-3 input-light rounded-xl"
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      className="p-2 text-navy-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-4 text-gold-600 hover:text-gold-700 text-sm font-medium flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une option
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-navy-700 mb-2">
                Date de debut *
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 input-light rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-navy-700 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 input-light rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center p-4 bg-navy-50 rounded-xl border border-navy-200">
            <input
              type="checkbox"
              id="showResults"
              checked={showResults}
              onChange={(e) => setShowResults(e.target.checked)}
              className="w-5 h-5 rounded border-navy-300 bg-white text-gold-500 focus:ring-gold-500 focus:ring-offset-0"
            />
            <label htmlFor="showResults" className="ml-3 text-sm text-navy-700">
              Afficher les resultats aux utilisateurs apres leur vote
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/admin"
              className="flex-1 py-3.5 text-center border-2 border-navy-200 rounded-xl text-navy-600 hover:bg-navy-50 transition-colors font-medium"
            >
              Annuler
            </Link>
            <button
              type="submit"
              className="flex-1 py-3.5 btn-gold rounded-xl"
            >
              {mode === 'create' ? 'Creer le vote' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
