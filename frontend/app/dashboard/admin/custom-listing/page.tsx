'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'range'
  | 'email'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'
  | 'link';

type ListingField = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  /** Minimum number of selections (multiselect only). Default 1. */
  minSelections?: number;
  subFields?: ListingField[];
  note?: string;
  reminder?: string;
  placeholder?: string;
};

type ListingConfig = {
  formTitle: string;
  formDescription: string;
  steps: {
    id: string;
    name: string;
    primaryLabel: string;
    secondaryLabel: string;
    visible: boolean;
    fields: ListingField[];
  }[];
};

const DEFAULT_CONFIG: ListingConfig = {
  formTitle: 'Create job listing',
  formDescription:
    'Create, customize, and manage job listing forms. Configure title, description, steps, fields, buttons, and labels.',
  steps: [
    {
      id: 'step-1',
      name: 'Job details',
      primaryLabel: 'Next',
      secondaryLabel: 'Cancel',
      visible: true,
      fields: [],
    },
  ],
};

export default function CustomListingPage() {
  const [config, setConfig] = useState<ListingConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'already' | 'error'>('idle');
  const [selectedStepId, setSelectedStepId] = useState<string>('step-1');
  const [fieldFilter, setFieldFilter] = useState<'all' | FieldType>('all');
  const [fieldNameFilter, setFieldNameFilter] = useState<string>('');
  const [logMessage, setLogMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const remote = await api.formConfig
          .getJobListing()
          .catch(() => null);

        if (cancelled) return;

        if (remote) {
          const steps =
            remote.steps && remote.steps.length
              ? remote.steps.map((s, stepIndex) => ({
                  id: s.id,
                  name: s.name,
                  primaryLabel: s.primaryLabel,
                  secondaryLabel: s.secondaryLabel || 'Back',
                  visible: s.visible ?? true,
                  fields: (s.fields ?? []).map((f, fieldIndex) => ({
                    id: f.id,
                    label: f.label,
                    type: (f.type as FieldType) || 'text',
                    // first step's first field is always required
                    required:
                      stepIndex === 0 && fieldIndex === 0 ? true : f.required ?? false,
                    options: f.options ?? [],
                    minSelections: (f as { minSelections?: number }).minSelections ?? (f.type === 'multiselect' ? 1 : undefined),
                    note: f.note ?? '',
                    reminder: f.reminder ?? '',
                    placeholder: f.placeholder ?? '',
                    subFields: (f.subFields ?? []).map((sf) => ({
                      id: sf.id,
                      label: sf.label,
                      type: (sf.type as FieldType) || 'text',
                      required: sf.required ?? false,
                      options: sf.options ?? [],
                      minSelections: (sf as { minSelections?: number }).minSelections ?? (sf.type === 'multiselect' ? 1 : undefined),
                      note: sf.note ?? '',
                      reminder: sf.reminder ?? '',
                      placeholder: sf.placeholder ?? '',
                    })),
                  })),
                }))
              : DEFAULT_CONFIG.steps;

          setConfig({
            formTitle: remote.formTitle || DEFAULT_CONFIG.formTitle,
            formDescription: remote.formDescription || DEFAULT_CONFIG.formDescription,
            steps,
          });
          setSelectedStepId(steps[0]?.id ?? DEFAULT_CONFIG.steps[0].id);
          setStatus('idle');
          setLogMessage('Loaded configuration from server.');
        } else {
          setConfig(DEFAULT_CONFIG);
          setSelectedStepId(DEFAULT_CONFIG.steps[0].id);
          setStatus('error');
          setLogMessage('Server configuration not found. Using default values.');
        }
      } catch (e) {
        if (cancelled) return;
        setConfig(DEFAULT_CONFIG);
        setSelectedStepId(DEFAULT_CONFIG.steps[0].id);
        setStatus('error');
        setLogMessage('Error loading configuration. Using default values.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<K extends keyof ListingConfig>(key: K, value: ListingConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function updateStep(id: string, partial: Partial<ListingConfig['steps'][number]>) {
    setConfig((prev) => ({
      ...prev,
      steps: prev.steps.map((step, stepIndex) => {
        if (step.id !== id) return step;
        const next = { ...step, ...partial };
        // Enforce: first step's first field is required
        if (stepIndex === 0 && next.fields && next.fields.length > 0) {
          next.fields = next.fields.map((f, idx) =>
            idx === 0 ? { ...f, required: true } : f,
          );
        }
        return next;
      }),
    }));
    setSaved(false);
  }

  function addStep() {
    const newId = `step-${Date.now()}`;
    const newStep = {
      id: newId,
      name: `Step ${config.steps.length + 1}`,
      primaryLabel: 'Next',
      secondaryLabel: 'Back',
      visible: true,
      fields: [],
    };
    setConfig((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
    setSelectedStepId(newId);
    setSaved(false);
  }

  function removeStep(id: string) {
    if (config.steps.length === 1) return;
    const remaining = config.steps.filter((s) => s.id !== id);
    setConfig((prev) => ({ ...prev, steps: remaining }));
    setSelectedStepId(remaining[0].id);
    setSaved(false);
  }

  async function handleSave() {
    try {
      const payload = {
        formTitle: config.formTitle,
        formDescription: config.formDescription,
        steps: config.steps.map((s) => ({
          id: s.id,
          name: s.name,
          primaryLabel: s.primaryLabel,
          secondaryLabel: s.secondaryLabel,
          visible: s.visible,
          fields: s.fields.map((f) => ({
            id: f.id,
            label: f.label,
            type: f.type,
            required: f.required,
            options: f.options ?? [],
            minSelections: f.type === 'multiselect' ? (f.minSelections ?? 1) : undefined,
            note: f.note ?? '',
            reminder: f.reminder ?? '',
            placeholder: f.placeholder ?? '',
            subFields: (f.subFields ?? []).map((sf) => ({
              id: sf.id,
              label: sf.label,
              type: sf.type,
              required: sf.required,
              options: sf.options ?? [],
              minSelections: sf.type === 'multiselect' ? (sf.minSelections ?? 1) : undefined,
              note: sf.note ?? '',
              reminder: sf.reminder ?? '',
              placeholder: sf.placeholder ?? '',
            })),
          })),
        })),
      };

      const existing = await api.formConfig
        .getJobListing()
        .catch(() => null);

      const hasExisting =
        !!existing &&
        existing.formTitle === payload.formTitle &&
        existing.formDescription === payload.formDescription &&
        JSON.stringify(existing.steps) === JSON.stringify(payload.steps);

      if (hasExisting) {
        setStatus('already');
        setSaved(true);
        setLogMessage('Configuration was already saved. No changes detected.');
      } else {
        await api.formConfig.updateJobListing(payload);
        setStatus('saved');
        setSaved(true);
        const stepNames = config.steps.map((s) => s.name || 'Untitled step').join(', ');
        const message = `Configuration saved at ${new Date().toLocaleTimeString()} with ${config.steps.length} step(s): ${stepNames}.`;
        setLogMessage(message);
      }
    } catch (e) {
      setStatus('error');
      setSaved(false);
      setLogMessage('Error: Unable to save configuration to server.');
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  const selectedStep = config.steps.find((s) => s.id === selectedStepId) ?? config.steps[0];
  const hasAtLeastOneField = config.steps.some((s) => (s.fields ?? []).length > 0);
  const canSave =
    config.formTitle.trim().length > 0 && config.steps.length > 0 && hasAtLeastOneField;

  const visibleFieldsForSelectedStep = (selectedStep?.fields ?? []).filter((f) => {
    const matchesType = fieldFilter === 'all' || f.type === fieldFilter;
    const matchesName =
      !fieldNameFilter.trim() ||
      f.label.toLowerCase().includes(fieldNameFilter.trim().toLowerCase());
    return matchesType && matchesName;
  });

  return (
    <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Update job listing form
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Update, customize, and manage the job listing form. Configure title, description, steps,
            fields, buttons, and labels.
          </p>
        </div>
      </div>

      <div className="space-y-6 px-6 py-5">
        {/* Form title & description */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Form title &amp; description</h2>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-700">Form title</label>
              <input
                type="text"
                value={config.formTitle}
                onChange={(e) => updateField('formTitle', e.target.value)}
                placeholder="Enter form title…"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Form description
              </label>
              <textarea
                value={config.formDescription}
                onChange={(e) => updateField('formDescription', e.target.value)}
                placeholder="Enter form description…"
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </section>

        {/* Form steps & button configuration */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Form steps &amp; button configuration
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Configure each step and customize button labels &amp; visibility.
              </p>
            </div>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              + Add step
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[200px,minmax(0,1fr)]">
            <div className="space-y-1">
              {config.steps.map((step) => {
                const active = step.id === selectedStepId;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setSelectedStepId(step.id)}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs ${
                      active
                        ? 'bg-white font-medium text-slate-900 shadow-sm'
                        : 'bg-transparent text-slate-600 hover:bg-white/70'
                    }`}
                  >
                    <span className="truncate">{step.name || 'Untitled step'}</span>
                    {!active && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400">
                        {step.visible ? 'Visible' : 'Hidden'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Step name
                </label>
                <input
                  type="text"
                  value={selectedStep?.name ?? ''}
                  onChange={(e) =>
                    updateStep(selectedStep.id, {
                      name: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Primary button label
                  </label>
                  <input
                    type="text"
                    value={selectedStep?.primaryLabel ?? ''}
                    onChange={(e) =>
                      updateStep(selectedStep.id, {
                        primaryLabel: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Secondary button label
                  </label>
                  <input
                    type="text"
                    value={selectedStep?.secondaryLabel ?? ''}
                    onChange={(e) =>
                      updateStep(selectedStep.id, {
                        secondaryLabel: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedStep?.visible ?? true}
                    onChange={(e) =>
                      updateStep(selectedStep.id, {
                        visible: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Visible in form
                </label>
                {config.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(selectedStep.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Remove step
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Form fields per step */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Form fields</h2>
              <p className="mt-1 text-xs text-slate-500">
                Add and configure fields for the selected step. These definitions are stored for
                future use.
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Note: The first field in the first step is always required and will be used as the
                Job Title in the employer&apos;s Create Job Listing form.
              </p>
            </div>
            <div className="text-xs text-slate-700">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  <label className="font-medium" htmlFor="fieldTypeFilter">
                    Field type
                  </label>
                  <select
                    id="fieldTypeFilter"
                    value={fieldFilter}
                    onChange={(e) =>
                      setFieldFilter(
                        e.target.value === 'all'
                          ? 'all'
                          : (e.target.value as FieldType),
                      )
                    }
                    className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="all">All</option>
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="richtext">Rich text / Bullet list</option>
                    <option value="number">Number</option>
                    <option value="range">Range (number)</option>
                    <option value="email">Email</option>
                    <option value="select">Select</option>
                    <option value="multiselect">Multi select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="radio">Radio</option>
                    <option value="date">Date</option>
                    <option value="file">File upload</option>
                    <option value="link">Link</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <label className="font-medium" htmlFor="fieldNameFilter">
                    Name
                  </label>
                  <input
                    id="fieldNameFilter"
                    type="text"
                    value={fieldNameFilter}
                    onChange={(e) => setFieldNameFilter(e.target.value)}
                    placeholder="Filter by label…"
                    className="w-40 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-3 text-sm">
            {(visibleFieldsForSelectedStep ?? []).length === 0 ? (
              <p className="text-xs text-slate-500">
                No fields for this step yet. Click &quot;Add field&quot; to start.
              </p>
            ) : (
              visibleFieldsForSelectedStep.map((field) => {
                const firstStep = config.steps[0];
                const firstFieldId = firstStep?.fields?.[0]?.id;
                const isTitleField = firstStep && field.id === firstFieldId;

                return (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 md:flex-row md:items-center"
                  >
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateStep(selectedStep.id, {
                            fields: (selectedStep.fields ?? []).map((f) =>
                              f.id === field.id ? { ...f, label: e.target.value } : f,
                            ),
                          })
                        }
                        placeholder="Field label"
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <input
                        type="text"
                        value={field.placeholder ?? ''}
                        onChange={(e) =>
                          updateStep(selectedStep.id, {
                            fields: (selectedStep.fields ?? []).map((f) =>
                              f.id === field.id ? { ...f, placeholder: e.target.value } : f,
                            ),
                          })
                        }
                        placeholder="Placeholder (optional)"
                        className="w-full rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <textarea
                        value={field.note ?? ''}
                        onChange={(e) =>
                          updateStep(selectedStep.id, {
                            fields: (selectedStep.fields ?? []).map((f) =>
                              f.id === field.id ? { ...f, note: e.target.value } : f,
                            ),
                          })
                        }
                        placeholder="Note (optional helper text shown under the field)"
                        rows={2}
                        className="w-full rounded-md border border-dashed border-slate-200 px-2 py-1 text-[11px] text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                      />
                      <textarea
                        value={field.reminder ?? ''}
                        onChange={(e) =>
                          updateStep(selectedStep.id, {
                            fields: (selectedStep.fields ?? []).map((f) =>
                              f.id === field.id ? { ...f, reminder: e.target.value } : f,
                            ),
                          })
                        }
                        placeholder="Reminder (optional important note shown in red)"
                        rows={2}
                        className="w-full rounded-md border border-dashed border-red-200 px-2 py-1 text-[11px] text-red-600 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                      />
                      <label className="inline-flex items-center gap-2 text-[11px] text-slate-600">
                        <input
                          type="checkbox"
                          checked={isTitleField ? true : field.required}
                          onChange={(e) => {
                            if (isTitleField) return;
                            updateStep(selectedStep.id, {
                              fields: (selectedStep.fields ?? []).map((f) =>
                                f.id === field.id ? { ...f, required: e.target.checked } : f,
                              ),
                            });
                          }}
                          disabled={isTitleField}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-60"
                        />
                        {isTitleField ? 'Required (Job title)' : 'Required'}
                      </label>
                    </div>
                    <div className="flex flex-wrap items-start gap-2 md:gap-3">
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateStep(selectedStep.id, {
                            fields: (selectedStep.fields ?? []).map((f) =>
                              f.id === field.id ? { ...f, type: e.target.value as any } : f,
                            ),
                          })
                        }
                        className="h-8 rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Textarea</option>
                        <option value="richtext">Rich text / Bullet list</option>
                        <option value="number">Number</option>
                        <option value="range">Range (number)</option>
                        <option value="email">Email</option>
                        <option value="select">Select</option>
                        <option value="multiselect">Multi select</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="radio">Radio</option>
                        <option value="date">Date</option>
                        <option value="file">File upload</option>
                        <option value="link">Link</option>
                      </select>
                      {(field.type === 'select' ||
                        field.type === 'multiselect' ||
                        field.type === 'checkbox' ||
                        field.type === 'radio') && (
                        <>
                          <input
                            type="text"
                            value={(field.options ?? []).join(', ')}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const parts = raw
                                .split(',')
                                .map((p) => p.trim())
                                .filter(Boolean);
                              updateStep(selectedStep.id, {
                                fields: (selectedStep.fields ?? []).map((f) =>
                                  f.id === field.id ? { ...f, options: parts } : f,
                                ),
                              });
                            }}
                            placeholder="Choices (comma-separated)"
                            className="min-w-[180px] flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                          {field.type === 'multiselect' && (
                            <div className="flex items-center gap-1">
                              <label className="text-[11px] text-slate-600">Min:</label>
                              <input
                                type="number"
                                min={1}
                                value={field.minSelections ?? 1}
                                onChange={(e) => {
                                  const n = Math.max(1, parseInt(e.target.value, 10) || 1);
                                  updateStep(selectedStep.id, {
                                    fields: (selectedStep.fields ?? []).map((f) =>
                                      f.id === field.id ? { ...f, minSelections: n } : f,
                                    ),
                                  });
                                }}
                                className="w-12 rounded-md border border-slate-300 px-1.5 py-1 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                              />
                            </div>
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          updateStep(selectedStep.id, {
                          fields: (selectedStep.fields ?? []).filter(
                            (existing) => existing.id !== field.id,
                          ),
                          })
                        }
                        className="text-[11px] font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    {/* Sub fields */}
                    <div className="mt-2 w-full border-t border-dashed border-slate-200 pt-2 text-[11px] text-slate-600">
                      <div className="mb-1 flex items-center justify-between">
                        <span>Sub fields</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateStep(selectedStep.id, {
                              fields: (selectedStep.fields ?? []).map((f) =>
                                f.id === field.id
                                  ? {
                                      ...f,
                                      subFields: [
                                        ...(f.subFields ?? []),
                                        {
                                          id: `subfield-${Date.now()}`,
                                          label: '',
                                          type: 'text' as FieldType,
                                          required: false,
                                          options: [],
                                          note: '',
                                          reminder: '',
                                          placeholder: '',
                                        },
                                      ],
                                    }
                                  : f,
                              ),
                            })
                          }
                          className="text-[11px] font-medium text-brand-600 hover:text-brand-700"
                        >
                          + Add sub field
                        </button>
                      </div>
                      {(field.subFields ?? []).length === 0 ? (
                        <p className="text-[11px] text-slate-400">
                          No sub fields. Use &quot;Add sub field&quot; to attach additional inputs.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {(field.subFields ?? []).map((sub, sIndex) => (
                            <div
                              key={sub.id}
                              className="flex flex-col gap-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-2 md:flex-row md:items-center"
                            >
                              <div className="flex-1 space-y-1">
                                <input
                                  type="text"
                                  value={sub.label}
                                  onChange={(e) =>
                                    updateStep(selectedStep.id, {
                                      fields: (selectedStep.fields ?? []).map((f) =>
                                        f.id === field.id
                                          ? {
                                              ...f,
                                              subFields: (f.subFields ?? []).map((sf) =>
                                                sf.id === sub.id
                                                  ? { ...sf, label: e.target.value }
                                                  : sf,
                                              ),
                                            }
                                          : f,
                                      ),
                                    })
                                  }
                                  placeholder="Sub field label"
                                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-[11px] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                                <label className="inline-flex items-center gap-2 text-[10px] text-slate-600">
                                  <input
                                    type="checkbox"
                                    checked={sub.required}
                                    onChange={(e) =>
                                      updateStep(selectedStep.id, {
                                        fields: (selectedStep.fields ?? []).map((f) =>
                                          f.id === field.id
                                            ? {
                                                ...f,
                                                subFields: (f.subFields ?? []).map((sf) =>
                                                  sf.id === sub.id
                                                    ? { ...sf, required: e.target.checked }
                                                    : sf,
                                                ),
                                              }
                                            : f,
                                        ),
                                      })
                                    }
                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                  />
                                  Required
                                </label>
                                <input
                                  type="text"
                                  value={sub.placeholder ?? ''}
                                  onChange={(e) =>
                                    updateStep(selectedStep.id, {
                                      fields: (selectedStep.fields ?? []).map((f) =>
                                        f.id === field.id
                                          ? {
                                              ...f,
                                              subFields: (f.subFields ?? []).map((sf) =>
                                                sf.id === sub.id
                                                  ? { ...sf, placeholder: e.target.value }
                                                  : sf,
                                              ),
                                            }
                                          : f,
                                      ),
                                    })
                                  }
                                  placeholder="Placeholder (optional)"
                                  className="w-full rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                                <textarea
                                  value={sub.note ?? ''}
                                  onChange={(e) =>
                                    updateStep(selectedStep.id, {
                                      fields: (selectedStep.fields ?? []).map((f) =>
                                        f.id === field.id
                                          ? {
                                              ...f,
                                              subFields: (f.subFields ?? []).map((sf) =>
                                                sf.id === sub.id
                                                  ? { ...sf, note: e.target.value }
                                                  : sf,
                                              ),
                                            }
                                          : f,
                                      ),
                                    })
                                  }
                                  placeholder="Note (optional helper text)"
                                  rows={2}
                                  className="w-full rounded-md border border-dashed border-slate-200 px-2 py-1 text-[10px] text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                                />
                                <textarea
                                  value={sub.reminder ?? ''}
                                  onChange={(e) =>
                                    updateStep(selectedStep.id, {
                                      fields: (selectedStep.fields ?? []).map((f) =>
                                        f.id === field.id
                                          ? {
                                              ...f,
                                              subFields: (f.subFields ?? []).map((sf) =>
                                                sf.id === sub.id
                                                  ? { ...sf, reminder: e.target.value }
                                                  : sf,
                                              ),
                                            }
                                          : f,
                                      ),
                                    })
                                  }
                                  placeholder="Reminder (optional important note)"
                                  rows={2}
                                  className="w-full rounded-md border border-dashed border-red-200 px-2 py-1 text-[10px] text-red-600 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <select
                                  value={sub.type}
                                  onChange={(e) =>
                                    updateStep(selectedStep.id, {
                                      fields: (selectedStep.fields ?? []).map((f) =>
                                        f.id === field.id
                                          ? {
                                              ...f,
                                              subFields: (f.subFields ?? []).map((sf) =>
                                                sf.id === sub.id
                                                  ? {
                                                      ...sf,
                                                      type: e.target.value as FieldType,
                                                    }
                                                  : sf,
                                              ),
                                            }
                                          : f,
                                      ),
                                    })
                                  }
                                  className="h-8 rounded-md border border-slate-300 px-2 py-1 text-[11px] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                >
                                  <option value="text">Text</option>
                                  <option value="textarea">Textarea</option>
                                  <option value="richtext">Rich text / Bullet list</option>
                                  <option value="number">Number</option>
                                  <option value="range">Range (number)</option>
                                  <option value="email">Email</option>
                                  <option value="select">Select</option>
                                  <option value="multiselect">Multi select</option>
                                  <option value="checkbox">Checkbox</option>
                                  <option value="radio">Radio</option>
                                  <option value="date">Date</option>
                                  <option value="file">File upload</option>
                                  <option value="link">Link</option>
                                </select>
                                {(sub.type === 'select' ||
                                  sub.type === 'multiselect' ||
                                  sub.type === 'checkbox' ||
                                  sub.type === 'radio') && (
                                  <>
                                    <input
                                      type="text"
                                      value={(sub.options ?? []).join(', ')}
                                      onChange={(e) => {
                                        const raw = e.target.value;
                                        const parts = raw
                                          .split(',')
                                          .map((p) => p.trim())
                                          .filter(Boolean);
                                        updateStep(selectedStep.id, {
                                          fields: (selectedStep.fields ?? []).map((f) =>
                                            f.id === field.id
                                              ? {
                                                  ...f,
                                                  subFields: (f.subFields ?? []).map((sf) =>
                                                    sf.id === sub.id
                                                      ? { ...sf, options: parts }
                                                      : sf,
                                                  ),
                                                }
                                              : f,
                                          ),
                                        });
                                      }}
                                      placeholder="Choices (comma-separated)"
                                      className="min-w-[160px] flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-[11px] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    />
                                    {sub.type === 'multiselect' && (
                                      <div className="flex items-center gap-1">
                                        <label className="text-[10px] text-slate-600">Min:</label>
                                        <input
                                          type="number"
                                          min={1}
                                          value={sub.minSelections ?? 1}
                                          onChange={(e) => {
                                            const n = Math.max(1, parseInt(e.target.value, 10) || 1);
                                            updateStep(selectedStep.id, {
                                              fields: (selectedStep.fields ?? []).map((f) =>
                                                f.id === field.id
                                                  ? {
                                                      ...f,
                                                      subFields: (f.subFields ?? []).map((sf) =>
                                                        sf.id === sub.id
                                                          ? { ...sf, minSelections: n }
                                                          : sf,
                                                      ),
                                                    }
                                                  : f,
                                              ),
                                            });
                                          }}
                                          className="w-10 rounded-md border border-slate-300 px-1 py-0.5 text-[11px] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                        />
                                      </div>
                                    )}
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStep(selectedStep.id, {
                                      fields: (selectedStep.fields ?? []).map((f) =>
                                        f.id === field.id
                                          ? {
                                              ...f,
                                              subFields: (f.subFields ?? []).filter(
                                                (_sf, i) => i !== sIndex,
                                              ),
                                            }
                                          : f,
                                      ),
                                    })
                                  }
                                  className="text-[10px] font-medium text-red-600 hover:text-red-700"
                                >
                                  Remove sub
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <button
              type="button"
              onClick={() =>
                updateStep(selectedStep.id, {
                  fields: [
                    ...(selectedStep?.fields ?? []),
                    {
                      id: `field-${Date.now()}`,
                      label: '',
                      type: 'text',
                      required: false,
                      options: [],
                    },
                  ],
                })
              }
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              + Add field
            </button>
          </div>
        </section>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <div className="space-y-1 text-xs text-slate-500">
            <div>
              {loading
                ? 'Loading configuration from server…'
                : 'Settings are stored in the backend for all users.'}
            </div>
            {!canSave && (
              <div className="text-[11px] text-amber-700">
                Enter a form title and create at least one step with at least one field to enable
                saving.
              </div>
            )}
            {logMessage && canSave && (
              <div className="text-[11px] text-emerald-700">{logMessage}</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-emerald-600">Saved.</span>}
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="pointer-events-none fixed inset-x-0 top-4 flex justify-center md:justify-end md:pr-6">
          <div className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-lg bg-slate-900 px-4 py-3 text-xs text-slate-50 shadow-lg">
            <span
              className={`mt-0.5 h-2 w-2 rounded-full ${
                status === 'saved'
                  ? 'bg-emerald-400'
                  : status === 'already'
                  ? 'bg-amber-400'
                  : 'bg-red-500'
              }`}
            />
            <div>
              <p className="font-semibold">
                {status === 'saved'
                  ? 'Saved'
                  : status === 'already'
                  ? 'Already saved'
                  : 'Error'}
              </p>
              {logMessage && <p className="mt-0.5 text-[11px] text-slate-200">{logMessage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

