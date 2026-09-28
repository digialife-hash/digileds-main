import dotenv from "dotenv";
import sendEmail from "../utils/sendEmail.js";

dotenv.config();

const to = process.env.TEST_EMAIL_TO || process.env.SMTP_USER;

if (!to) {
  console.error("Missing TEST_EMAIL_TO or SMTP_USER in .env");
  process.exit(1);
}

const result = await sendEmail({
  to,
  subject: "Digital Alife Pvt Ltd SMTP test",
  text: "SMTP is configured correctly. This is a test email.",
  html: "<p>SMTP is configured correctly. This is a test email.</p>",
});

if (result.mode !== "smtp" || !result.delivered) {
  console.error("SMTP test did not deliver. Check SMTP_HOST, SMTP_USER, and SMTP_PASS.");
  process.exit(1);
}

console.log(`SMTP test email delivered to ${to}`);
