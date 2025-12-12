export async function resetPassword(token: string, newPassword: string) {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      newPassword,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to reset password");
  }

  return res.json();
}
