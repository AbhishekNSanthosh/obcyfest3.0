// File: app/api/send-invite/route.ts

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
    service: "gmail", // or "hotmail", "yahoo", etc. — or use SMTP host/port
    auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // app password (not raw password for Gmail!)
    },
});

// POST handler
export async function POST(req: Request) {
    try {
        const { to, eventTitle, inviteLink, inviterName } = await req.json();

        if (!to || !eventTitle || !inviteLink || !inviterName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const mailOptions = {
            from: `"${inviterName}" <${process.env.EMAIL_USER}>`,
            to,
            subject: `You're Invited to ${eventTitle}!`,
            html: `
            <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: auto; background: #111; color: #f0f0f0; padding: 40px; border-radius: 12px; border: 1px solid #333;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-family: 'Fugaz One', sans-serif; color: #facc15; font-size: 36px; letter-spacing: 4px; text-transform: uppercase; filter: drop-shadow(0 0 8px #facc15);">
      ObcyFest 4.0
    </h1>
    <p style="color: #ccc; font-size: 14px; letter-spacing: 1px; margin-top: 5px;">Mini Tech Fest for Engineering Wizards ⚡</p>
  </div>
  
  <div style="padding: 25px; background: #1c1c1c; border-radius: 10px; border: 1px solid #333;">
    <h2 style="font-size: 24px; color: #fff; margin-bottom: 20px;">Hey there! 🚀</h2>
    <p style="font-size: 16px; line-height: 1.6;">
      <strong>${inviterName}</strong> has summoned you to join their squad for the epic event 
      <span style="color: #facc15; font-weight: 700;">${eventTitle}</span>!
    </p>
    <p style="font-size: 16px; line-height: 1.6;">
      Get ready for tech challenges, fun competitions, and a ton of learning & networking. 
      Your mission, should you choose to accept it, is just one click away.
    </p>
    <div style="margin-top: 30px; text-align: center;">
      <a href="${inviteLink}" 
        style="background: #facc15; color: #111; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; transition: all 0.2s;">
        🎯 Accept the Challenge!
      </a>
    </div>
    <p style="font-size: 14px; color: #aaa; margin-top: 20px; text-align: center;">
      Or ignore if you’re too busy building your own robot 🤖
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
    <p>&copy; 2025 ObcyFest. All Rights Reserved.</p>
    <p>Fuel your curiosity. Hack your limits. 🚀</p>
  </div>
</div>

          `,
        };

        await transporter.sendMail(mailOptions);
console.log(`Mail Sent to ${inviterName}`)
        return NextResponse.json({ success: true, message: "Invitation sent!" });
    } catch (err: any) {
        console.error("Error sending mail:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}