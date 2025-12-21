'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useData } from '@/lib/data-context';
import ResultsChart from '@/components/ResultsChart';

export default function AdminPage() {
  const {
    isAdminLoggedIn,
    loginAdmin,
    votes,
    voteRecords,
    deleteVote,
    getVoteRecords
  } = useData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginAdmin(email, password)) {
      setError('Email ou mot de passe incorrect');
    }
  };

  const copyVoteLink = (voteId: string) => {
    const link = `${baseUrl}/vote/${voteId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(voteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-navy-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/logo.jpeg"
                alt="RAMPI Vote"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-navy-800">
              RAMPI <span className="text-gold-500">Vote</span>
            </h1>
            <p className="text-navy-500 mt-2">Connectez-vous pour gerer les votes</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 input-light rounded-xl"
                placeholder="admin@rampi.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 input-light rounded-xl"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 btn-navy rounded-xl"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 p-4 bg-gold-50 border border-gold-200 rounded-xl">
            <p className="text-sm text-navy-600 text-center">
              <span className="text-gold-600 font-medium">Demo:</span> admin@rampi.com / admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalVotes = voteRecords.length;
  const activeVotesCount = votes.filter(v => {
    const now = new Date();
    const start = new Date(v.startDate);
    const end = new Date(v.endDate);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
  }).length;

  const selectedVote = selectedVoteId ? votes.find(v => v.id === selectedVoteId) : null;
  const selectedVoteRecords = selectedVoteId ? getVoteRecords(selectedVoteId) : [];

  const handleDeleteVote = (voteId: string) => {
    deleteVote(voteId);
    setConfirmDelete(null);
    if (selectedVoteId === voteId) {
      setSelectedVoteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-navy-500 mt-1">Gerez vos votes et partagez les liens</p>
        </div>
        <Link
          href="/admin/votes/new"
          className="px-6 py-3 btn-gold rounded-xl flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau vote
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gold-600 mb-1">{votes.length}</div>
          <div className="text-navy-500">Total des votes</div>
        </div>
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">{activeVotesCount}</div>
          <div className="text-navy-500">Votes actifs</div>
        </div>
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-1">{totalVotes}</div>
          <div className="text-navy-500">Participations</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des votes */}
        <div className="card rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-navy-800 mb-4">Tous les votes</h2>

          {votes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-navy-500 mb-4">Aucun vote cree</p>
              <Link
                href="/admin/votes/new"
                className="inline-block px-4 py-2 btn-gold rounded-lg text-sm"
              >
                Creer un vote
              </Link>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {votes.map((vote) => {
                const now = new Date();
                const start = new Date(vote.startDate);
                const end = new Date(vote.endDate);
                end.setHours(23, 59, 59, 999);
                const isActive = now >= start && now <= end;
                const voteTotal = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
                const voteLink = `${baseUrl}/vote/${vote.id}`;

                return (
                  <div
                    key={vote.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedVoteId === vote.id
                        ? 'border-gold-400 bg-gold-50'
                        : 'border-navy-200 bg-white hover:border-navy-300'
                    }`}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedVoteId(vote.id);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className={`font-medium ${selectedVoteId === vote.id ? 'text-gold-700' : 'text-navy-800'}`}>
                            {vote.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isActive
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-navy-100 text-navy-600 border border-navy-200'
                            }`}>
                              {isActive ? 'Actif' : 'Termine'}
                            </span>
                            <span className="text-navy-500">
                              <span className="text-navy-700 font-medium">{voteTotal}</span> vote{voteTotal !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/votes/edit/${vote.id}`}
                            className="p-2 text-navy-400 hover:text-gold-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            className="p-2 text-navy-400 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(vote.id);
                            }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Lien de partage */}
                    <div className="mt-3 pt-3 border-t border-navy-100">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center bg-navy-50 rounded-lg px-3 py-2 border border-navy-200">
                          <svg className="w-4 h-4 text-gold-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="text-sm text-navy-600 truncate">{voteLink}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyVoteLink(vote.id);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                            copiedId === vote.id
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-gold-100 text-gold-700 border border-gold-200 hover:bg-gold-200'
                          }`}
                        >
                          {copiedId === vote.id ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Copie !
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              Copier
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Details du vote selectionne */}
        <div className="card rounded-2xl p-6">
          {selectedVote ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-navy-800">
                  {showHistory ? 'Historique des votes' : 'Resultats'}
                </h2>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors"
                >
                  {showHistory ? 'Voir resultats' : 'Voir historique'}
                </button>
              </div>

              <h3 className="font-medium text-navy-600 mb-4">{selectedVote.title}</h3>

              {showHistory ? (
                selectedVoteRecords.length > 0 ? (
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-navy-200">
                          <th className="text-left py-3 px-2 text-navy-500 font-medium">Votant</th>
                          <th className="text-left py-3 px-2 text-navy-500 font-medium">Contact</th>
                          <th className="text-left py-3 px-2 text-navy-500 font-medium">Pays</th>
                          <th className="text-left py-3 px-2 text-navy-500 font-medium">Choix</th>
                          <th className="text-left py-3 px-2 text-navy-500 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVoteRecords.map((record) => (
                          <tr key={record.id} className="border-b border-navy-100 hover:bg-navy-50">
                            <td className="py-3 px-2">
                              {record.voterInfo ? (
                                <div>
                                  <div className="font-medium text-navy-800">
                                    {record.voterInfo.prenom} {record.voterInfo.nom}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-navy-400 text-xs">Non renseigne</span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              {record.voterInfo ? (
                                <div className="text-xs">
                                  <div className="text-navy-600">{record.voterInfo.email}</div>
                                  <div className="text-navy-400">{record.voterInfo.telephone}</div>
                                </div>
                              ) : (
                                <span className="text-navy-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              {record.voterInfo?.pays ? (
                                <span className="px-2 py-1 bg-navy-100 text-navy-600 rounded-full text-xs">
                                  {record.voterInfo.pays}
                                </span>
                              ) : (
                                <span className="text-navy-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <span className="px-2 py-1 bg-gold-100 text-gold-700 rounded-full text-xs font-medium">
                                {record.optionLabel}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-navy-500 text-xs whitespace-nowrap">
                              {new Date(record.votedAt).toLocaleDateString('fr-FR')}
                              <br />
                              <span className="text-navy-400">
                                {new Date(record.votedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-navy-500">Aucun vote enregistre</p>
                  </div>
                )
              ) : (
                <ResultsChart options={selectedVote.options} />
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-navy-500">Selectionnez un vote pour voir les details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-elevated rounded-2xl p-6 max-w-md w-full mx-4 border-2 border-red-200">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-navy-800 text-center mb-2">Confirmer la suppression</h3>
            <p className="text-navy-500 text-center mb-6">
              Etes-vous sur de vouloir supprimer ce vote ? Cette action est irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 border-2 border-navy-200 rounded-xl text-navy-600 hover:bg-navy-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteVote(confirmDelete)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
