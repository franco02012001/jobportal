'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Job } from '@/lib/api';

export type JobsFilterType = 'all' | 'remote' | 'onsite' | 'web3' | 'recommended';

function matchRemote(job: Job): boolean {
  const loc = (job.location ?? '').toLowerCase();
  if (loc.includes('remote')) return true;
  const values = Object.values(job.formData ?? {}).map((v) => String(v).toLowerCase());
  return values.some((v) => v.includes('remote'));
}

function matchOnsite(job: Job): boolean {
  const loc = (job.location ?? '').toLowerCase();
  const text = [loc, job.title ?? '', job.description ?? '', ...Object.values(job.formData ?? {}).map(String)].join(' ').toLowerCase();
  return /on-?\s*site|onsite|on site|in-?\s*office|in office/.test(text);
}

function matchWeb3(job: Job): boolean {
  const text = [(job.title ?? ''), job.description ?? '', ...Object.values(job.formData ?? {}).map(String)].join(' ').toLowerCase();
  return text.includes('web3') || text.includes('web 3') || text.includes('blockchain') || text.includes('crypto');
}

function filterJobs(jobs: Job[], filter: JobsFilterType): Job[] {
  switch (filter) {
    case 'remote':
      return jobs.filter(matchRemote);
    case 'onsite':
      return jobs.filter(matchOnsite);
    case 'web3':
      return jobs.filter(matchWeb3);
    case 'recommended':
      return jobs; // Could later apply personalized ranking
    default:
      return jobs;
  }
}

function matchSearch(job: Job, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const title = (job.title ?? '').toLowerCase();
  const company = (job.employer?.companyName ?? job.employer?.name ?? '').toLowerCase();
  return title.includes(q) || company.includes(q);
}

const PAGE_TITLES: Record<JobsFilterType, string> = {
  all: 'All jobs',
  remote: 'Remote jobs',
  onsite: 'On-site jobs',
  web3: 'Web3 jobs',
  recommended: 'Recommended jobs',
};

interface JobsListClientProps {
  filter: JobsFilterType;
}

const TYPE_FILTER_OPTIONS: { value: JobsFilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'web3', label: 'Web3' },
];

const BANNER_FILTERS: JobsFilterType[] = ['recommended', 'remote', 'onsite', 'web3'];

export function JobsListClient({ filter }: JobsListClientProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<JobsFilterType>(() =>
    filter === 'recommended' ? 'all' : filter,
  );

  useEffect(() => {
    api.jobs.list().then(setJobs).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (BANNER_FILTERS.includes(filter)) {
      setTypeFilter(filter === 'recommended' ? 'all' : filter);
    }
  }, [filter]);

  const showBanner = BANNER_FILTERS.includes(filter);
  const byTypeFilter = showBanner ? filterJobs(jobs, typeFilter) : filterJobs(jobs, filter);
  const filtered = byTypeFilter.filter((job) => matchSearch(job, searchQuery));
  const title = PAGE_TITLES[filter];

  return (
    <div className="bg-slate-50">
      {showBanner && (
        <div className="border-b border-slate-200 bg-gradient-to-br from-indigo-600 to-indigo-800 px-4 py-8 text-white">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="mt-1 text-sm text-indigo-100">
              {filter === 'recommended' ? 'Find roles that match your preferences' : 'Search and filter by job type'}
            </p>
            <div className="mt-6 space-y-4">
              <label htmlFor="job-search-banner" className="sr-only">
                Search by job title or company name
              </label>
              <input
                id="job-search-banner"
                type="search"
                placeholder="Search by job title or company name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-indigo-500/50 bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder-slate-500 shadow-sm focus:border-white focus:outline-none focus:ring-2 focus:ring-white/80"
                aria-label="Search by job title or company name"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-indigo-200">Job type</span>
                {TYPE_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTypeFilter(opt.value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      typeFilter === opt.value
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
      )}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {!showBanner && (
          <>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <div className="mt-4">
              <label htmlFor="job-search" className="sr-only">
                Search by job title or company name
              </label>
              <input
                id="job-search"
                type="search"
                placeholder="Search by job title or company name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                aria-label="Search by job title or company name"
              />
            </div>
          </>
        )}
        {loading ? (
          <p className="mt-6 text-slate-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-6 text-slate-500">
            {searchQuery.trim()
              ? 'No jobs match your search. Try a different title or company name.'
              : showBanner && typeFilter !== 'all' && filter === 'recommended'
                ? `No ${PAGE_TITLES[typeFilter].toLowerCase()} in recommendations. Try "All" or another filter.`
                : showBanner && typeFilter !== filter
                  ? `No ${PAGE_TITLES[typeFilter].toLowerCase()} right now.`
                  : filter === 'all'
                    ? 'No jobs posted yet.'
                    : `No ${title.toLowerCase()} right now.`}
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {filtered.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-slate-900">{job.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {job.employer?.companyName || job.employer?.name}
                        {job.location && ` · ${job.location}`}
                        {job.salary && ` · ${job.salary}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {job.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
