'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, type Job } from '@/lib/api';

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.jobs.one(id).then(setJob).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-8 text-slate-500">Loading…</p>;
  if (!job) return <p className="p-8 text-slate-500">Job not found.</p>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="font-semibold text-slate-800">
            JobBoard
          </Link>
          <Link href="/jobs" className="text-slate-600 hover:text-slate-900">
            ← Back to jobs
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
          <p className="mt-2 text-slate-600">
            {job.employer?.companyName || job.employer?.name} · {job.location}
            {job.salary && ` · ${job.salary}`}
          </p>
          <div className="mt-4 whitespace-pre-wrap text-slate-700">
            {job.description}
          </div>
          <div className="mt-6 flex gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
            >
              Apply (log in)
            </Link>
            <Link
              href="/jobs"
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Back to list
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
