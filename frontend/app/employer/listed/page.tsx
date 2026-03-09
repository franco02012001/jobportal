'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Job } from '@/lib/api';

export default function EmployerListedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api.jobs
      .myList()
      .then((all) => setJobs(all.filter((j) => j.isActive)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(job: Job) {
    const confirmed =
      typeof window === 'undefined'
        ? false
        : window.confirm(`Delete job "${job.title || 'Untitled job'}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(job.id);
      await api.jobs.delete(job.id);
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    } catch (e) {
      console.error(e);
      if (typeof window !== 'undefined') {
        window.alert('Failed to delete job. Please try again.');
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Listed job postings</h1>
          <p className="mt-1 text-sm text-slate-600">
            All active jobs currently visible to candidates.
          </p>
        </div>
        <Link
          href="/employer/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + Create job posting
        </Link>
      </div>

      {loading ? (
        <p className="mt-2 text-slate-500">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          <p className="font-medium">You have no listed jobs yet.</p>
          <p className="mt-1 text-xs">Create and publish a job to see it here.</p>
          <div className="mt-3 flex justify-center">
            <Link
              href="/employer/new"
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
            >
              + Create job posting
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-xs"
            >
              <div className="min-w-0">
                <Link
                  href={`/jobs/${job.id}`}
                  className="truncate text-sm font-semibold text-slate-900 hover:underline"
                >
                  {job.title || 'Untitled job'}
                </Link>
                <p className="mt-0.5 text-xs text-slate-400">
                  Posted {new Date(job.createdAt).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {job.location}
                  {job.salary && job.location && ' · '}
                  {job.salary}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/employer/view/${job.id}`}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  View
                </Link>
                <Link
                  href={`/employer/edit/${job.id}`}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(job)}
                  disabled={deletingId === job.id}
                  className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  {deletingId === job.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
