import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, newPassword } = body;

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { message: "Missing required fields: token, email, newPassword" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Use better-auth's resetPassword method
    const response = await auth.api.resetPassword({
      body: JSON.stringify({
        token,
        newPassword,
      }),
      asResponse: true,
    } as any);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to reset password" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
