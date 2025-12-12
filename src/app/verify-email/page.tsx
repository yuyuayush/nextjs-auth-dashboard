"use client";

import { Mail } from "lucide-react";

export default function VerifyEmailNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
        <Mail className="mx-auto mb-4 h-12 w-12 text-blue-600" />

        <h1 className="text-2xl font-semibold mb-2">
          Verify Your Email
        </h1>

        <p className="text-gray-600 mb-6">
          We’ve sent a verification link to your email.  
          Please check your inbox and click the link to activate your account.
        </p>

        <p className="text-sm text-gray-500">
          If you don’t see the email, check your spam folder or request a new verification link.
        </p>
      </div>
    </div>
  );
}
