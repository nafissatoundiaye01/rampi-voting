'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { useData } from '@/lib/data-context';
import { Vote, VoteRecord } from '@/lib/types';
import { generateVoteReportPDF } from '@/lib/pdf-generator';

/* eslint-disable @next/next/no-img-element */

export default function VotesPage() {
  const { votes, deleteVote, getVoteRecords } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended' | 'upcoming'>('all');
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [selectedVoter, setSelectedVoter] = useState<VoteRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  const handleDownloadPDF = async (vote: Vote) => {
    setDownloadingPdf(vote.id);
    try {
      const records = getVoteRecords(vote.id);
      await generateVoteReportPDF({ vote, records });
    } catch (error) {
      console.error('Erreur lors de la generation du PDF:', error);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const getVoteStatus = (vote: Vote) => {
    const now = new Date();
    const start = new Date(vote.startDate);
    const end = new Date(vote.endDate);
    end.setHours(23, 59, 59, 999);

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  const filteredVotes = useMemo(() => {
    return votes.filter((vote) => {
      const matchesSearch = vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.description.toLowerCase().includes(searchTerm.toLowerCase());

      const status = getVoteStatus(vote);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [votes, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const active = votes.filter(v => getVoteStatus(v) === 'active').length;
    const ended = votes.filter(v => getVoteStatus(v) === 'ended').length;
    const upcoming = votes.filter(v => getVoteStatus(v) === 'upcoming').length;
    return { total: votes.length, active, ended, upcoming };
  }, [votes]);

  const handleDelete = async (id: string) => {
    await deleteVote(id);
    setShowDeleteModal(null);
  };

  const selectedVoteRecords = useMemo(() => {
    if (!selectedVote) return [];
    return getVoteRecords(selectedVote.id);
  }, [selectedVote, getVoteRecords]);

  const copyVoteLink = (voteId: string) => {
    const link = `${window.location.origin}/vote/${voteId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(voteId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestion des votes</h1>
            <p className="text-slate-500 text-sm mt-1">{stats.total} campagne{stats.total !== 1 ? 's' : ''} au total</p>
          </div>
          <Link
            href="/admin/votes/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-medium transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau vote
          </Link>
        </div>

        {/* Stats mini cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-2xl border-2 transition-all ${statusFilter === 'all' ? 'border-navy-600 bg-navy-900 shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusFilter === 'all' ? 'bg-gold-500' : 'bg-slate-100'}`}>
                <svg className={`w-5 h-5 ${statusFilter === 'all' ? 'text-white' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className={`text-2xl font-bold ${statusFilter === 'all' ? 'text-white' : 'text-slate-800'}`}>{stats.total}</p>
            </div>
            <p className={`text-sm text-left ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>Total</p>
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`p-4 rounded-2xl border-2 transition-all ${statusFilter === 'active' ? 'border-green-600 bg-green-500 shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusFilter === 'active' ? 'bg-white/20' : 'bg-green-100'}`}>
                <div className="relative">
                  <span className={`block w-3 h-3 rounded-full ${statusFilter === 'active' ? 'bg-white' : 'bg-green-500'}`}></span>
                  <span className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${statusFilter === 'active' ? 'bg-white/50' : 'bg-green-400'}`}></span>
                </div>
              </div>
              <p className={`text-2xl font-bold ${statusFilter === 'active' ? 'text-white' : 'text-slate-800'}`}>{stats.active}</p>
            </div>
            <p className={`text-sm text-left ${statusFilter === 'active' ? 'text-green-100' : 'text-slate-500'}`}>Actifs</p>
          </button>

          <button
            onClick={() => setStatusFilter('ended')}
            className={`p-4 rounded-2xl border-2 transition-all ${statusFilter === 'ended' ? 'border-slate-600 bg-slate-700 shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusFilter === 'ended' ? 'bg-white/20' : 'bg-slate-100'}`}>
                <svg className={`w-5 h-5 ${statusFilter === 'ended' ? 'text-white' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className={`text-2xl font-bold ${statusFilter === 'ended' ? 'text-white' : 'text-slate-800'}`}>{stats.ended}</p>
            </div>
            <p className={`text-sm text-left ${statusFilter === 'ended' ? 'text-slate-300' : 'text-slate-500'}`}>Termines</p>
          </button>

          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`p-4 rounded-2xl border-2 transition-all ${statusFilter === 'upcoming' ? 'border-blue-600 bg-blue-500 shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusFilter === 'upcoming' ? 'bg-white/20' : 'bg-blue-100'}`}>
                <svg className={`w-5 h-5 ${statusFilter === 'upcoming' ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className={`text-2xl font-bold ${statusFilter === 'upcoming' ? 'text-white' : 'text-slate-800'}`}>{stats.upcoming}</p>
            </div>
            <p className={`text-sm text-left ${statusFilter === 'upcoming' ? 'text-blue-100' : 'text-slate-500'}`}>A venir</p>
          </button>
        </div>

        {/* Search and table card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
          {/* Search bar */}
          <div className="p-4 border-b-2 border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un vote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-slate-800 placeholder-slate-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 font-medium">{filteredVotes.length} resultat{filteredVotes.length !== 1 ? 's' : ''}</span>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
                >
                  <span>{statusFilter === 'active' ? 'Actif' : statusFilter === 'ended' ? 'Termine' : 'A venir'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Vote</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Periode</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Votes</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100">
                {filteredVotes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-slate-700 font-semibold mb-1">Aucun vote trouve</p>
                      <p className="text-sm text-slate-500">Essayez de modifier vos criteres de recherche</p>
                    </td>
                  </tr>
                ) : (
                  filteredVotes.map((vote) => {
                    const status = getVoteStatus(vote);
                    const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);

                    return (
                      <tr key={vote.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {vote.title.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{vote.title}</p>
                              <p className="text-sm text-slate-500 line-clamp-1 max-w-xs">{vote.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                            status === 'active' ? 'bg-green-500 text-white' :
                            status === 'ended' ? 'bg-slate-200 text-slate-700' :
                            'bg-blue-500 text-white'
                          }`}>
                            {status === 'active' && (
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </span>
                            )}
                            {status === 'active' ? 'Actif' : status === 'ended' ? 'Termine' : 'A venir'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(vote.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                            <span className="text-slate-400">→</span>
                            <span>{new Date(vote.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedVote(vote)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border-2 border-slate-200"
                          >
                            <span className="font-bold text-slate-800">{totalVotes}</span>
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDownloadPDF(vote)}
                              disabled={downloadingPdf === vote.id}
                              className={`p-2.5 rounded-xl transition-all ${downloadingPdf === vote.id ? 'bg-gold-500 text-white' : 'hover:bg-gold-100 text-slate-600 hover:text-gold-700 border-2 border-transparent hover:border-gold-200'}`}
                              title="Telecharger le rapport PDF"
                            >
                              {downloadingPdf === vote.id ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block"></span>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => copyVoteLink(vote.id)}
                              className={`p-2.5 rounded-xl transition-all ${copiedId === vote.id ? 'bg-green-500 text-white' : 'hover:bg-slate-100 text-slate-600 border-2 border-transparent hover:border-slate-200'}`}
                              title={copiedId === vote.id ? 'Copie!' : 'Copier le lien'}
                            >
                              {copiedId === vote.id ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                              )}
                            </button>
                            <Link
                              href={`/admin/votes/edit/${vote.id}`}
                              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-all border-2 border-transparent hover:border-slate-200"
                              title="Modifier"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => setShowDeleteModal(vote.id)}
                              className="p-2.5 rounded-xl hover:bg-red-100 text-slate-600 hover:text-red-600 transition-all border-2 border-transparent hover:border-red-200"
                              title="Supprimer"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vote details modal */}
        {selectedVote && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setSelectedVote(null); setSelectedVoter(null); }}>
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Modal header */}
              <div className="px-6 py-5 bg-navy-900 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center text-white font-bold text-lg">
                    {selectedVote.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{selectedVote.title}</h3>
                    <p className="text-sm text-slate-300">{selectedVoteRecords.length} votant{selectedVoteRecords.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPDF(selectedVote)}
                    disabled={downloadingPdf === selectedVote.id}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 rounded-xl font-medium transition-all disabled:opacity-50"
                    title="Telecharger le rapport PDF"
                  >
                    {downloadingPdf === selectedVote.id ? (
                      <span className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    <span className="hidden sm:inline">Rapport PDF</span>
                  </button>
                  <button
                    onClick={() => { setSelectedVote(null); setSelectedVoter(null); }}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                {/* Vote Info Summary */}
                <div className="mb-6">
                  {selectedVote.description && (
                    <p className="text-slate-600 mb-4">{selectedVote.description}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-navy-900 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-gold-400">{selectedVoteRecords.length}</p>
                      <p className="text-xs text-slate-300 mt-1">Total votes</p>
                    </div>
                    <div className="bg-green-500 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-white">{selectedVoteRecords.length}</p>
                      <p className="text-xs text-green-100 mt-1">Votants</p>
                    </div>
                    <div className="bg-blue-500 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-white">{selectedVote.options.length}</p>
                      <p className="text-xs text-blue-100 mt-1">Options</p>
                    </div>
                    <div className="bg-purple-500 rounded-xl p-4 text-center">
                      <p className="text-lg font-bold text-white truncate">
                        {(() => {
                          const votesParOption = selectedVote.options.map(opt => ({
                            label: opt.label,
                            count: selectedVoteRecords.filter(r => r.optionId === opt.id).length
                          }));
                          const max = votesParOption.reduce((m, o) => o.count > m.count ? o : m, votesParOption[0]);
                          return max?.label || '-';
                        })()}
                      </p>
                      <p className="text-xs text-purple-100 mt-1">En tete</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-slate-100 rounded-xl border-2 border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-600">Debut:</span>
                        <span className="font-semibold text-slate-800">{new Date(selectedVote.startDate).toLocaleDateString('fr-FR')} a {selectedVote.startTime || '00:00'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-600">Fin:</span>
                        <span className="font-semibold text-slate-800">{new Date(selectedVote.endDate).toLocaleDateString('fr-FR')} a {selectedVote.endTime || '23:59'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="mb-8">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </span>
                    Resultats par option
                  </h4>
                  <div className="space-y-4">
                    {selectedVote.options.map((option, index) => {
                      const totalVotes = selectedVoteRecords.length;
                      const optionVotes = selectedVoteRecords.filter(r => r.optionId === option.id).length;
                      const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
                      const colors = ['bg-navy-600', 'bg-gold-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500'];

                      return (
                        <div key={option.id} className="bg-slate-100 rounded-xl p-4 border-2 border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-800">{option.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">{optionVotes} vote{optionVotes !== 1 ? 's' : ''}</span>
                              <span className="text-sm text-slate-500">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-700`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Voters list */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    Liste des votants
                  </h4>
                  {selectedVoteRecords.length === 0 ? (
                    <div className="text-center py-12 bg-slate-100 rounded-xl border-2 border-slate-200">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-700 font-semibold">Aucun votant pour l&apos;instant</p>
                      <p className="text-sm text-slate-500 mt-1">Les votants apparaitront ici</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedVoteRecords.map((record, index) => (
                        <div
                          key={record.id}
                          className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-gold-400 font-bold shadow-lg flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-slate-800">
                                  {record.voterInfo?.prenom} {record.voterInfo?.nom}
                                </p>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                                  {record.optionLabel}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="truncate">{record.voterInfo?.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span>{record.voterInfo?.telephone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{record.voterInfo?.pays}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{new Date(record.votedAt).toLocaleDateString('fr-FR')} {new Date(record.votedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voter details modal */}
        {selectedVoter && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setSelectedVoter(null)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="px-6 py-5 bg-navy-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/logo.jpeg" alt="" className="w-9 h-9 rounded-xl border-2 border-gold-400/50" />
                  <h3 className="font-bold text-white">Details du votant</h3>
                </div>
                <button
                  onClick={() => setSelectedVoter(null)}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Avatar and name */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-slate-100 rounded-xl border-2 border-slate-200">
                  <div className="w-16 h-16 rounded-2xl bg-navy-900 flex items-center justify-center text-gold-400 text-xl font-bold shadow-lg">
                    {selectedVoter.voterInfo?.prenom?.[0]}{selectedVoter.voterInfo?.nom?.[0]}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-800">
                      {selectedVoter.voterInfo?.prenom} {selectedVoter.voterInfo?.nom}
                    </h4>
                    <p className="text-slate-600 flex items-center gap-1 font-medium">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedVoter.voterInfo?.pays}
                    </p>
                  </div>
                </div>

                {/* Info cards */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-blue-100 rounded-xl border-2 border-blue-200">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Email</p>
                      <p className="font-semibold text-slate-800">{selectedVoter.voterInfo?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-green-100 rounded-xl border-2 border-green-200">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Telephone</p>
                      <p className="font-semibold text-slate-800">{selectedVoter.voterInfo?.telephone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gold-100 rounded-xl border-2 border-gold-300">
                    <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gold-700 uppercase tracking-wide">A vote pour</p>
                      <p className="font-bold text-slate-800">{selectedVoter.optionLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-purple-100 rounded-xl border-2 border-purple-200">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Date du vote</p>
                      <p className="font-semibold text-slate-800">
                        {new Date(selectedVoter.votedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} a {new Date(selectedVoter.votedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(null)}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Supprimer ce vote ?</h3>
              <p className="text-center text-slate-600 mb-6">Cette action est irreversible. Toutes les donnees seront perdues.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
