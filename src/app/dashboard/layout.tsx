'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Redirect to sign in page
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className=" ">
        {children}
      </main>
    </div>
  );
}