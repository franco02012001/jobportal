'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Job } from '@/lib/api';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api.jobs.myList().then(setJobs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.isActive).length;
  const draftJobs = jobs.filter((j) => !j.isActive).length;
  const lastPostedAt =
    jobs.length > 0
      ? new Date(
          [...jobs].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0].createdAt,
        ).toLocaleString()
      : null;

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employer dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            High-level view of your job postings, activity, and drafts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/employer/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Create job posting
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total jobs</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totalJobs}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            All jobs you&apos;ve created so far.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Listed (active)</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-900">{activeJobs}</p>
          <p className="mt-1 text-[11px] text-emerald-800">
            Visible to candidates on the jobs page.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-amber-800">Drafted</p>
          <p className="mt-2 text-2xl font-semibold text-amber-900">{draftJobs}</p>
          <p className="mt-1 text-[11px] text-amber-800">
            Saved as drafts, not yet visible publicly.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Last job posted</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {lastPostedAt ?? 'No jobs posted yet'}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Timestamp of your most recently created job.
          </p>
        </div>
      </section>

      <section className="mt-2 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            All job postings
          </h2>
          <p className="text-xs text-slate-500">
            Showing {totalJobs} job(s)
          </p>
        </div>

        {loading ? (
          <p className="mt-2 text-slate-500">Loading jobs…</p>
        ) : jobs.length === 0 ? (
          <div className="mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            <p className="font-medium">You haven&apos;t created any jobs yet.</p>
            <p className="mt-1 text-xs">
              Start by creating a new job posting and it will appear here.
            </p>
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
          <ul className="mt-2 space-y-3">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="truncate text-sm font-semibold text-slate-900 hover:underline"
                    >
                      {job.title || 'Untitled job'}
                    </Link>
                    {!job.isActive && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
                        Draft
                      </span>
                    )}
                  </div>
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
      </section>
    </div>
  );
}
