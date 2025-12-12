'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Chat } from '@/components/chat';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  


  useEffect(() => {
    if (!isPending) {
        console.log('session', session);
      if (!session) {
        router.push('/auth/signin');
      }
    }
  }, [router,session,isPending]);



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {session?.user?.name || 'User'}!</h1>
        <p className="text-gray-600 mt-2">
          This is your personalized dashboard with important information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your account overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5</p>
            <p className="text-sm text-gray-500">Active items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Your performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">92%</p>
            <p className="text-sm text-gray-500">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Your pending tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-gray-500">Tasks remaining</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent activity log</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex justify-between py-2 border-b">
              <span>Project created</span>
              <span className="text-gray-500">Today</span>
            </li>
            <li className="flex justify-between py-2 border-b">
              <span>Profile updated</span>
              <span className="text-gray-500">Yesterday</span>
            </li>
            <li className="flex justify-between py-2 border-b">
              <span>Email verified</span>
              <span className="text-gray-500">2 days ago</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      <Chat/>
    </div>
  );
}