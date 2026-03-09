'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { api, getToken, setToken, getAvatarUrl, getDisplayName, type User } from '@/lib/api';

const EMPLOYER_HOME = '/employer/dashboard';

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}
function IconClipboard({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  );
}
function IconDocument({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
function IconCog({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.655.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.654-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v3.75M15.75 9L12 12.75m3.75-3.75L12 12.75m-8.25 3.75h10.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25h10.5" />
    </svg>
  );
}
function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}
function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [jobPostOpen, setJobPostOpen] = useState(false);

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
    if (user.role !== 'employer') {
      if (user.role === 'admin') router.replace('/dashboard/admin');
      else if (user.role === 'employee') router.replace('/employee/dashboard');
      else router.replace('/login');
    }
  }, [user, ready, router]);

  function logout() {
    setToken(null);
    router.replace('/');
  }

  if (!ready || !user || user.role !== 'employer') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const navItems = [
    { href: EMPLOYER_HOME, label: 'Dashboard', icon: IconDashboard },
    {
      label: 'Job Post',
      icon: IconClipboard,
      children: [
        { href: '/employer/listed', label: 'Listed', icon: IconClipboard },
        { href: '/employer/drafted', label: 'Drafted', icon: IconDocument },
      ],
    },
    { href: '/employer/settings', label: 'Account Settings', icon: IconCog },
  ];

  const isActive = (href: string) =>
    href === EMPLOYER_HOME
      ? pathname === EMPLOYER_HOME || pathname.startsWith(EMPLOYER_HOME + '/')
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href={EMPLOYER_HOME} className="font-semibold text-slate-900">
            JobBoard
          </Link>
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
        </div>
      </header>

      <div className="flex min-h-screen w-full">
        <aside
          className={`relative fixed inset-y-0 left-0 z-30 flex transform flex-col border-r border-neutral-200 bg-white shadow-sm transition-[width] duration-200 md:static md:sticky md:top-0 md:h-screen md:translate-x-0 md:overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } ${sidebarCollapsed ? 'w-[72px] md:w-[72px]' : 'w-64'} px-0`}
        >
          {/* Logo / Brand */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-100 px-4">
            <Link
              href={EMPLOYER_HOME}
              className="flex min-w-0 items-center gap-3 overflow-hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-white">
                <IconDashboard className="h-5 w-5" />
              </div>
              {!sidebarCollapsed && (
                <span className="truncate text-base font-semibold text-black">JobBoard</span>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 md:hidden"
              aria-label="Close navigation"
            >
              ✕
            </button>
          </div>

          {/* Collapse button - desktop */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="absolute -right-3 top-20 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-black shadow-sm hover:bg-neutral-50 md:flex"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <IconChevronRight className="h-3.5 w-3.5" />
            ) : (
              <IconChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>

          {/* MENU section */}
          <div className="flex-1 overflow-y-auto py-4">
            {!sidebarCollapsed && (
              <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Menu
              </p>
            )}
            <nav className="mt-3 space-y-0.5 px-3">
              {navItems.map((item) => {
                if ((item as { children?: unknown }).children) {
                  const group = item as {
                    label: string;
                    icon: typeof IconDashboard;
                    children: { href: string; label: string; icon: typeof IconClipboard }[];
                  };
                  const anyActive = group.children.some((c) => isActive(c.href));
                  const open = anyActive || jobPostOpen;
                  const Icon = group.icon;
                  return (
                    <div key={group.label}>
                      <button
                        type="button"
                        onClick={() => setJobPostOpen((o) => !o)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          anyActive ? 'text-black' : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
                        } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                      >
                        <Icon className={`h-5 w-5 shrink-0 ${anyActive ? 'text-black' : 'text-neutral-500'}`} />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 text-left">{group.label}</span>
                            <span className="text-xs text-neutral-400">{open ? '▾' : '▸'}</span>
                          </>
                        )}
                      </button>
                      {open && !sidebarCollapsed && (
                        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-neutral-200 pl-3">
                          {group.children.map((child) => {
                            const active = isActive(child.href);
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                  active
                                    ? 'border-r-4 border-black bg-neutral-50 font-medium text-black'
                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
                                }`}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <ChildIcon className={`h-4 w-4 shrink-0 ${active ? 'text-black' : ''}`} />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                const simple = item as { href: string; label: string; icon: typeof IconDashboard };
                const active = isActive(simple.href);
                const Icon = simple.icon;
                return (
                  <Link
                    key={simple.href}
                    href={simple.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'border-r-4 border-black bg-neutral-50 text-black'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
                    } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-black' : 'text-neutral-500'}`} />
                    {!sidebarCollapsed && <span>{simple.label}</span>}
                  </Link>
                );
              })}
            </nav>

            <div className="my-3 border-t border-neutral-200" />

            <div className="px-3">
              <button
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-black ${
                  sidebarCollapsed ? 'justify-center px-2' : ''
                }`}
              >
                <IconLogout className="h-5 w-5 shrink-0 text-neutral-500" />
                {!sidebarCollapsed && <span>Log out</span>}
              </button>
            </div>

            {/* User information */}
            <div className="mt-4 border-t border-neutral-200 px-3 pt-4">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-3 rounded-lg bg-neutral-50 px-3 py-3">
                  <img
                    src={getAvatarUrl(user, 80)}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      if (!t.dataset.fallback) {
                        t.dataset.fallback = '1';
                        t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(user))}&size=80&background=333333&color=fff`;
                      }
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-black">
                      {getDisplayName(user)}
                    </p>
                    <p className="truncate text-xs text-neutral-500">{user.email ?? ''}</p>
                  </div>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="flex justify-center">
                  <img
                    src={getAvatarUrl(user, 80)}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      if (!t.dataset.fallback) {
                        t.dataset.fallback = '1';
                        t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(user))}&size=80&background=333333&color=fff`;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col">
          <div className="flex-1 px-4 py-6 md:py-8 md:pl-6 lg:pl-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
