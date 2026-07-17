require('dotenv').config()
const nodemailer = require('nodemailer')

const isMailerConfigured = () => Boolean(
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS
)

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const getTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
})

const sendActionEmail = async ({ name, email, subject, actionUrl, actionLabel }) => {
  await getTransporter().sendMail({
    from: `"Recipenation" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html: `<h2>Hello ${escapeHtml(name)},</h2><p><a href="${escapeHtml(actionUrl)}">${escapeHtml(actionLabel)}</a></p><p>If you did not request this, you can ignore this email.</p>`
  })
}

const sendVerificationEmail = ({ name, email, token }) => sendActionEmail({
  name,
  email,
  subject: 'Verify your email',
  actionUrl: `${process.env.APP_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
  actionLabel: 'Verify email'
})

const sendPasswordResetEmail = ({ name, email, token }) => sendActionEmail({
  name,
  email,
  subject: 'Reset your password',
  actionUrl: `${process.env.APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`,
  actionLabel: 'Reset password'
})

module.exports = { isMailerConfigured, sendVerificationEmail, sendPasswordResetEmail }
