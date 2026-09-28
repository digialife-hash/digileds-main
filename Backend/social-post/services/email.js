const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const requiredSettings = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"];
  const missingSetting = requiredSettings.find((setting) => !process.env[setting]);
  if (missingSetting) {
    throw new Error(`${missingSetting} is not configured`);
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await getTransporter().sendMail({
    from,
    to: email,
    subject: "Reset your Socially password",
    text: `Hi ${name},\n\nUse this link to reset your Socially password. It expires in 15 minutes:\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your Socially password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
