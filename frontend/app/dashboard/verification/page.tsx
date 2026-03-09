'use client';

import { useState, useRef } from 'react';

const ACCEPT = 'image/*,.pdf';

export default function VerificationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    if (chosen) setFile(chosen);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    // TODO: call API to upload ID when backend is ready
    setTimeout(() => {
      setUploading(false);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }, 800);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Verification</h1>

      <main className="min-w-0 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">
            Upload government ID&apos;s or any valid ID&apos;s
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            Upload a clear photo or scan of your government-issued ID (e.g. passport, driver&apos;s license, national ID) or any valid ID for verification.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
              aria-label="Choose ID file"
            />
            {file && (
              <p className="text-sm text-slate-600">
                Selected: <span className="font-medium text-slate-800">{file.name}</span>
              </p>
            )}
            <button
              type="submit"
              disabled={!file || uploading}
              className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
