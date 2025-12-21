'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { useData } from '@/lib/data-context';

export default function DashboardPage() {
  const { votes, voteRecords, getActiveVotes } = useData();

  const stats = useMemo(() => {
    const activeVotes = getActiveVotes();
    const totalVotes = voteRecords.length;
    const totalCampaigns = votes.length;

    const votesByCountry: Record<string, number> = {};
    voteRecords.forEach(record => {
      const country = record.voterInfo?.pays || 'Inconnu';
      votesByCountry[country] = (votesByCountry[country] || 0) + 1;
    });

    const topCountries = Object.entries(votesByCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentVotes = voteRecords.filter(r => new Date(r.votedAt) >= sevenDaysAgo).length;

    const votesByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      votesByDay[key] = 0;
    }

    voteRecords.forEach(record => {
      const date = new Date(record.votedAt);
      if (date >= sevenDaysAgo) {
        const key = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        if (votesByDay[key] !== undefined) {
          votesByDay[key]++;
        }
      }
    });

    return {
      activeVotes: activeVotes.length,
      totalVotes,
      totalCampaigns,
      recentVotes,
      topCountries,
      votesByDay
    };
  }, [votes, voteRecords, getActiveVotes]);

  const maxVotesPerDay = Math.max(...Object.values(stats.votesByDay), 1);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Tableau de bord
          </h1>
          <p className="text-slate-500">Voici un apercu de votre plateforme de vote.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Votes */}
          <div className="bg-navy-900 rounded-2xl p-5 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-300 mb-1">Total des votes</p>
                <p className="text-3xl font-bold text-white">{stats.totalVotes}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-green-400 bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +{stats.recentVotes}
              </span>
              <span className="text-xs text-slate-400">cette semaine</span>
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Votes actifs</p>
                <p className="text-3xl font-bold text-navy-900">{stats.activeVotes}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-slate-600 font-medium">En cours</span>
              </span>
            </div>
          </div>

          {/* Total Campaigns */}
          <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Campagnes</p>
                <p className="text-3xl font-bold text-navy-900">{stats.totalCampaigns}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-navy-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <Link href="/admin/votes/new" className="text-xs font-semibold text-navy-600 hover:text-navy-800 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau vote
            </Link>
          </div>

          {/* Countries */}
          <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pays participants</p>
                <p className="text-3xl font-bold text-navy-900">{stats.topCountries.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <span className="text-xs font-semibold text-gold-700 bg-gold-100 px-2 py-1 rounded-full">
              International
            </span>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Activity chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800">Activite</h3>
                <p className="text-sm text-slate-500">7 derniers jours</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-navy-500"></span>
                <span className="text-xs text-slate-600 font-medium">Votes</span>
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-3 h-44">
              {Object.entries(stats.votesByDay).map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-200 rounded-lg relative h-32">
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-navy-700 to-navy-500 rounded-lg transition-all duration-500"
                      style={{ height: `${(count / maxVotesPerDay) * 100}%`, minHeight: count > 0 ? '8px' : '0' }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-600 font-medium">{day.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800">Votes par pays</h3>
                <p className="text-sm text-slate-500">Top 5</p>
              </div>
            </div>

            {stats.topCountries.length > 0 ? (
              <div className="space-y-4">
                {stats.topCountries.map(([country, count], index) => {
                  const percentage = stats.totalVotes > 0 ? (count / stats.totalVotes) * 100 : 0;
                  const dotColors = ['bg-navy-600', 'bg-gold-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500'];
                  return (
                    <div key={country} className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${dotColors[index]}`}></span>
                      <span className="flex-1 text-sm text-slate-700 font-medium">{country}</span>
                      <span className="text-sm font-bold text-slate-800">{percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">Aucune donnee disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Summary */}
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-white mb-6">Resume</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalVotes}</p>
                  <p className="text-sm text-slate-300">votes enregistres</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.topCountries.length}</p>
                  <p className="text-sm text-slate-300">pays participants</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/votes/new"
                className="p-4 rounded-xl bg-navy-900 hover:bg-navy-800 transition-all group text-center shadow-lg"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gold-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-white">Nouveau vote</p>
              </Link>

              <Link
                href="/admin/votes"
                className="p-4 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all group text-center border-2 border-slate-200"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-navy-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-700">Gerer votes</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
