// File: app/api/send-invite/route.ts

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST handler
export async function POST(req: Request) {
  try {
    const { to, eventTitle, inviteType, inviteLink, inviterName } =
      await req.json();

    if (!to || !eventTitle || !inviteLink || !inviterName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let subject = "";
    let html = "";

    if (inviteType === "team") {
      subject = `You’ve Been Added to the Team for ${eventTitle}!`;
      html = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: auto; background: #111; color: #f0f0f0; padding: 40px; border-radius: 12px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: 'Fugaz One', sans-serif; color: #facc15; font-size: 36px; letter-spacing: 4px; text-transform: uppercase; filter: drop-shadow(0 0 8px #facc15);">
            ObcyFest 4.0
          </h1>
          <p style="color: #ccc; font-size: 14px; letter-spacing: 1px; margin-top: 5px;">Mini Tech Fest for Engineering Wizards ⚡</p>
        </div>
        
        <div style="padding: 25px; background: #1c1c1c; border-radius: 10px; border: 1px solid #333;">
          <h2 style="font-size: 24px; color: #fff; margin-bottom: 20px;">Great News! 🎉</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>${inviterName}</strong> has officially added you to their team for the event 
            <span style="color: #facc15; font-weight: 700;">${eventTitle}</span>!
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            Get ready to collaborate, compete, and showcase your skills. Your team is counting on you, and the adventure begins now!
          </p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${inviteLink}" 
              style="background: #facc15; color: #111; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; transition: all 0.2s;">
              🚀 View Team Details
            </a>
          </div>
          <p style="font-size: 14px; color: #aaa; margin-top: 20px; text-align: center;">
            Let’s make this fest unforgettable. Good luck! ✨
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
          <p>&copy; 2025 ObcyFest. All Rights Reserved.</p>
          <p>Fuel your curiosity. Hack your limits. 🚀</p>
        </div>
      </div>
      `;
    } else if (inviteType === "individual") {
      subject = `Your Spot is Reserved for ${eventTitle}! 🎉`;
      html = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: auto; background: #111; color: #f0f0f0; padding: 40px; border-radius: 12px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-family: 'Fugaz One', sans-serif; color: #34d399; font-size: 36px; letter-spacing: 4px; text-transform: uppercase; filter: drop-shadow(0 0 8px #34d399);">
            ObcyFest 4.0
          </h1>
          <p style="color: #ccc; font-size: 14px; letter-spacing: 1px; margin-top: 5px;">Mini Tech Fest for Engineering Wizards ⚡</p>
        </div>
        
        <div style="padding: 25px; background: #1c1c1c; border-radius: 10px; border: 1px solid #333;">
          <h2 style="font-size: 24px; color: #fff; margin-bottom: 20px;">Welcome Aboard! 🎊</h2>
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>${inviterName}</strong> has invited you to participate in 
            <span style="color: #34d399; font-weight: 700;">${eventTitle}</span>.
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            This is your official confirmation. Get ready to compete, learn, and experience the thrill of ObcyFest 4.0. 🚀
          </p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${inviteLink}" 
              style="background: #34d399; color: #111; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; transition: all 0.2s;">
              🎟️ View Your Registration
            </a>
          </div>
          <p style="font-size: 14px; color: #aaa; margin-top: 20px; text-align: center;">
            We can’t wait to see you at the fest. All the best! ✨
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
          <p>&copy; 2025 ObcyFest. All Rights Reserved.</p>
          <p>Ignite your passion. Show your skills. 🌟</p>
        </div>
      </div>
      `;
    }

    const mailOptions = {
      from: `"${inviterName}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Mail Sent to ${to}`);
    return NextResponse.json({ success: true, message: "Invitation sent!" });
  } catch (err: any) {
    console.error("Error sending mail:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
