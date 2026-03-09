'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api, type Job } from '@/lib/api';

type CompanyEntry = {
  id: string;
  name: string;
  jobCount: number;
};

type SortOption = 'name' | 'jobs';

function getCompaniesFromJobs(jobs: Job[], sort: SortOption): CompanyEntry[] {
  const byId = new Map<string, { name: string; count: number }>();
  for (const job of jobs) {
    const emp = job.employer;
    if (!emp?.id) continue;
    const name = (emp.companyName || emp.name || 'Unknown').trim() || 'Unknown';
    const existing = byId.get(emp.id);
    if (existing) {
      existing.count += 1;
    } else {
      byId.set(emp.id, { name, count: 1 });
    }
  }
  const list = Array.from(byId.entries())
    .map(([id, { name, count }]) => ({ id, name, jobCount: count }));
  if (sort === 'jobs') {
    list.sort((a, b) => b.jobCount - a.jobCount);
  } else {
    list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }
  return list;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Name A–Z' },
  { value: 'jobs', label: 'Most jobs' },
];

export default function CompaniesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  useEffect(() => {
    api.jobs.list().then(setJobs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const companies = useMemo(() => getCompaniesFromJobs(jobs, sortBy), [jobs, sortBy]);
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.trim().toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, searchQuery]);

  return (
    <div className="bg-slate-50">
      <div className="border-b border-slate-200 bg-gradient-to-br from-indigo-600 to-indigo-800 px-4 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-white">Companies</h1>
          <p className="mt-1 text-sm text-indigo-100">
            Employers with active job listings
          </p>
          <div className="mt-6 space-y-4">
            <label htmlFor="company-search-banner" className="sr-only">
              Search by company name
            </label>
            <input
              id="company-search-banner"
              type="search"
              placeholder="Search by company name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-indigo-500/50 bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder-slate-500 shadow-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white/80"
              aria-label="Search by company name"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-indigo-200">Sort by</span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSortBy(opt.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    sortBy === opt.value
                      ? 'bg-white text-indigo-700'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <p className="mt-6 text-slate-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-6 text-slate-500">
            {searchQuery.trim()
              ? 'No companies match your search.'
              : 'No companies with job listings yet.'}
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {filtered.map((company) => (
              <li key={company.id}>
                <div className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-slate-900">{company.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {company.jobCount} {company.jobCount === 1 ? 'job' : 'jobs'} posted
                      </p>
                    </div>
                    <Link
                      href="/jobs"
                      className="shrink-0 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                    >
                      View jobs
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

