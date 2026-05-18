import nodemailer from "nodemailer";

// Initialize Namecheap Private Email SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.privateemail.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true" || true, // Use true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER || "info@mrlegezt.me",
    pass: process.env.SMTP_PASS || "td@Hj2sTf#QftDh"
  }
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error);
  } else {
    console.log("🚀 SMTP Connection Successful! Ready to dispatch emails.");
  }
});

/**
 * Send custom email directly from Admin Console
 */
export async function sendCustomEmail(to: string, subject: string, body: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #030624; color: #ffffff; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: rgba(5, 10, 51, 0.95); border: 1px solid rgba(218, 38, 28, 0.25); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(218, 38, 28, 0.15); }
        .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 20px; }
        .logo span { color: #DA261C; }
        .content { font-size: 16px; line-height: 1.8; color: #cdd4f8; margin-bottom: 40px; }
        .footer { font-size: 12px; color: #747ea9; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">LEGEZT<span>.ME</span></div>
        <div class="content">
          ${body.replace(/\n/g, "<br>")}
        </div>
        <div class="footer">
          This is an official administrative broadcast from Mr. Legezt.<br>
          © ${new Date().getFullYear()} Legezt. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"Legezt Admin" <${process.env.SMTP_USER || "info@mrlegezt.me"}>`,
    to,
    subject,
    html: htmlContent
  });
}

/**
 * Send rich, beautifully styled Welcome Email for added members
 */
export async function sendWelcomeEmail(email: string, name: string, type: "student" | "faculty" | "team", details: any) {
  let typeLabel = "";
  let detailsHtml = "";

  if (type === "student") {
    typeLabel = "Student Portal Access";
    detailsHtml = `
      <div class="meta-item"><strong>Course:</strong> ${details.course}</div>
      <div class="meta-item"><strong>Batch/Year:</strong> ${details.batchYear}</div>
      <div class="meta-item"><strong>Enrollment No:</strong> ${details.enrollmentNo}</div>
    `;
  } else if (type === "faculty") {
    typeLabel = "Faculty Administration Credentials";
    detailsHtml = `
      <div class="meta-item"><strong>Department:</strong> ${details.department}</div>
      <div class="meta-item"><strong>Designation:</strong> ${details.designation}</div>
    `;
  } else {
    typeLabel = "Core Operations Team Credentials";
    detailsHtml = `
      <div class="meta-item"><strong>Role:</strong> ${details.role}</div>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to the Legezt Network</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #030624; color: #ffffff; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: rgba(5, 10, 51, 0.95); border: 1px solid rgba(218, 38, 28, 0.25); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(218, 38, 28, 0.15); }
        .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 20px; }
        .logo span { color: #DA261C; }
        .welcome-title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 20px; text-align: center; }
        .badge { display: inline-block; padding: 6px 14px; background: rgba(218, 38, 28, 0.12); color: #DA261C; border: 1px solid rgba(218, 38, 28, 0.25); border-radius: 100px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
        .content { font-size: 15px; line-height: 1.8; color: #cdd4f8; margin-bottom: 30px; }
        .meta-card { background: rgba(12, 30, 139, 0.1); border: 1px solid rgba(12, 30, 139, 0.25); border-radius: 12px; padding: 24px; margin-bottom: 30px; }
        .meta-title { font-size: 14px; font-weight: 800; color: #8fa0ff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 8px; }
        .meta-item { font-size: 14px; color: #cdd4f8; margin-bottom: 8px; }
        .meta-item strong { color: #ffffff; }
        .btn-link { display: block; text-align: center; margin: 36px 0; }
        .btn { display: inline-block; padding: 15px 36px; background: linear-gradient(135deg, #DA261C 0%, #0C1E8B 100%); color: #ffffff !important; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 4px 15px rgba(218, 38, 28, 0.3); }
        .footer { font-size: 12px; color: #747ea9; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">LEGEZT<span>.ME</span></div>
        <div style="text-align: center;">
          <div class="badge">${typeLabel}</div>
        </div>
        <div class="welcome-title">Greetings, ${name}!</div>
        <div class="content">
          We are pleased to inform you that you have been officially enrolled as a member of the **Legezt Platform**. Your credentials and institutional profiles have been securely provisioned on our network database.
        </div>
        <div class="meta-card">
          <div class="meta-title">Profile Parameters</div>
          ${detailsHtml}
          <div class="meta-item"><strong>Registered Email:</strong> ${email}</div>
        </div>
        <div class="content">
          You can now seamlessly access Legezt resources and digital systems linked directly with this address.
        </div>
        <div class="btn-link">
          <a href="https://mrlegezt.me" class="btn" target="_blank">Access Network</a>
        </div>
        <div class="footer">
          This email was securely generated via systems automation. Please do not reply directly.<br>
          © ${new Date().getFullYear()} Legezt. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"Legezt Services" <${process.env.SMTP_USER || "info@mrlegezt.me"}>`,
    to: email,
    subject: `Welcome to Legezt Platform — Profile Enrolled`,
    html: htmlContent
  });
}

/**
 * Send rich, beautifully styled Welcome Back Notification upon login
 */
export async function sendWelcomeBackEmail(email: string, name: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome Back to Legezt</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #030624; color: #ffffff; margin: 0; padding: 40px 20px; }
        .container { max-width: 600px; margin: 0 auto; background: rgba(5, 10, 51, 0.95); border: 1px solid rgba(218, 38, 28, 0.25); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(218, 38, 28, 0.15); }
        .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 20px; }
        .logo span { color: #DA261C; }
        .welcome-title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 20px; text-align: center; }
        .badge { display: inline-block; padding: 6px 14px; background: rgba(12, 30, 139, 0.12); color: #8fa0ff; border: 1px solid rgba(12, 30, 139, 0.25); border-radius: 100px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
        .content { font-size: 15px; line-height: 1.8; color: #cdd4f8; margin-bottom: 30px; text-align: center; }
        .info-card { background: rgba(12, 30, 139, 0.15); border: 1px solid rgba(218, 38, 28, 0.2); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px; }
        .info-card p { margin: 6px 0; font-size: 14px; color: #cdd4f8; }
        .info-card strong { color: #ffffff; }
        .footer { font-size: 12px; color: #747ea9; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">LEGEZT<span>.ME</span></div>
        <div style="text-align: center;">
          <div class="badge">Session Verification</div>
        </div>
        <div class="welcome-title">Welcome Back, ${name}!</div>
        <p class="content">
          An active administrative/member console session has been successfully established and verified for your profile.
        </p>
        <div class="info-card">
          <p><strong>Account email:</strong> ${email}</p>
          <p><strong>Session status:</strong> Active & Secure</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p class="content" style="font-size: 13.5px; color: #747ea9;">
          If this activity was not initiated by you, please check your Clerk identity credentials immediately.
        </p>
        <div class="footer">
          This safety advisory was securely dispatched via automation.<br>
          © ${new Date().getFullYear()} Legezt. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"Legezt Security" <${process.env.SMTP_USER || "info@mrlegezt.me"}>`,
    to: email,
    subject: `Active Legezt Session Detected — Welcome Back`,
    html: htmlContent
  });
}
