'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken, type User } from '@/lib/api';
import { Dialog } from '@/app/components/Dialog';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    api.users
      .me()
      .then((u) => {
        setUser(u);
        setUsername(u.name);
        setProfileVisibility((u.profileVisibility === 'private' ? 'private' : 'public'));
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
      });
  }, []);

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await api.users.updateMe({
        name: username,
        profileVisibility,
      });
      setUser(updated);
      setMessage('Account updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.users.changePassword(currentPassword, newPassword);
      setPasswordMessage('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  }

  function openDeleteConfirm() {
    setDeleteError('');
    setShowDeleteConfirm(true);
  }

  async function handleDeleteAccount() {
    setDeleteError('');
    setDeleteLoading(true);
    setShowDeleteConfirm(false);
    try {
      await api.users.deleteMe();
      setToken(null);
      router.replace('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Account Settings & Security</h1>

      <main className="min-w-0 space-y-6">
        {message && (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        {/* Account */}
        <section id="account" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-4">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Account</h2>
          <form onSubmit={handleAccountSubmit} className="space-y-4">

          <div>
            <label className="block text-xs font-medium text-slate-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
              minLength={2}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="mt-1 w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500">Email cannot be changed here.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Profile Visibility</label>
            <div className="mt-2 flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="public"
                  checked={profileVisibility === 'public'}
                  onChange={() => setProfileVisibility('public')}
                  className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-slate-700">Public</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="private"
                  checked={profileVisibility === 'private'}
                  onChange={() => setProfileVisibility('private')}
                  className="h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-slate-700">Private</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save account'}
          </button>
        </form>
        </section>

        {/* Account Settings */}
        <section id="security" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-4">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Account Settings</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordMessage && (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {passwordMessage}
              </p>
            )}
            {passwordError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                {passwordError}
              </p>
            )}

          <div>
            <label className="block text-xs font-medium text-slate-700">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-slate-500">At least 6 characters.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {passwordSaving ? 'Updating…' : 'Update password'}
          </button>
        </form>
        </section>

        {/* Delete account */}
        <section className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-medium text-red-900">Delete account</h2>
          <p className="mb-4 text-sm text-red-800">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          {deleteError && (
            <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800">{deleteError}</div>
          )}
          <button
            type="button"
            onClick={openDeleteConfirm}
            disabled={deleteLoading}
            className="inline-flex rounded-md border border-red-300 bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting…' : 'Delete account'}
          </button>
        </section>
      </main>

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete account"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="flex-1 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting…' : 'Yes, delete account'}
            </button>
          </>
        }
      >
        Are you sure you want to delete this account? This action cannot be undone.
      </Dialog>
    </div>
  );
}
