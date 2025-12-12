import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold">Welcome to Auth Dashboard</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A complete authentication solution built with Next.js, shadcn/ui, and Tailwind CSS.
          Sign in to access your personalized dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href="/auth/signin">
            <Button size="lg" className="px-8">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline" className="px-8">
              Sign Up
            </Button>
          </Link>
        </div>
        
        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Authentication</h3>
            <p className="text-gray-600">
              Secure sign in and sign up functionality with form validation.
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
            <p className="text-gray-600">
              Personalized dashboard with key metrics and information.
            </p>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Responsive</h3>
            <p className="text-gray-600">
              Works seamlessly on all devices from mobile to desktop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}