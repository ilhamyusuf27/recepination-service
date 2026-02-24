require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true if 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* =========================
   VERIFY EMAIL TEMPLATE
========================= */
const sendVerificationEmail = async ({ name, email, token }) => {
  const verifyUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Recipenation" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Hello ${name},</h2>
      <p>Thanks for registering!</p>
      <p>Please click the link below to verify your email:</p>
      <a href="${verifyUrl}" target="_blank">Verify Email</a>
      <p>If you did not register, please ignore this email.</p>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
};
