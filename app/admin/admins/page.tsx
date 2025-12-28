'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useData } from '@/lib/data-context';

export default function AdminsPage() {
  const router = useRouter();
  const { admins, currentAdmin, isSuperAdmin, addAdmin, deleteAdmin } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Rediriger si pas super admin
  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="p-6 lg:p-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Acces refuse</h2>
            <p className="text-slate-600 mb-6">Seul l&apos;administrateur principal peut gerer les administrateurs.</p>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-6 py-3 bg-navy-900 text-white rounded-xl font-medium hover:bg-navy-800 transition-colors"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newEmail || !newPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    const success = await addAdmin(newEmail, newPassword);
    setIsSubmitting(false);

    if (success) {
      setShowAddModal(false);
      setNewEmail('');
      setNewPassword('');
    } else {
      setError('Erreur lors de l\'ajout. Cet email existe peut-etre deja.');
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    setIsSubmitting(true);
    await deleteAdmin(id);
    setIsSubmitting(false);
    setShowDeleteModal(null);
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestion des administrateurs</h1>
            <p className="text-slate-500 text-sm mt-1">{admins.length} administrateur{admins.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-medium transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un admin
          </button>
        </div>

        {/* Admin list */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Administrateur</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Date d&apos;ajout</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${admin.isSuperAdmin ? 'bg-gold-500' : 'bg-navy-900'}`}>
                          {admin.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{admin.email}</p>
                          {admin.id === currentAdmin?.id && (
                            <span className="text-xs text-green-600 font-medium">(Vous)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        admin.isSuperAdmin ? 'bg-gold-100 text-gold-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {admin.isSuperAdmin ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Admin Principal
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Administrateur
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {new Date(admin.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        {!admin.isSuperAdmin && (
                          <button
                            onClick={() => setShowDeleteModal(admin.id)}
                            className="p-2.5 rounded-xl hover:bg-red-100 text-slate-600 hover:text-red-600 transition-all border-2 border-transparent hover:border-red-200"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add admin modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-5 bg-navy-900 flex items-center justify-between">
                <h3 className="font-bold text-white text-lg">Ajouter un administrateur</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddAdmin} className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border-2 border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-slate-800"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all text-slate-800"
                      placeholder="Minimum 6 caracteres"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-navy-900 hover:bg-navy-800 text-white rounded-xl font-semibold transition-colors shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
              </form>
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
              <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Supprimer cet admin ?</h3>
              <p className="text-center text-slate-600 mb-6">Cette action est irreversible. L&apos;administrateur ne pourra plus se connecter.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteAdmin(showDeleteModal)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
