const buildConsoleMessage = ({ to, subject, text }) => {
  return [
    "",
    "----- Digital Alife Pvt Ltd email -----",
    `To: ${to}`,
    `Subject: ${subject}`,
    text,
    "-------------------------------",
    "",
  ].join("\n");
};

const sendEmail = async ({ to, subject, text, html }) => {
  const hasSmtpConfig = Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );

  
  if (!hasSmtpConfig) {
    console.info(buildConsoleMessage({ to, subject, text }));
    return { delivered: false, mode: "console" };
  }
  
  try {
    const { default: nodemailer } = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    
    return { delivered: true, mode: "smtp" };
  } catch (error) {
    console.error("Email delivery failed", error);
    if (process.env.NODE_ENV !== "production") {
      console.info(buildConsoleMessage({ to, subject, text }));
    }
    return { delivered: false, mode: "console" };
  }
};

export default sendEmail;
