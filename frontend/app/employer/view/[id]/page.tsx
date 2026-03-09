'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Job } from '@/lib/api';

type FormConfigStep = {
  id: string;
  name: string;
  primaryLabel: string;
  secondaryLabel?: string;
  visible: boolean;
  fields: Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    subFields?: Array<{
      id: string;
      label: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;
  }>;
};

interface EmployerViewJobPageProps {
  params: {
    id: string;
  };
}

export default function EmployerViewJobPage({ params }: EmployerViewJobPageProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [formConfig, setFormConfig] = useState<{ steps: FormConfigStep[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([
      api.jobs.one(params.id),
      api.formConfig.getJobListing().catch(() => null),
    ])
      .then(([jobData, config]) => {
        if (!cancelled) {
          setJob(jobData);
          setFormConfig(config && config.steps?.length ? { steps: config.steps } : null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load job');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const title = job?.title || 'View job';
  const formData = job?.formData ?? {};
  const useFormConfig = !!(formConfig?.steps?.length);

  function formatFieldValue(val: string, type: string): string {
    const trimmed = val.trim();
    if (!trimmed) return '—';
    if (type === 'range') {
      const m = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        const min = parseInt(m[1], 10);
        const max = parseInt(m[2], 10);
        return `${min.toLocaleString()} – ${max.toLocaleString()}`;
      }
    }
    return trimmed;
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">Loading job…</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-6">
        <Link
          href="/employer/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <span aria-hidden>←</span> Back to dashboard
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50/50 px-6 py-8 text-center">
          <p className="text-base font-semibold text-red-800">
            {error ? `Failed to load job: ${error}` : 'Job not found.'}
          </p>
        </div>
      </div>
    );
  }

  const steps = useFormConfig ? formConfig!.steps : [];
  const isListed = job.isActive;

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 px-6 py-8 text-white shadow-xl md:px-8 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <Link
              href="/employer/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              <span aria-hidden>←</span> Back to dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Created {new Date(job.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            {job.employer && (
              <p className="mt-1 text-sm text-slate-400">
                {job.employer.companyName || job.employer.name}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm ${
                isListed
                  ? 'bg-emerald-500/90 text-white ring-2 ring-emerald-400/30'
                  : 'bg-amber-500/90 text-white ring-2 ring-amber-400/30'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${isListed ? 'bg-emerald-200' : 'bg-amber-200'}`}
              />
              {isListed ? 'Listed' : 'Draft'}
            </span>
            <Link
              href={`/employer/edit/${job.id}`}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-md transition hover:bg-slate-100"
            >
              Edit job
            </Link>
          </div>
        </div>
      </header>

      <div className="mt-8 space-y-8">
        {useFormConfig ? (
          steps
            .filter((step) =>
              step.fields?.some(
                (field) =>
                  formatFieldValue(formData[field.id] ?? '', field.type) !== '—',
              ),
            )
            .map((step, stepIndex) => (
              <section
                key={step.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 md:p-8"
              >
                <h2 className="flex items-center gap-2 border-l-4 border-brand-500 pl-4 text-base font-bold uppercase tracking-wide text-slate-700">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {stepIndex + 1}
                  </span>
                  {step.name}
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-1">
                  {step.fields
                    ?.filter(
                      (field) =>
                        formatFieldValue(formData[field.id] ?? '', field.type) !== '—',
                    )
                    ?.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 transition hover:border-slate-200 hover:bg-slate-50">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {field.label}
                        </p>
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                          {formatFieldValue(formData[field.id] ?? '', field.type)}
                        </p>
                      </div>
                      {field.subFields
                        ?.filter(
                          (sub) =>
                            formatFieldValue(formData[sub.id] ?? '', sub.type) !== '—',
                        )
                        ?.map((sub) => (
                          <div
                            key={sub.id}
                            className="ml-4 rounded-lg border border-slate-100 bg-white px-4 py-2.5 shadow-sm"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              {sub.label}
                            </p>
                            <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                              {formatFieldValue(formData[sub.id] ?? '', sub.type)}
                            </p>
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
            </section>
          ))
        ) : (
          <>
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 md:p-8">
              <h2 className="flex items-center gap-2 border-l-4 border-brand-500 pl-4 text-base font-bold uppercase tracking-wide text-slate-700">
                Job details
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Title
                  </p>
                  <p className="mt-1.5 font-medium text-slate-800">
                    {job.title || 'Untitled job'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Created
                  </p>
                  <p className="mt-1.5 text-slate-800">
                    {new Date(job.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Company
                  </p>
                  <p className="mt-1.5 text-slate-800">
                    {job.employer?.companyName || job.employer?.name || '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Location
                  </p>
                  <p className="mt-1.5 text-slate-800">{job.location || '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Salary &amp; compensation
                  </p>
                  <p className="mt-1.5 text-slate-800">{job.salary || '—'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 md:p-8">
              <h2 className="flex items-center gap-2 border-l-4 border-brand-500 pl-4 text-base font-bold uppercase tracking-wide text-slate-700">
                Job description
              </h2>
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 px-5 py-4">
                <div className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
                  {job.description || 'No description provided for this job.'}
                </div>
              </div>
            </section>
          </>
        )}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 md:p-8">
          <h2 className="flex items-center gap-2 border-l-4 border-slate-400 pl-4 text-base font-bold uppercase tracking-wide text-slate-700">
            Application settings
          </h2>
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
            <span
              className={`h-3 w-3 rounded-full ${
                isListed ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <p className="text-sm font-medium text-slate-800">
              {isListed ? 'Listed (visible to candidates)' : 'Draft (not visible to candidates)'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
