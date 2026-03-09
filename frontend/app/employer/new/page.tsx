'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'number'
  | 'range'
  | 'email'
  | 'file'
  | 'link';

type WizardField = {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  name?: 'title' | 'location' | 'summary' | 'salaryMin' | 'salaryMax';
  options?: string[];
  /** Minimum number of selections (multiselect only). Default 1. */
  minSelections?: number;
  subFields?: WizardField[];
  note?: string;
  reminder?: string;
  placeholder?: string;
};

type WizardStep = {
  id: string;
  name: string;
  primaryLabel: string;
  secondaryLabel?: string;
  fields: WizardField[];
};

type WizardConfig = {
  formTitle: string;
  formDescription: string;
  steps: WizardStep[];
};

const SAMPLE_CONFIG: WizardConfig = {
  formTitle: 'Create job listing',
  formDescription:
    'Fill out the steps below to publish a new job listing. This wizard is driven by a simple config object.',
  steps: [
    {
      id: 'step-basic',
      name: 'Basic details',
      primaryLabel: 'Next',
      secondaryLabel: 'Cancel',
      fields: [
        {
          id: 'title',
          label: 'Job title',
          type: 'text',
          required: true,
          name: 'title',
        },
        {
          id: 'location',
          label: 'Location (City, Country)',
          type: 'text',
          required: true,
          name: 'location',
        },
      ],
    },
    {
      id: 'step-description',
      name: 'Description & salary',
      primaryLabel: 'Publish job',
      secondaryLabel: 'Back',
      fields: [
        {
          id: 'summary',
          label: 'Job summary',
          type: 'textarea',
          name: 'summary',
        },
        {
          id: 'salaryMin',
          label: 'Salary (min, optional)',
          type: 'text',
          name: 'salaryMin',
        },
        {
          id: 'salaryMax',
          label: 'Salary (max, optional)',
          type: 'text',
          name: 'salaryMax',
        },
      ],
    },
  ],
};

type FormState = Record<string, string>;

const INITIAL_STATE: FormState = {};

