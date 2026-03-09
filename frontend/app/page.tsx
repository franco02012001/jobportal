import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:max-w-6xl">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 ring-1 ring-brand-500/40">
              <span className="text-sm font-semibold text-brand-300">JB</span>
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-50">
              JobBoard
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="/jobs" className="hover:text-white">
              Browse jobs
            </Link>
            <a href="#how-it-works" className="hover:text-white">
              How it works
            </a>
            <a href="#roles" className="hover:text-white">
              For roles
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-1.5 text-sm font-medium text-slate-200 ring-1 ring-slate-600/60 hover:bg-slate-800/60 md:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-slate-950 shadow-md shadow-brand-500/40 hover:bg-brand-400"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 xl:max-w-5xl xl:pt-14">
        {/* Hero */}
        <section className="grid items-center gap-10 md:grid-cols-[1.35fr,1fr] md:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Hiring made simple for SMEs
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
              Find the right{' '}
              <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
                talent
              </span>{' '}
              or your next role.
            </h1>

            <p className="mt-5 max-w-xl text-sm text-slate-300 sm:text-base">
              JobBoard connects growing teams with motivated candidates. Post
              roles in minutes, discover curated jobs, and manage everything in
              a single, clean dashboard.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register?role=employer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-brand-500/40 hover:bg-brand-400"
              >
                I want to hire
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/register?role=employee"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/40 px-6 py-2.5 text-sm font-medium text-slate-100 hover:border-slate-500 hover:bg-slate-900"
              >
                I&apos;m looking for a job
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                No long forms — start in under 2 minutes.
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Role‑based dashboards for employers and job seekers.
              </div>
            </div>
          </div>

          {/* Right side visual */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-tr from-emerald-500/15 via-sky-500/5 to-transparent blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 items-center justify-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="font-medium text-slate-100">
                    Employer dashboard
                  </span>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                  Live preview
                </span>
              </div>

              <div className="space-y-3 p-4 text-xs text-slate-100 sm:text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-slate-300">
                      Open roles
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Overview of your active postings
                    </p>
                  </div>
                  <button className="rounded-full bg-brand-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-brand-400">
                    Post a job
                  </button>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>PRODUCT DESIGNER</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      New
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-50">
                    Senior Product Designer
                  </p>
                  <p className="text-xs text-slate-400">
                    Remote · Full‑time · ₱120k–₱180k
                  </p>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>ENGINEERING</span>
                    <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                      12 applicants
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-50">
                    Full‑stack Developer
                  </p>
                  <p className="text-xs text-slate-400">
                    Hybrid · Mid‑level · ₱90k–₱140k
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="mt-20 grid gap-8 border-t border-slate-800/80 pt-10 md:grid-cols-3"
        >
          <div className="md:col-span-1">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              How it works
            </h2>
            <p className="mt-3 text-lg font-medium text-slate-50">
              Three streamlined experiences for each role.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Whether you&apos;re hiring or applying, JobBoard keeps everything
              focused and easy to use.
            </p>
          </div>

          <div className="md:col-span-2 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Job Seekers
              </p>
              <p className="mt-2 text-sm font-medium text-slate-50">
                Discover curated roles
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Browse jobs by location, salary, and role. View clean job
                descriptions and apply from your dashboard.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                Employers
              </p>
              <p className="mt-2 text-sm font-medium text-slate-50">
                Post roles in minutes
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Create job posts, edit them anytime, and see all your roles from
                a simple, high‑contrast dashboard.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                Teams
              </p>
              <p className="mt-2 text-sm font-medium text-slate-50">
                Shared visibility
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Keep everyone aligned on open roles and status without adding
                extra tools.
              </p>
            </div>
          </div>
        </section>

        {/* Roles call‑to‑action */}
        <section
          id="roles"
          className="mt-20 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 sm:p-7 md:p-8"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-slate-800/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                For job seekers
              </p>
              <p className="mt-2 text-sm font-medium text-slate-50">
                Personal job feed
              </p>
              <p className="mt-2 text-xs text-slate-400">
                See the latest roles and quickly jump into details that actually
                matter.
              </p>
              <Link
                href="/register?role=employee"
                className="mt-3 inline-flex items-center text-xs font-medium text-emerald-300 hover:text-emerald-200"
              >
                Sign up as job seeker <span className="ml-1">→</span>
              </Link>
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-slate-800/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                For employers
              </p>
              <p className="mt-2 text-sm font-medium text-slate-50">
                Modern hiring workspace
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Centralize job posts, manage applicants (coming soon), and keep
                visibility under control.
              </p>
              <Link
                href="/register?role=employer"
                className="mt-3 inline-flex items-center text-xs font-medium text-sky-300 hover:text-sky-200"
              >
                Sign up as employer <span className="ml-1">→</span>
              </Link>
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-slate-800/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                For teams
              </p>
              <p className="mt-2 text-sm font-medium text-slate-50">
                Built for scale
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Simple enough for small teams, structured enough to grow with
                your hiring needs.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-800/80 pt-6 text-xs text-slate-500 sm:text-sm">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p>© {new Date().getFullYear()} JobBoard. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#how-it-works" className="hover:text-slate-300">
                How it works
              </a>
              <Link href="/jobs" className="hover:text-slate-300">
                Browse jobs
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
