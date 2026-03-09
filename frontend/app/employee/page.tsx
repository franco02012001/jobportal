'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeHomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/employee/dashboard');
  }, [router]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
      Redirecting…
    </div>
  );
}
