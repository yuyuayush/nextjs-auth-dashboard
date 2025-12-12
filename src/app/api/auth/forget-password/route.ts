import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, redirectURL } = body;

        if (!email) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            );
        }

        // Use better-auth's forgetPassword method
        const response = await auth.api.resetPassword({
            body: {
                email,
                redirectURL: redirectURL || `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
            },
            asResponse: true,
        } as any);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { message: errorData.message || "Failed to send reset email" },
                { status: response.status }
            );
        }

        return NextResponse.json(
            { message: "Reset email sent successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Forget password error:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
