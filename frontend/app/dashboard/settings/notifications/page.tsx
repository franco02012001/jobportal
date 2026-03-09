'use client';

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Notifications</h1>

      <main className="min-w-0 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-slate-900">Notification preferences</h2>
          <p className="text-sm text-slate-600">
            Manage how and when you receive notifications. More options will be available here.
          </p>
        </div>
      </main>
    </div>
  );
}
