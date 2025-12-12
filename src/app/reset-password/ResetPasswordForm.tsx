"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // extract token and email properly from query string
  const searchParams = useSearchParams();

  const token = searchParams.get("token") as string;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");

    if (!token) {
      setStatus("Invalid or missing token.");
      return;
    }
    if (!password || password.length < 8) {
      setStatus("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // include email so server receives token, email and newPassword
      await authClient.resetPassword({
        token,
        newPassword: password,
      });

      setStatus("Password reset successful. Redirecting...");
    } catch (err: unknown) {
      console.error("resetPassword error:", err);
      const msg = err instanceof Error ? err.message : "Failed to reset password";
      setStatus(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="max-w-md mx-auto mt-20 space-y-4" onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="New password"
        className="border rounded px-3 py-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />

      <button
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      {!token && (
        <p className="text-sm text-red-600">
          No token found in URL. Paste your token into the link you received or request a new reset.
        </p>
      )}

      {status && <p className="text-sm mt-2">{status}</p>}
    </form>
  );
}