import {
    betterAuth
} from 'better-auth';
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from '../drizzle/schema'
import { sendEmail } from './sendgrid';
import { db } from '@/drizzle/db';

export const auth = betterAuth({

    baseURL: process.env.APP_URL,
    allowedOrigins: [
        "http://localhost:3000",
        "https://nextjs-auth-dashboard-jz5tdhjus-yuyuayushs-projects.vercel.app/",
         // add this
    ],
    
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),


    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        async sendResetPassword({ user, url }) {
            const to = user?.email;
            const rawUrl = url;
            const token = rawUrl ? new URL(rawUrl).searchParams.get("token") || "N/A" : "N/A";

            try {
                await sendEmail(
                    to,
                    "Reset your password",
                    `<p>Hi ${user?.name ?? ""},</p>
                     <p>Please reset your password by clicking the link below:</p>
                     <a href="${rawUrl}">Reset Password</a>
                     <p>Or use this token: <strong>${token}</strong></p>`
                );
                console.info("sendResetPassword: email sendEmail() succeeded", { to, token });
            } catch (err) {
                console.error("sendResetPassword: sendEmail failed", { to, token, err });
            }
        },

    },

    emailVerification: {
        autoSignInAfterVerification: false,
        sendOnSignUp: true,
        async sendVerificationEmail({ user, url }) {
            const to = user?.email;
            await sendEmail(
                to,
                "Verify your email",
                `<p>Hi ${user?.name ?? ""},</p>
                 <p>Please verify your email by clicking the link below:</p>
                 <a href="${url}">Verify Email</a>
                 <p>Or copy this verification token:</p>
                 <p>After verification you'll be asked to set your password on the verification page.</p>`
            );
        }

    },


    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!

        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!
        }
    },

});