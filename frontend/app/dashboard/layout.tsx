'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { api, getToken, setToken, getAvatarUrl, getDisplayName, type User } from '@/lib/api';

const PROFILE_DROPDOWN_SHOW_MS = 500;
const PROFILE_DROPDOWN_HIDE_DELAY_MS = 3000;
const BROWSE_JOBS_SHOW_DELAY_MS = 500;
const BROWSE_JOBS_HIDE_DELAY_MS = 2000;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobPostOpen, setJobPostOpen] = useState(false);
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
    const path = pathname ?? '';
    if (user.role === 'employer' && (path.startsWith('/dashboard/employer') || path === '/dashboard/employer')) {
      const rest = path.replace(/^\/dashboard\/employer\/?/, '') || 'dashboard';
      router.replace(rest === 'dashboard' ? '/employer/dashboard' : `/employer/${rest}`);
      return;
    }
    const allowed =
      path.startsWith('/dashboard/settings') ||
      path.startsWith('/dashboard/profile') ||
      path.startsWith('/dashboard/verification') ||
      path.startsWith('/dashboard/resume') ||
      (user.role === 'admin' && path.startsWith('/dashboard/admin')) ||
      (user.role === 'employer' && (path.startsWith('/dashboard/settings') || path.startsWith('/dashboard/profile') || path.startsWith('/dashboard/verification') || path.startsWith('/dashboard/resume'))) ||
      (user.role === 'employee' && path.startsWith('/dashboard/employee'));
    if (!allowed) {
      if (user.role === 'admin') router.replace('/dashboard/admin');
      else if (user.role === 'employer') router.replace('/employer/dashboard');
      else router.replace('/employee/dashboard');
    }
  }, [user, ready, pathname, router]);

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

  function dashboardHomeForRole(u: User) {
    if (u.role === 'admin') return '/dashboard/admin';
    if (u.role === 'employer') return '/employer/dashboard';
    return '/employee/dashboard';
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const homeHref = dashboardHomeForRole(user);

  const navItems =
    user.role === 'employer'
      ? [
          { href: '/employer/dashboard', label: 'Dashboard' },
          {
            label: 'Job Post',
            children: [
              { href: '/employer/listed', label: 'Listed' },
              { href: '/employer/drafted', label: 'Drafted' },
            ],
          },
          { href: '/dashboard/settings', label: 'Settings' },
        ]
      : user.role === 'employee'
      ? [
          { href: '/employee/dashboard', label: 'Dashboard' },
          { href: '/jobs', label: 'Browse jobs' },
          { href: '/dashboard/settings', label: 'Settings' },
        ]
      : [
          { href: '/dashboard/admin', label: 'Overview' },
          { href: '/dashboard/admin/custom-listing', label: 'Custom listing' },
          { href: '/jobs', label: 'All jobs' },
          { href: '/dashboard/settings', label: 'Settings' },
        ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <header className="border-b border-slate-200 bg-white shadow-sm md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href={homeHref} className="font-semibold text-slate-900">
            JobBoard
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/settings"
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-200 ring-2 ring-white"
              aria-label="Profile"
            >
              <img
                src={user ? getAvatarUrl(user, 64) : 'https://ui-avatars.com/api/?name=User&size=64&background=6366f1&color=fff'}
                alt=""
                className="h-8 w-8 object-cover"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  if (!t.dataset.fallback && user) {
                    t.dataset.fallback = '1';
                    t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name?.trim() || user?.email?.split('@')[0] || 'User')}&size=64&background=6366f1&color=fff`;
                  }
                }}
              />
            </Link>
            {user.role !== 'employee' && (
              <button
                onClick={() => setSidebarOpen((o) => !o)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                aria-label="Toggle navigation"
              >
                <span className="h-3 w-3 space-y-0.5">
                  <span className="block h-0.5 w-3 rounded bg-slate-700" />
                  <span className="block h-0.5 w-3 rounded bg-slate-700" />
                  <span className="block h-0.5 w-3 rounded bg-slate-700" />
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-screen w-full">
        {/* Sidebar – hidden for job seekers (employees) */}
        {user.role !== 'employee' && (
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-slate-200 bg-white px-4 py-5 shadow-sm transition-transform md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between gap-2 px-1 md:px-0">
            <div>
              <Link href={homeHref} className="text-base font-semibold text-slate-900">
                JobBoard
              </Link>
              <p className="text-xs text-slate-500 capitalize">{user.role} workspace</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 md:hidden"
              aria-label="Close navigation"
            >
              ✕
            </button>
          </div>

          <nav className="mt-6 space-y-2 text-sm">
            {navItems.map((item) => {
              if ((item as any).children) {
                const group = item as { label: string; children: { href: string; label: string }[] };
                const anyActive = group.children.some((child) =>
                  pathname === child.href || pathname.startsWith(child.href + '/'),
                );
                const open = anyActive || jobPostOpen;

                return (
                  <div key={group.label}>
                    <button
                      type="button"
                      onClick={() => setJobPostOpen((o) => !o)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                        anyActive ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      <span>{group.label}</span>
                      <span className="text-[10px]">
                        {open ? '▾' : '▸'}
                      </span>
                    </button>
                    {open && (
                      <div className="ml-1 mt-1 space-y-1 border-l border-slate-200 pl-3">
                        {group.children.map((child) => {
                          const active =
                            pathname === child.href || pathname.startsWith(child.href + '/');
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                                active
                                  ? 'bg-slate-900 text-slate-50 shadow-sm'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const simple = item as { href: string; label: string };
              const active =
                simple.href === '/employer/dashboard'
                  ? pathname === '/employer/dashboard' || pathname.startsWith('/employer/dashboard/')
                  : simple.href === '/employee/dashboard'
                  ? pathname === '/employee/dashboard' || pathname.startsWith('/employee/dashboard/')
                  : pathname === simple.href || pathname.startsWith(simple.href + '/');
              return (
                <Link
                  key={simple.href}
                  href={simple.href}
                  className={`flex items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'bg-slate-900 text-slate-50 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span>{simple.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
            <button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              className="text-left text-slate-600 hover:text-slate-900"
            >
              Log out
            </button>
          </div>
        </aside>
        )}

        {/* Main content */}
        <main className="flex min-h-screen flex-1 flex-col">
          {/* Top nav bar */}
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6 lg:px-8">
            <nav className="flex items-center gap-1 sm:gap-4">
              <Link
                href={homeHref}
                className="mr-2 shrink-0 text-base font-semibold text-slate-900 hover:text-slate-700 sm:mr-4"
              >
                JOB PORTAL
              </Link>
              <Link
                href={homeHref}
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
                      onClick={() => {
                        clearBrowseJobsTimeouts();
                        setBrowseJobsOpen(false);
                      }}
                    >
                      Remote Jobs
                    </Link>
                    <Link
                      href="/jobs/onsite"
                      className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      onClick={() => {
                        clearBrowseJobsTimeouts();
                        setBrowseJobsOpen(false);
                      }}
                    >
                      On-site Jobs
                    </Link>
                    <Link
                      href="/jobs/web3"
                      className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      onClick={() => {
                        clearBrowseJobsTimeouts();
                        setBrowseJobsOpen(false);
                      }}
                    >
                      Web3 Jobs
                    </Link>
                    <Link
                      href="/jobs/recommended"
                      className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      onClick={() => {
                        clearBrowseJobsTimeouts();
                        setBrowseJobsOpen(false);
                      }}
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
              {user.role === 'employer' && (
                <>
                  <Link
                    href="/employer/listed"
                    className="rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    My listings
                  </Link>
                  <Link
                    href="/employer/new"
                    className="rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    Post job
                  </Link>
                </>
              )}
              {user.role === 'admin' && (
                <Link
                  href="/dashboard/admin/custom-listing"
                  className="rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  Custom listing
                </Link>
              )}
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
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Account Settings
                  </Link>
                  <Link
                    href="/dashboard/settings/notifications"
                    className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Notifications
                  </Link>
                  <Link
                    href="/dashboard/verification"
                    className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Verifications
                  </Link>
                  <Link
                    href="/dashboard/resume"
                    className="block px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Resume
                  </Link>
                  <div className="my-1 border-t border-slate-200" aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-6 md:py-8 md:pl-6 lg:pl-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
