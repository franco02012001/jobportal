'use client';

import { useEffect, useState } from 'react';
import { api, getToken, setToken, type User } from '@/lib/api';
import { TopNavBar } from '@/app/components/TopNavBar';

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    api.users
      .me()
      .then(setUser)
      .catch(() => {
        setToken(null);
        setUser(null);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNavBar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
