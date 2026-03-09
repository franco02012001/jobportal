'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, type Job } from '@/lib/api';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    workSetup: '',
    experience: '',
    salaryKeyword: '',
  });

  useEffect(() => {
    api.jobs
      .list()
      .then((data) => setJobs(data))
      .catch(console.error)
      .finally(() => setLoadingLatest(false));

    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('savedJobs');
      if (stored) {
        try {
          setSavedJobIds(JSON.parse(stored));
        } catch {
          setSavedJobIds([]);
        }
      }
    }
  }, []);

  function toggleSave(jobId: string) {
    setSavedJobIds((prev) => {
      const exists = prev.includes(jobId);
      const next = exists ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('savedJobs', JSON.stringify(next));
      }
      return next;
    });
  }

  const filteredJobs = jobs.filter((job) => {
    const haystackTitleDesc = `${job.title ?? ''} ${job.description ?? ''}`.toLowerCase();
    const haystackLocation = (job.location ?? '').toLowerCase();
    const haystackSalary = (job.salary || '').toLowerCase();

    if (filters.query && !haystackTitleDesc.includes(filters.query.toLowerCase())) {
      return false;
    }
    if (filters.location && !haystackLocation.includes(filters.location.toLowerCase())) {
      return false;
    }
    if (
      filters.workSetup &&
      !haystackTitleDesc.includes(filters.workSetup.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.experience &&
      !haystackTitleDesc.includes(filters.experience.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.salaryKeyword &&
      !haystackSalary.includes(filters.salaryKeyword.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Explore jobs</h1>
        <p className="mt-2 text-base text-slate-600">
          Discover roles that match your skills, save the ones you like, and apply when you&apos;re
          ready.
        </p>
      </header>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.7fr),minmax(0,1.1fr)] xl:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)]">
        {/* Latest jobs with filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Explore jobs</h2>
            <button
              onClick={() => router.push('/jobs')}
              className="text-sm text-brand-600 hover:underline"
            >
              View all jobs →
            </button>
          </div>

          {/* Search / filters */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Keyword
                </label>
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, query: e.target.value }))
                  }
                  placeholder="Job title, skills, company…"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, location: e.target.value }))
                  }
                  placeholder="City, country, remote…"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Work setup
                </label>
                <select
                  value={filters.workSetup}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, workSetup: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Any</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Experience level
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, experience: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Any</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Salary keyword
                </label>
                <input
                  type="text"
                  value={filters.salaryKeyword}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, salaryKeyword: e.target.value }))
                  }
                  placeholder="e.g. 60k, 100k+"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {loadingLatest ? (
            <p className="mt-2 text-slate-500">Loading…</p>
          ) : filteredJobs.length === 0 ? (
            <p className="mt-2 text-slate-500">
              No jobs match your filters. Try widening your search.
            </p>
          ) : (
            <ul className="mt-2 space-y-3">
              {filteredJobs.slice(0, 8).map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-200 hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-medium text-slate-900">{job.title}</span>
                        <p className="mt-1 text-xs text-slate-500">
                          {job.employer?.companyName || job.employer?.name} · {job.location}
                          {job.salary && ` · ${job.salary}`}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                  <div className="mt-1 flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleSave(job.id)}
                      className={`rounded-md border px-2 py-1 ${
                        savedJobIds.includes(job.id)
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {savedJobIds.includes(job.id) ? 'Saved' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      className="rounded-md bg-brand-600 px-2 py-1 text-white hover:bg-brand-700"
                    >
                      Apply
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Saved jobs */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Saved jobs</h2>
            <p className="mt-1 text-xs text-slate-500">
              Quickly revisit roles you&apos;re interested in. Saved jobs are stored on this device.
            </p>
          </div>

          {savedJobIds.length === 0 ? (
            <p className="text-xs text-slate-500">
              You haven&apos;t saved any jobs yet. Use the <span className="font-medium">Save</span>{' '}
              button on a job to keep it here.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {jobs
                .filter((job) => savedJobIds.includes(job.id))
                .map((job) => (
                  <li
                    key={job.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{job.title}</p>
                      <p className="truncate text-xs text-slate-500">
                        {job.location}
                        {job.salary && ` · ${job.salary}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSave(job.id)}
                        className="text-xs font-medium text-slate-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