export default function NewJobPage() {
  const router = useRouter();

  const [config, setConfig] = useState<WizardConfig>(SAMPLE_CONFIG);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [values, setValues] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const remote = await api.formConfig.getJobListing().catch(() => null);

        if (cancelled || !remote) {
          setConfig(SAMPLE_CONFIG);
          setConfigLoading(false);
          return;
        }

        const steps =
          remote.steps && remote.steps.length
            ? remote.steps.map((s) => ({
                id: s.id,
                name: s.name,
                primaryLabel: s.primaryLabel || 'Next',
                secondaryLabel: s.secondaryLabel,
                fields: (s.fields ?? []).map((f) => {
                  const allowedTypes: FieldType[] = [
                    'text',
                    'textarea',
                    'richtext',
                    'select',
                    'multiselect',
                    'checkbox',
                    'radio',
                    'number',
                    'range',
                    'email',
                    'file',
                    'link',
                  ];
                  const baseType = allowedTypes.includes(f.type as FieldType)
                    ? (f.type as FieldType)
                    : ('text' as FieldType);

                  let type: FieldType = baseType;
                  const labelLower = (f.label || '').toLowerCase();
                  // Heuristic: if admin forgot to set type but label clearly indicates link/URL, coerce to link.
                  if (
                    baseType === 'text' &&
                    (labelLower.includes('link') || labelLower.includes('url'))
                  ) {
                    type = 'link';
                  }

                  let name: WizardField['name'] | undefined;
                  const key = f.label.toLowerCase();
                  if (key.includes('title')) name = 'title';
                  else if (key.includes('location')) name = 'location';
                  else if (key.includes('summary') || key.includes('description'))
                    name = 'summary';
                  else if (key.includes('min')) name = 'salaryMin';
                  else if (key.includes('max')) name = 'salaryMax';

                  const subFields: WizardField[] = (f.subFields ?? []).map((sf) => {
                    const sfBaseType = allowedTypes.includes(sf.type as FieldType)
                      ? (sf.type as FieldType)
                      : ('text' as FieldType);
                    let sfType: FieldType = sfBaseType;
                    const sfLabelLower = (sf.label || '').toLowerCase();
                    if (
                      sfBaseType === 'text' &&
                      (sfLabelLower.includes('link') || sfLabelLower.includes('url'))
                    ) {
                      sfType = 'link';
                    }
                    return {
                      id: sf.id,
                      label: sf.label,
                      type: sfType,
                      required: sf.required,
                      options: sf.options ?? [],
                      minSelections: sfType === 'multiselect' ? ((sf as { minSelections?: number }).minSelections ?? 1) : undefined,
                      note: sf.note,
                      reminder: sf.reminder,
                      placeholder: sf.placeholder,
                    };
                  });

                  return {
                    id: f.id,
                    label: f.label,
                    type,
                    required: f.required,
                    name,
                    options: f.options ?? [],
                    minSelections: type === 'multiselect' ? ((f as { minSelections?: number }).minSelections ?? 1) : undefined,
                    subFields,
                    note: f.note,
                    reminder: f.reminder,
                    placeholder: f.placeholder,
                  };
                }) as WizardField[],
              }))
            : SAMPLE_CONFIG.steps;

        const firstValidStepIndex = steps.findIndex((s) => s.fields.length > 0);

        setConfig({
          formTitle: remote.formTitle || SAMPLE_CONFIG.formTitle,
          formDescription: remote.formDescription || SAMPLE_CONFIG.formDescription,
          steps,
        });
        setCurrentStepIndex(firstValidStepIndex >= 0 ? firstValidStepIndex : 0);
      } catch {
        setConfig(SAMPLE_CONFIG);
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    }

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentStep = config.steps[currentStepIndex];
  const isLastStep = currentStepIndex === config.steps.length - 1;

  function updateValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(step: WizardStep): boolean {
    for (const field of step.fields) {
      const parentVal = (values[field.id] ?? '').trim();

      if (field.required) {
        if (!parentVal) {
          setError(`Please fill in "${field.label}".`);
          return false;
        }
        // If "Other" is selected on a required select/radio, require the free-text answer too.
        if (
          (field.type === 'select' || field.type === 'radio') &&
          field.options?.includes('Other') &&
          parentVal === 'Other'
        ) {
          const otherVal = (values[`${field.id}__other`] ?? '').trim();
          if (!otherVal) {
            setError(`Please specify a value for "${field.label}".`);
            return false;
          }
        }
      }

      // Multiselect: require at least minSelections (default 1) to be selected
      if (field.type === 'multiselect' && (field.options ?? []).length > 0) {
        const selected = parentVal
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
        const min = Math.max(1, field.minSelections ?? 1);
        if (selected.length < min) {
          setError(
            `"${field.label}" requires at least ${min} selection(s). Please select at least ${min}.`,
          );
          return false;
        }
      }

      // Number field validation: whole number, no negatives
      if (parentVal && field.type === 'number') {
        const n = Number(parentVal);
        if (!Number.isInteger(n) || n < 0) {
          setError(`"${field.label}" must be a whole number (0 or greater).`);
          return false;
        }
      }

      // Link field validation: must be an https:// URL if provided
      if (parentVal && field.type === 'link') {
        const v = parentVal.trim();
        if (!/^https:\/\/.+/i.test(v)) {
          setError(`"${field.label}" must be a valid URL starting with "https://".`);
          return false;
        }
      }

      // Email field validation: basic format when provided
      if (parentVal && field.type === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentVal)) {
          setError(`"${field.label}" must be a valid email address.`);
          return false;
        }
      }

      // Range field validation: "min - max", whole numbers, non-negative; if required both must be filled; min <= max
      if (field.type === 'range') {
        const parts = parentVal.split(/\s*-\s*/).map((s) => s.trim().replace(/,/g, ''));
        const [minStr, maxStr] = parts;
        if (field.required) {
          if (!minStr || !maxStr) {
            setError(`"${field.label}" requires both minimum and maximum values.`);
            return false;
          }
        }
        if (minStr || maxStr) {
          const minNum = minStr ? Number(minStr) : NaN;
          const maxNum = maxStr ? Number(maxStr) : NaN;
          if (minStr && (!Number.isInteger(minNum) || minNum < 0)) {
            setError(`"${field.label}" minimum must be a whole number (0 or greater).`);
            return false;
          }
          if (maxStr && (!Number.isInteger(maxNum) || maxNum < 0)) {
            setError(`"${field.label}" maximum must be a whole number (0 or greater).`);
            return false;
          }
          if (minStr && maxStr && minNum > maxNum) {
            setError(`"${field.label}" minimum must be less than or equal to maximum.`);
            return false;
          }
        }
      }

      if (field.subFields) {
        for (const sub of field.subFields) {
          // Sub field is considered "active" when either:
          // - sub.label is empty (always show when parent has a value), or
          // - sub.label exactly matches the selected parent option.
          const isActiveSub =
            !!parentVal && (!sub.label || sub.label === parentVal);
          if (!isActiveSub || !sub.required) continue;

          const vSub = values[sub.id];
          if (!vSub || !vSub.trim()) {
            setError(`Please fill in "${sub.label}".`);
            return false;
          }

          const trimmedSub = vSub.trim();
          // Number validation for required numeric sub-fields
          if (trimmedSub && sub.type === 'number') {
            const nSub = Number(trimmedSub);
            if (!Number.isInteger(nSub) || nSub < 0) {
              setError(`"${sub.label}" must be a whole number (0 or greater).`);
              return false;
            }
          }

          // Link validation for required link sub-fields: must be https:// URL
          if (trimmedSub && sub.type === 'link') {
            if (!/^https:\/\/.+/i.test(trimmedSub)) {
              setError(`"${sub.label}" must be a valid URL starting with "https://".`);
              return false;
            }
          }

          // Multiselect sub-field: require at least minSelections (default 1)
          if (sub.type === 'multiselect' && (sub.options ?? []).length > 0) {
            const subSelected = (values[sub.id] ?? '')
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean);
            const subMin = Math.max(1, sub.minSelections ?? 1);
            if (isActiveSub && subSelected.length < subMin) {
              setError(
                `"${sub.label}" requires at least ${subMin} selection(s). Please select at least ${subMin}.`,
              );
              return false;
            }
          }

          // Email sub-field: basic format when provided
          if (trimmedSub && sub.type === 'email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedSub)) {
              setError(`"${sub.label}" must be a valid email address.`);
              return false;
            }
          }

          // Range sub-field validation
          if (sub.type === 'range' && isActiveSub) {
            const subVal = (values[sub.id] ?? '').trim();
            const subParts = subVal.split(/\s*-\s*/).map((s) => s.trim().replace(/,/g, ''));
            const [subMinStr, subMaxStr] = subParts;
            if (sub.required && (!subMinStr || !subMaxStr)) {
              setError(`"${sub.label}" requires both minimum and maximum values.`);
              return false;
            }
            if (subMinStr || subMaxStr) {
              const subMinNum = subMinStr ? Number(subMinStr) : NaN;
              const subMaxNum = subMaxStr ? Number(subMaxStr) : NaN;
              if (subMinStr && (!Number.isInteger(subMinNum) || subMinNum < 0)) {
                setError(`"${sub.label}" minimum must be a whole number (0 or greater).`);
                return false;
              }
              if (subMaxStr && (!Number.isInteger(subMaxNum) || subMaxNum < 0)) {
                setError(`"${sub.label}" maximum must be a whole number (0 or greater).`);
                return false;
              }
              if (subMinStr && subMaxStr && subMinNum > subMaxNum) {
                setError(`"${sub.label}" minimum must be less than or equal to maximum.`);
                return false;
              }
            }
          }
        }
      }
    }
    setError('');
    return true;
  }

  async function handlePrimary(mode: 'post' | 'draft') {
    if (!validateStep(currentStep)) return;

    if (!isLastStep) {
      setCurrentStepIndex((i) => i + 1);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const allFields = config.steps.flatMap((s) => s.fields);
      const fieldById = new Map<string, WizardField>();
      allFields.forEach((f) => {
        fieldById.set(f.id, f);
        (f.subFields ?? []).forEach((sf) => fieldById.set(sf.id, sf));
      });

      const getEffectiveValue = (id: string): string => {
        const raw = (values[id] ?? '').trim();
        const field = fieldById.get(id);
        if (!field) return raw;
        if (
          (field.type === 'select' || field.type === 'radio') &&
          field.options?.includes('Other') &&
          raw === 'Other'
        ) {
          const otherRaw = (values[`${id}__other`] ?? '').trim();
          return otherRaw || raw;
        }
        return raw;
      };

      // Default title = first step's first field
      const defaultTitleField = config.steps[0]?.fields[0];

      const titleField =
        defaultTitleField ||
        allFields.find((f) => f.name === 'title') ||
        allFields.find((f) => f.label.toLowerCase().includes('title'));
      const locationField =
        allFields.find((f) => f.name === 'location') ??
        allFields.find((f) => f.label.toLowerCase().includes('location'));
      const summaryField =
        allFields.find((f) => f.name === 'summary') ??
        allFields.find((f) =>
          f.label.toLowerCase().match(/summary|description|job description/),
        );
      const salaryMinField =
        allFields.find((f) => f.name === 'salaryMin') ??
        allFields.find((f) => f.label.toLowerCase().includes('min'));
      const salaryMaxField =
        allFields.find((f) => f.name === 'salaryMax') ??
        allFields.find((f) => f.label.toLowerCase().includes('max'));

      const title = titleField ? getEffectiveValue(titleField.id) : '';
      const location = locationField ? getEffectiveValue(locationField.id) : '';
      const summary = summaryField ? getEffectiveValue(summaryField.id) : '';
      const salaryMin = salaryMinField ? getEffectiveValue(salaryMinField.id) : '';
      const salaryMax = salaryMaxField ? getEffectiveValue(salaryMaxField.id) : '';

      const description =
        summary || 'See job details in the posting. (Created from wizard config)';

      const salary =
        salaryMin || salaryMax ? `${salaryMin || ''} - ${salaryMax || ''}`.trim() : '';

      const formData: Record<string, string> = {};
      for (const f of allFields) {
        formData[f.id] = getEffectiveValue(f.id);
        for (const sub of f.subFields ?? []) {
          formData[sub.id] = getEffectiveValue(sub.id);
        }
      }

      const payload: {
        title: string;
        description: string;
        location?: string;
        salary?: string;
        isActive?: boolean;
        formData?: Record<string, string>;
      } = {
        title,
        description,
        formData,
      };

      if (locationField && location) {
        payload.location = location;
      }

      if (salary) {
        payload.salary = salary;
      }

      payload.isActive = mode === 'post';

      await api.jobs.create(payload);

      router.push('/employer/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setLoading(false);
    }
  }

  function handleSecondary() {
    if (currentStepIndex === 0) {
      router.push('/employer/dashboard');
      return;
    }
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  }

  return (
    <div className="space-y-6">
      <Link href="/employer/dashboard" className="text-sm text-slate-600 hover:underline">
        ← Back to dashboard
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-slate-900">{config.formTitle}</h1>
        <p className="mt-1 text-sm text-slate-600">{config.formDescription}</p>
        {configLoading && (
          <p className="mt-1 text-xs text-slate-500">Loading form layout…</p>
        )}
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        {/* Step header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Step {currentStepIndex + 1} of {config.steps.length}
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">{currentStep.name}</h2>
          </div>
          <div className="flex gap-2 text-xs text-slate-500">
            {config.steps.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 w-8 rounded-full ${
                  idx === currentStepIndex ? 'bg-brand-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        {/* Fields */}
        <div className="mt-4 space-y-4">
          {currentStep.fields.map((field) => {
            const renderField = (f: WizardField, isSub = false) => {
              const value = values[f.id] ?? '';
              const baseLabelClasses = isSub
                ? 'block text-[11px] font-medium text-slate-700'
                : 'block text-xs font-medium text-slate-700';
              const inputClasses = isSub
                ? 'mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'
                : 'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

              if (f.type === 'textarea' || f.type === 'richtext') {
                return (
                  <div key={f.id} className="space-y-1">
                    <label htmlFor={f.id} className={baseLabelClasses}>
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      id={f.id}
                      name={f.id}
                      value={value}
                      onChange={(e) => updateValue(f.id, e.target.value)}
                      rows={f.type === 'richtext' ? (isSub ? 4 : 6) : isSub ? 3 : 4}
                      className={inputClasses}
                      placeholder={f.placeholder}
                    />
                    {f.note && (
                      <p className="text-[11px] text-slate-500">{f.note}</p>
                    )}
                    {f.reminder && (
                      <p className="text-[11px] text-red-500">{f.reminder}</p>
                    )}
                  </div>
                );
              }

              if ((f.type === 'select' || f.type === 'multiselect') && (f.options ?? []).length > 0) { 
                const sourceOptions = f.options ?? []; 
 
                // Unified behavior for select and multiselect fields: 
                // - User types into the input to filter choices. 
                // - Matching choices are shown in a small dropdown. 
                const isMulti = f.type === 'multiselect'; 
                const queryKey = `${f.id}__query`; 
                const rawSelected = (values[f.id] ?? value ?? '').trim(); 
                const selectedSet = isMulti 
                  ? new Set( 
                      rawSelected 
                        .split(',') 
                        .map((v) => v.trim()) 
                        .filter(Boolean), 
                    ) 
                  : new Set<string>(); 
                const query = (values[queryKey] ?? '').trim(); 
                const matchingOptions = query 
                  ? sourceOptions.filter((opt) => 
                      opt.toLowerCase().includes(query.toLowerCase()), 
                    ) 
                  : []; 
                const showMatches = query.length > 0 && matchingOptions.length > 0; 
                const showNoMatches = query.length > 0 && matchingOptions.length === 0; 
 
                const inputValue = isMulti ? query : rawSelected; 
 
                const toggleMultiOption = (opt: string) => { 
                  const next = new Set(selectedSet); 
                  if (next.has(opt)) next.delete(opt); 
                  else next.add(opt); 
                  const joined = Array.from(next).join(', '); 
                  updateValue(f.id, joined); 
                }; 
 
                return ( 
                  <div key={f.id} className="space-y-1"> 
                    <label htmlFor={f.id} className={baseLabelClasses}> 
                      {f.label} {f.required && <span className="text-red-500">*</span>} 
                    </label> 
                    <input 
                      id={f.id} 
                      name={f.id} 
                      type="text" 
                      value={inputValue} 
                      onChange={(e) => { 
                        const next = e.target.value; 
                        if (isMulti) { 
                          updateValue(queryKey, next); 
                        } else { 
                          updateValue(f.id, next); 
                          updateValue(queryKey, next); 
                        } 
                      }} 
                      placeholder={f.placeholder || 'Type to search choices…'} 
                      className={inputClasses} 
                      autoComplete="off" 
                    /> 
                    {showMatches && ( 
                      <div className="mt-1 max-h-40 overflow-auto rounded-md border border-slate-200 bg-white text-xs shadow-sm"> 
                        {matchingOptions.map((opt) => ( 
                          <button 
                            key={opt} 
                            type="button" 
                            onClick={() => { 
                              if (isMulti) { 
                                toggleMultiOption(opt); 
                              } else { 
                                updateValue(f.id, opt); 
                              } 
                              // Clear the query so the suggestions hide after selection 
                              updateValue(queryKey, ''); 
                            }} 
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50" 
                          > 
                            {isMulti && ( 
                              <input 
                                type="checkbox" 
                                checked={selectedSet.has(opt)} 
                                readOnly 
                                className="h-3 w-3 rounded border-slate-300 text-brand-600" 
                              /> 
                            )} 
                            <span>{opt}</span> 
                          </button> 
                        ))} 
                      </div> 
                    )} 
                    {showNoMatches && ( 
                      <p className="mt-1 text-[11px] text-slate-500"> 
                        No matching option found. 
                        {f.options?.includes('Other') && ( 
                          <> 
                            {' '} 
                            Select <span className="font-semibold">Other</span> in the 
                            choices to add a specific answer. 
                          </> 
                        )} 
                      </p> 
                    )} 
                    {isMulti && rawSelected && ( 
                      <p className="mt-1 text-[11px] text-slate-500"> 
                        Selected: {rawSelected} 
                      </p> 
                    )} 
                    {f.note && ( 
                      <p className="mt-1 text-[11px] text-slate-500">{f.note}</p> 
                    )} 
                    {f.reminder && ( 
                      <p className="mt-1 text-[11px] text-red-500">{f.reminder}</p> 
                    )} 
                    {!isMulti && f.options?.includes('Other') && value === 'Other' && ( 
                      <div className="mt-2"> 
                        <label 
                          htmlFor={`${f.id}__other`} 
                          className="block text-[11px] font-medium text-slate-600" 
                        > 
                          Please specify 
                        </label> 
                        <input 
                          id={`${f.id}__other`} 
                          value={values[`${f.id}__other`] ?? ''} 
                          onChange={(e) => 
                            updateValue(`${f.id}__other`, e.target.value) 
                          } 
                          type="text" 
                          className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" 
                        /> 
                      </div> 
                    )} 
                  </div> 
                ); 
              }

              if (f.type === 'radio' && (f.options ?? []).length > 0) {
                return (
                  <div key={f.id} className="space-y-1">
                    <p className={baseLabelClasses}>
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs">
                      {(f.options ?? []).map((opt) => (
                        <label key={opt} className="inline-flex items-center gap-1">
                          <input
                            type="radio"
                            name={f.id}
                            value={opt}
                            checked={value === opt}
                            onChange={() => updateValue(f.id, opt)}
                            className="h-3 w-3 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {f.options?.includes('Other') && value === 'Other' && (
                      <div className="mt-1">
                        <label
                          htmlFor={`${f.id}__other`}
                          className="block text-[11px] font-medium text-slate-600"
                        >
                          Please specify
                        </label>
                        <input
                          id={`${f.id}__other`}
                          value={values[`${f.id}__other`] ?? ''}
                          onChange={(e) => updateValue(`${f.id}__other`, e.target.value)}
                          type="text"
                          className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    )}
                  </div>
                );
              }

              if (f.type === 'checkbox' && (f.options ?? []).length > 0) {
                const selected = new Set(
                  value
                    .split(',')
                    .map((v) => v.trim())
                    .filter(Boolean),
                );
                const minSel = f.type === 'multiselect' ? Math.max(1, f.minSelections ?? 1) : 0;

                function toggleOption(opt: string) {
                  const next = new Set(selected);
                  if (next.has(opt)) next.delete(opt);
                  else next.add(opt);
                  updateValue(f.id, Array.from(next).join(', '));
                }

                return (
                  <div key={f.id} className="space-y-1">
                    <p className={baseLabelClasses}>
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                      {f.type === 'multiselect' && minSel > 0 && (
                        <span className="ml-1 text-[11px] font-normal text-slate-500">
                          (select at least {minSel})
                        </span>
                      )}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs">
                      {(f.options ?? []).map((opt) => (
                        <label key={opt} className="inline-flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={selected.has(opt)}
                            onChange={() => toggleOption(opt)}
                            className="h-3 w-3 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {f.note && (
                      <p className="mt-1 text-[11px] text-slate-500">{f.note}</p>
                    )}
                    {f.reminder && (
                      <p className="mt-1 text-[11px] text-red-500">{f.reminder}</p>
                    )}
                  </div>
                );
              }

              if (f.type === 'range') {
                const rangeParts = (value || '').split(/\s*-\s*/).map((s) => s.trim().replace(/,/g, ''));
                const minVal = rangeParts[0] ?? '';
                const maxVal = rangeParts[1] ?? '';
                const updateRange = (newMin: string, newMax: string) => {
                  const minSanitized = newMin.replace(/[^\d]/g, '');
                  const maxSanitized = newMax.replace(/[^\d]/g, '');
                  if (!minSanitized && !maxSanitized) {
                    updateValue(f.id, '');
                  } else {
                    updateValue(f.id, `${minSanitized} - ${maxSanitized}`);
                  }
                };
                return (
                  <div key={f.id} className="space-y-1">
                    <label className={baseLabelClasses}>
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={minVal}
                        onChange={(e) => updateRange(e.target.value, maxVal)}
                        placeholder="Min (e.g. 23000)"
                        className={inputClasses}
                        aria-label={`${f.label} minimum`}
                      />
                      <span className="text-slate-400">–</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={maxVal}
                        onChange={(e) => updateRange(minVal, e.target.value)}
                        placeholder="Max (e.g. 30000)"
                        className={inputClasses}
                        aria-label={`${f.label} maximum`}
                      />
                    </div>
                    {f.note && (
                      <p className="mt-1 text-[11px] text-slate-500">{f.note}</p>
                    )}
                    {f.reminder && (
                      <p className="mt-1 text-[11px] text-red-500">{f.reminder}</p>
                    )}
                  </div>
                );
              }

              const isNumber = f.type === 'number';
              const isFile = f.type === 'file';
              const isLink = f.type === 'link';
              const isEmail = f.type === 'email';

              if (isFile) {
                return (
                  <div key={f.id} className="space-y-1">
                    <label htmlFor={f.id} className={baseLabelClasses}>
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id={f.id}
                      name={f.id}
                      type="file"
                      accept="*/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          updateValue(f.id, '');
                          return;
                        }
                        const maxBytes = 3 * 1024 * 1024; // 3MB
                        if (file.size > maxBytes) {
                          setError(`"${f.label}" must be at most 3MB.`);
                          // Clear the input value visually
                          e.target.value = '';
                          updateValue(f.id, '');
                          return;
                        }
                        // Store just the filename for now; backend upload can be added later.
                        setError('');
                        updateValue(f.id, file.name);
                      }}
                      className={inputClasses}
                    />
                    {value && (
                      <p className="text-[11px] text-slate-500">Selected file: {value}</p>
                    )}
                    {f.note && (
                      <p className="mt-1 text-[11px] text-slate-500">{f.note}</p>
                    )}
                    {f.reminder && (
                      <p className="mt-1 text-[11px] text-red-500">{f.reminder}</p>
                    )}
                  </div>
                );
              }

              return (
                <div key={f.id} className="space-y-1">
                  <label htmlFor={f.id} className={baseLabelClasses}>
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    id={f.id}
                    name={f.id}
                    value={value}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (isNumber) {
                        // Allow only digits; strip any non‑numeric characters
                        const sanitized = next.replace(/[^\d]/g, '');
                        updateValue(f.id, sanitized);
                      } else {
                        updateValue(f.id, next);
                      }
                    }}
                    type={isNumber ? 'number' : isLink ? 'url' : isEmail ? 'email' : 'text'}
                    min={isNumber ? 0 : undefined}
                    step={isNumber ? 1 : undefined}
                    inputMode={isNumber ? 'numeric' : undefined}
                    pattern={isLink ? 'https://.*' : undefined}
                    title={isLink ? 'Enter a valid URL starting with https://' : undefined}
                    className={inputClasses}
                    placeholder={f.placeholder}
                  />
                  {f.note && (
                    <p className="mt-1 text-[11px] text-slate-500">{f.note}</p>
                  )}
                  {f.reminder && (
                    <p className="mt-1 text-[11px] text-red-500">{f.reminder}</p>
                  )}
                </div>
              );
            };

            return (
              <div key={field.id} className="space-y-2">
                {renderField(field, false)}
                {/* Sub fields: shown only when parent has a value, and when the sub label matches that value (or label is empty). */}
                {(field.subFields ?? []).length > 0 && (values[field.id] ?? '').trim() && (
                  <div className="space-y-2 border-l border-dashed border-slate-200 pl-3">
                    {(field.subFields ?? [])
                      .filter((sub) => {
                        const parentVal = (values[field.id] ?? '').trim();
                        if (!parentVal) return false;
                        return !sub.label || sub.label === parentVal;
                      })
                      .map((sub) => renderField(sub, true))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSecondary}
            className="text-xs font-medium text-slate-600 hover:text-slate-800"
          >
            {currentStep.secondaryLabel || (currentStepIndex === 0 ? 'Cancel' : 'Back')}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handlePrimary('draft')}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save as draft'}
            </button>
            <button
              type="button"
              onClick={() => handlePrimary('post')}
              disabled={loading}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Publishing…' : currentStep.primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
