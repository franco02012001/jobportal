'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, getToken, setToken, getAvatarUrl, getDisplayName, type User } from '@/lib/api';

const PROFILE_DROPDOWN_HIDE_DELAY_MS = 3000;
const BROWSE_JOBS_SHOW_DELAY_MS = 500;
const BROWSE_JOBS_HIDE_DELAY_MS = 2000;

const EMPLOYEE_HOME = '/employee/dashboard';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [browseJobsOpen, setBrowseJobsOpen] = useState(false);
  const profileDropdownHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const browseJobsShowTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const browseJobsHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api.users
      .me()
      .then((u) => {
        setUser(u);
        setReady(true);
      })
      .catch(() => {
        setToken(null);
        router.replace('/login');
      });
  }, [router]);

  useEffect(() => {
    if (!user || !ready) return;
    if (user.role !== 'employee') {
      if (user.role === 'admin') router.replace('/dashboard/admin');
      else if (user.role === 'employer') router.replace('/employer/dashboard');
      else router.replace('/login');
    }
  }, [user, ready, router]);

  function logout() {
    setToken(null);
    router.replace('/');
  }

  function clearProfileDropdownHideTimeout() {
    if (profileDropdownHideTimeout.current) {
      clearTimeout(profileDropdownHideTimeout.current);
      profileDropdownHideTimeout.current = null;
    }
  }

  function scheduleProfileDropdownHide() {
    clearProfileDropdownHideTimeout();
    profileDropdownHideTimeout.current = setTimeout(() => {
      setProfileDropdownOpen(false);
      profileDropdownHideTimeout.current = null;
    }, PROFILE_DROPDOWN_HIDE_DELAY_MS);
  }

  function onProfileDropdownAreaEnter() {
    clearProfileDropdownHideTimeout();
    setProfileDropdownOpen(true);
  }

  function onProfileDropdownAreaLeave() {
    scheduleProfileDropdownHide();
  }

  function clearBrowseJobsTimeouts() {
    if (browseJobsShowTimeout.current) {
      clearTimeout(browseJobsShowTimeout.current);
      browseJobsShowTimeout.current = null;
    }
    if (browseJobsHideTimeout.current) {
      clearTimeout(browseJobsHideTimeout.current);
      browseJobsHideTimeout.current = null;
    }
  }

  function onBrowseJobsAreaEnter() {
    clearBrowseJobsTimeouts();
    browseJobsShowTimeout.current = setTimeout(() => {
      setBrowseJobsOpen(true);
      browseJobsShowTimeout.current = null;
    }, BROWSE_JOBS_SHOW_DELAY_MS);
  }

  function onBrowseJobsAreaLeave() {
    clearBrowseJobsTimeouts();
    browseJobsHideTimeout.current = setTimeout(() => {
      setBrowseJobsOpen(false);
      browseJobsHideTimeout.current = null;
    }, BROWSE_JOBS_HIDE_DELAY_MS);
  }

  if (!ready || !user || user.role !== 'employee') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6 lg:px-8">
          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              href={EMPLOYEE_HOME}
              className="mr-2 shrink-0 text-base font-semibold text-slate-900 hover:text-slate-700 sm:mr-4"
            >
              JOB PORTAL
            </Link>
            <Link
              href={EMPLOYEE_HOME}
              className="rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <div
              className="relative"
              onMouseEnter={onBrowseJobsAreaEnter}
              onMouseLeave={onBrowseJobsAreaLeave}
            >
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                aria-expanded={browseJobsOpen}
                aria-haspopup="true"
                onClick={() => {
                  clearBrowseJobsTimeouts();
                  setBrowseJobsOpen((open) => !open);
                }}
              >
                Browse jobs
                <span className="text-[10px] opacity-70">▾</span>
              </button>
              <div
                className="absolute left-0 top-full z-50 mt-1 min-w-[11rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                style={{
                  transition: 'opacity 0.5s ease, transform 0.5s ease, visibility 0.5s',
                  opacity: browseJobsOpen ? 1 : 0,
                  transform: browseJobsOpen ? 'translateY(0)' : 'translateY(-4px)',
                  visibility: browseJobsOpen ? 'visible' : 'hidden',
                  transitionDelay: browseJobsOpen ? '0ms' : '0ms',
                }}
                aria-hidden={!browseJobsOpen}
              >
                <Link
                  href="/jobs/remote"
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => { clearBrowseJobsTimeouts(); setBrowseJobsOpen(false); }}
                >
                  Remote Jobs
                </Link>
                <Link
                  href="/jobs/onsite"
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => { clearBrowseJobsTimeouts(); setBrowseJobsOpen(false); }}
                >
                  On-site Jobs
                </Link>
                <Link
                  href="/jobs/web3"
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => { clearBrowseJobsTimeouts(); setBrowseJobsOpen(false); }}
                >
                  Web3 Jobs
                </Link>
                <Link
                  href="/jobs/recommended"
                  className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  onClick={() => { clearBrowseJobsTimeouts(); setBrowseJobsOpen(false); }}
                >
                  Recommended Jobs
                </Link>
              </div>
            </div>
            <Link
              href="/companies"
              className="rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Companies
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden truncate text-sm font-medium text-slate-700 sm:inline" title={user.email ?? undefined}>
              {getDisplayName(user)}
            </span>
            <div
              className="relative"
              onMouseEnter={onProfileDropdownAreaEnter}
              onMouseLeave={onProfileDropdownAreaLeave}
            >
              <button
                type="button"
                className="flex rounded-full ring-2 ring-slate-200 transition hover:ring-slate-300"
                aria-label="Profile menu"
                aria-expanded={profileDropdownOpen}
                onClick={() => {
                  clearProfileDropdownHideTimeout();
                  setProfileDropdownOpen((open) => !open);
                }}
              >
                <img
                  src={getAvatarUrl(user, 96)}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    if (!t.dataset.fallback) {
                      t.dataset.fallback = '1';
                      t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name?.trim() || user.email?.split('@')[0] || 'User')}&size=96&background=6366f1&color=fff`;
                    }
                  }}
                />
              </button>
              <div
                className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                style={{
                  transition: 'opacity 0.5s ease, transform 0.5s ease, visibility 0.5s',
                  opacity: profileDropdownOpen ? 1 : 0,
                  transform: profileDropdownOpen ? 'translateY(0)' : 'translateY(-4px)',
                  visibility: profileDropdownOpen ? 'visible' : 'hidden',
                  transitionDelay: profileDropdownOpen ? '0ms' : '0ms',
                }}
                aria-hidden={!profileDropdownOpen}
              >
                <Link href="/dashboard/profile" className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" onClick={() => setProfileDropdownOpen(false)}>Profile Settings</Link>
                <Link href="/dashboard/settings" className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" onClick={() => setProfileDropdownOpen(false)}>Account Settings</Link>
                <Link href="/dashboard/settings/notifications" className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" onClick={() => setProfileDropdownOpen(false)}>Notifications</Link>
                <Link href="/dashboard/verification" className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" onClick={() => setProfileDropdownOpen(false)}>Verifications</Link>
                <Link href="/dashboard/resume" className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100" onClick={() => setProfileDropdownOpen(false)}>Resume</Link>
                <div className="my-1 border-t border-slate-200" aria-hidden="true" />
                <button type="button" onClick={() => { setProfileDropdownOpen(false); logout(); }} className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">Logout</button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 md:py-8 md:pl-6 lg:pl-8">
          {children}
        </div>
      </main>
    </div>
  );
}
