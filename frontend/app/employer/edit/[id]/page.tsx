'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.jobs
      .one(id)
      .then((job) => {
        setTitle(job.title ?? '');
        setDescription(job.description ?? '');
        setLocation(job.location ?? '');
        setSalary(job.salary ?? '');
        setIsActive(job.isActive);
        setFormData(job.formData ?? {});
      })
      .catch(() => setError('Job not found'))
      .finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.jobs.update(id, {
        title,
        description,
        location,
        salary: salary || undefined,
        isActive,
        formData: Object.keys(formData).length ? formData : undefined,
      });
      router.push('/employer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <p className="text-slate-500">Loading…</p>;
  if (error && !title) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <Link href="/employer/dashboard" className="text-sm text-slate-600 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Edit job</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
        {error && (
          <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Salary (optional)</label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="isActive" className="text-sm text-slate-700">
            Job is active (visible in listings)
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
