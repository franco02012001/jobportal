'use client';

import { useEffect, useState, useRef } from 'react';
import { api, type User, type ProfessionalInfoEntry, type EducationEntry, type SkillEntry } from '@/lib/api';

const DOC_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

type ResumeMode = 'manual' | 'upload';

export default function ResumePage() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<ResumeMode>('manual');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual form state (simplified resume template)
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState<ProfessionalInfoEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [skills, setSkills] = useState<SkillEntry[]>([]);

  useEffect(() => {
    api.users
      .me()
      .then((u) => {
        setUser(u);
        setSummary(u.bio ?? '');
        setExperience(u.professionalInfo ?? []);
        setEducation(u.education ?? []);
        setSkills(u.skills ?? []);
      })
      .catch((err) => console.error(err));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setError('');
    setUploading(true);
    try {
      const updated = await api.users.uploadResume(file);
      setUser(updated);
      setMessage('Resume uploaded. We may use it to pre-fill the form below for you to review.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSaveManual(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSaving(true);
    try {
      await api.users.updateMe({
        bio: summary || undefined,
        professionalInfo: experience,
        education,
        skills,
      });
      setMessage('Resume form saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function addExperience() {
    setExperience((prev) => [...prev, { title: '', organization: '', startDate: null, endDate: null, description: null }]);
  }
  function removeExperience(i: number) {
    setExperience((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addEducation() {
    setEducation((prev) => [...prev, { schoolUniversity: '', degree: null, fieldOfStudy: null, startYear: null, endYear: null, gpa: null, honorsAwards: null }]);
  }
  function removeEducation(i: number) {
    setEducation((prev) => prev.filter((_, idx) => idx !== i));
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Resume</h1>

      <main className="min-w-0 space-y-6">
        {message && (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        {/* Choice: Manual form or Upload file */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">How do you want to add your resume?</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-slate-200 bg-slate-50/50 px-4 py-3 transition hover:border-slate-300 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50">
              <input
                type="radio"
                name="resume-mode"
                value="manual"
                checked={mode === 'manual'}
                onChange={() => setMode('manual')}
                className="h-4 w-4 text-indigo-600"
              />
              <span className="text-sm font-medium text-slate-800">Manually fill out form</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-slate-200 bg-slate-50/50 px-4 py-3 transition hover:border-slate-300 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50">
              <input
                type="radio"
                name="resume-mode"
                value="upload"
                checked={mode === 'upload'}
                onChange={() => setMode('upload')}
                className="h-4 w-4 text-indigo-600"
              />
              <span className="text-sm font-medium text-slate-800">Upload file (PDF or DOC)</span>
            </label>
          </div>
        </section>

        {mode === 'upload' && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-medium text-slate-900">Upload resume</h2>
            <p className="mb-4 text-sm text-slate-600">
              Upload a PDF or Word document. It will be stored as your resume and may be used to pre-fill the form below for you to review.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={DOC_ACCEPT}
              onChange={handleUpload}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-200"
              aria-label="Choose resume file"
            />
            {uploading && <p className="mt-2 text-sm text-slate-500">Uploading…</p>}
            {user.resumeUrl && (
              <p className="mt-3 text-sm text-slate-600">
                Current file: <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline">View resume</a>
              </p>
            )}
          </section>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleSaveManual} className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-slate-900">Professional summary</h2>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                placeholder="Brief overview of your experience and goals…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-slate-900">Work experience</h2>
                <button type="button" onClick={addExperience} className="text-sm font-medium text-indigo-600 hover:underline">
                  Add entry
                </button>
              </div>
              {experience.length === 0 ? (
                <p className="text-sm text-slate-500">No experience added yet.</p>
              ) : (
                <ul className="space-y-4">
                  {experience.map((entry, i) => (
                    <li key={i} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={entry.title ?? ''}
                          onChange={(e) => {
                            const next = [...experience];
                            next[i] = { ...next[i], title: e.target.value };
                            setExperience(next);
                          }}
                          placeholder="Job title"
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          value={entry.organization ?? ''}
                          onChange={(e) => {
                            const next = [...experience];
                            next[i] = { ...next[i], organization: e.target.value };
                            setExperience(next);
                          }}
                          placeholder="Company"
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={entry.startDate ?? ''}
                          onChange={(e) => {
                            const next = [...experience];
                            next[i] = { ...next[i], startDate: e.target.value || null };
                            setExperience(next);
                          }}
                          placeholder="Start date"
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          value={entry.endDate ?? ''}
                          onChange={(e) => {
                            const next = [...experience];
                            next[i] = { ...next[i], endDate: e.target.value || null };
                            setExperience(next);
                          }}
                          placeholder="End date"
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <textarea
                        value={entry.description ?? ''}
                        onChange={(e) => {
                          const next = [...experience];
                          next[i] = { ...next[i], description: e.target.value || null };
                          setExperience(next);
                        }}
                        placeholder="Description"
                        rows={2}
                        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <button type="button" onClick={() => removeExperience(i)} className="mt-2 text-sm text-red-600 hover:underline">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-slate-900">Education</h2>
                <button type="button" onClick={addEducation} className="text-sm font-medium text-indigo-600 hover:underline">
                  Add entry
                </button>
              </div>
              {education.length === 0 ? (
                <p className="text-sm text-slate-500">No education added yet.</p>
              ) : (
                <ul className="space-y-4">
                  {education.map((entry, i) => (
                    <li key={i} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                      <input
                        type="text"
                        value={entry.schoolUniversity ?? ''}
                        onChange={(e) => {
                          const next = [...education];
                          next[i] = { ...next[i], schoolUniversity: e.target.value };
                          setEducation(next);
                        }}
                        placeholder="School / University"
                        className="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={entry.degree ?? ''}
                          onChange={(e) => {
                            const next = [...education];
                            next[i] = { ...next[i], degree: e.target.value || null };
                            setEducation(next);
                          }}
                          placeholder="Degree"
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          value={entry.fieldOfStudy ?? ''}
                          onChange={(e) => {
                            const next = [...education];
                            next[i] = { ...next[i], fieldOfStudy: e.target.value || null };
                            setEducation(next);
                          }}
                          placeholder="Field of study"
                          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={entry.startYear ?? ''}
                          onChange={(e) => {
                            const next = [...education];
                            next[i] = { ...next[i], startYear: e.target.value || null };
                            setEducation(next);
                          }}
                          placeholder="Start year"
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          value={entry.endYear ?? ''}
                          onChange={(e) => {
                            const next = [...education];
                            next[i] = { ...next[i], endYear: e.target.value || null };
                            setEducation(next);
                          }}
                          placeholder="End year"
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <button type="button" onClick={() => removeEducation(i)} className="mt-2 text-sm text-red-600 hover:underline">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-slate-900">Skills</h2>
              <p className="mb-2 text-sm text-slate-600">Enter skills (comma-separated or one per line).</p>
              <textarea
                value={skills.map((s) => s.skills ?? '').join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
                  setSkills(lines.map((skills) => ({ skills, skillLevel: null })));
                }}
                rows={4}
                placeholder="e.g. JavaScript, React, Node.js"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save resume'}
              </button>
            </div>
          </form>
        )}

        {mode === 'upload' && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-medium text-slate-900">Or fill the form manually</h2>
            <p className="text-sm text-slate-600">
              You can also use the manual form to build your resume. Switch to &quot;Manually fill out form&quot; above to add summary, experience, education, and skills.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
