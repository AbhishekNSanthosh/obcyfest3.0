import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password for Gmail
  },
});

export async function POST(req: Request) {
  try {
    const { inviterEmail, inviteeName, eventTitle, status } = await req.json();

    if (!inviterEmail || !inviteeName || !eventTitle || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let subject, html;

    if (status === 'accepted') {
      subject = `🎉 ${inviteeName} accepted your invite to ${eventTitle}!`;
      html = `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: auto; background: #1a1a1a; color: #f0f0f0; padding: 30px; border-radius: 12px; border: 1px solid #333;">
          <div style="text-align:center; margin-bottom:20px;">
            <h1 style="font-family:'Fugaz One', sans-serif; color:#dfff1b; font-size:28px; letter-spacing:2px; text-transform:uppercase; filter: drop-shadow(0 0 5px #dfff1b);">
              ObcyFest 4.0
            </h1>
          </div>
          <h2 style="font-size:22px; color:#fff;">Woohoo! <strong>${inviteeName}</strong> just accepted your invite 🚀</h2>
          <p style="font-size:16px; line-height:1.6;">
            Your teammate is ready to join the mission for <strong>${eventTitle}</strong>! Time to collaborate, code, and create some engineering magic.
          </p>
          <p style="font-size:16px; line-height:1.6;">
            Head to your <a href="http://localhost:3000/profile" style="color:#dfff1b; text-decoration:underline;">event dashboard</a> to see your team in action.
          </p>
          <div style="margin-top:30px; text-align:center;">
            <a href="http://localhost:3000/profile"
               style="background:#dfff1b; color:#111; padding:12px 30px; border-radius:6px; text-decoration:none; font-weight:600; display:inline-block;">
               Check Team 🚀
            </a>
          </div>
          <div style="text-align:center; margin-top:25px; font-size:12px; color:#888;">
            <p>If this wasn’t you, ignore this email. But we bet it was 😉</p>
            <p>&copy; 2025 ObcyFest. All Rights Reserved.</p>
          </div>
        </div>
      `;
    } else {
      subject = `😅 ${inviteeName} declined your invite to ${eventTitle}`;
      html = `
        <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: auto; background: #1a1a1a; color: #f0f0f0; padding: 30px; border-radius: 12px; border: 1px solid #333;">
          <div style="text-align:center; margin-bottom:20px;">
            <h1 style="font-family:'Fugaz One', sans-serif; color:#dfff1b; font-size:28px; letter-spacing:2px; text-transform:uppercase; filter: drop-shadow(0 0 5px #dfff1b);">
              ObcyFest 4.0
            </h1>
          </div>
          <h2 style="font-size:22px; color:#fff;">Oops! <strong>${inviteeName}</strong> said no 😢</h2>
          <p style="font-size:16px; line-height:1.6;">
            Looks like your teammate won't be joining <strong>${eventTitle}</strong>. No worries—there are plenty of brilliant engineers ready to team up with you!
          </p>
          <p style="font-size:16px; line-height:1.6;">
            Keep checking the <a href="http://localhost:3000/events/" style="color:#dfff1b; text-decoration:underline;">event dashboard</a> for new team members and updates.
          </p>
          <div style="margin-top:30px; text-align:center;">
            <a href="http://localhost:3000/profile"
               style="background:#ef4444; color:white; padding:12px 30px; border-radius:6px; text-decoration:none; font-weight:600; display:inline-block;">
               See Team 😎
            </a>
          </div>
          <div style="text-align:center; margin-top:25px; font-size:12px; color:#888;">
            <p>If this wasn’t you, ignore this email. Keep innovating! 💡</p>
            <p>&copy; 2025 ObcyFest. All Rights Reserved.</p>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: `"ObcyFest" <${process.env.EMAIL_USER}>`,
      to: inviterEmail,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Response email sent!" });
  } catch (err: any) {
    console.error("Error sending response mail:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
