'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/reset-password`,
      });
      console.info('forgetPassword result', result);

      setSuccess(true);
    } catch (err: any) {
      console.error('forgetPassword error', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Forgot Password?</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="bg-green-100 text-green-700 p-4 rounded-lg">
              <p className="font-medium">Check your email!</p>
              <p className="text-sm mt-1">
                We've sent a password reset link to {email}
              </p>
            </div>
            <Link href="/auth/signin">
              <Button className="w-full">Back to Sign In</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded text-sm">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </Button>
            <Link href="/auth/signin" className="block text-center text-sm underline">
              Back to Sign In
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
