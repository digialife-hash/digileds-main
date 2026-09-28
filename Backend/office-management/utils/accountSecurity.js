import crypto from "node:crypto";
import sendEmail from "./sendEmail.js";

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const createRawToken = () => crypto.randomBytes(32).toString("hex");

export const createOtp = () => {
  return String(crypto.randomInt(100000, 1000000));
};

const PRODUCTION_FRONTEND_URL = "https://user.digitalalife.com";

const getFrontendUrl = () => {
  return PRODUCTION_FRONTEND_URL;
};

export const createEmailVerificationForUser = async (user) => {
  
  const token = createRawToken();
  const otp = createOtp();


  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationOtpHash = hashToken(otp);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  user.emailVerificationOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const verificationLink = `${getFrontendUrl()}/verify-email?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your Digital Alife Pvt Ltd email",
    text: `Your email verification code is ${otp}. It expires in 24 hours. You can also verify your email by opening this link: ${verificationLink}`,
    html: `
      <p>Your email verification code is:</p>
      <h2 style="letter-spacing: 4px;">${otp}</h2>
      <p>This code expires in 24 hours.</p>
      <p>You can also verify your email by opening this link:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
    `,
  });

  return {
    token,
    otp,
    verificationLink,
    expiresAt: user.emailVerificationExpires,
  };
};

export const createPasswordResetForUser = async (user) => {

  const token = createRawToken();
  const otp = createOtp();
  
  
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetOtpHash = hashToken(otp);
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  user.passwordResetOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });
  
  const resetLink = `${getFrontendUrl()}/reset-password?token=${token}`;
  
  // console.log("ashish patel ", user);

  await sendEmail({
    to: user.email,
    subject: "Reset your Digital Alife Pvt Ltd password",
    text: `Reset your password using this link: ${resetLink}\n\nOTP: ${otp}\nThis expires in 15 minutes.`,
    html: `<p>Reset your password using this link:</p><p><a href="${resetLink}">${resetLink}</a></p><p>OTP: <strong>${otp}</strong></p><p>This expires in 15 minutes.</p>`,
  });

  return {
    token,
    otp,
    resetLink,
    expiresAt: user.passwordResetExpires,
  };
};

export const getDevSecurityPayload = (payload) => {
  // Verification and reset tokens must only be delivered out-of-band.
  return undefined;
};
