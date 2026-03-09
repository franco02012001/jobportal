'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Job } from '@/lib/api';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.jobs.list(showInactive).then(setJobs).catch(console.error).finally(() => setLoading(false));
  }, [showInactive]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-1 text-slate-600">
        View and moderate all job listings. Only admins can see this page.
      </p>
      <div className="mt-6 flex items-center gap-2">
        <input
          type="checkbox"
          id="showInactive"
          checked={showInactive}
          onChange={(e) => {
            setShowInactive(e.target.checked);
            setLoading(true);
          }}
          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="showInactive" className="text-sm text-slate-700">
          Include inactive jobs
        </label>
      </div>
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-slate-800">All jobs</h2>
        {loading ? (
          <p className="mt-4 text-slate-500">Loading…</p>
        ) : jobs.length === 0 ? (
          <p className="mt-4 text-slate-500">No jobs found.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
              >
                <div>
                  <Link href={`/jobs/${job.id}`} className="font-medium text-slate-900 hover:underline">
                    {job.title}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {job.employer?.companyName || job.employer?.name} · {job.location}
                    {!job.isActive && ' · Inactive'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
