import nodemailer from 'nodemailer'

export async function sendVerificationEmail({ to, name, token }) {
  const config = useRuntimeConfig()
  const baseUrl = config.public.appUrl || 'http://localhost:3000'

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  })

  const mailOptions = {
    from: `"Hot Dash 🍽️" <${config.smtpUser}>`,
    to,
    subject: 'Verify Your Email – Hot Dash',
    html: `
      <h2>Hello ${name},</h2>
      <p>Thanks for signing up on <strong>Hot Dash</strong>.</p>
      <p>Click below to verify your email:</p>
      <a href="${baseUrl}/verify-email?token=${token}&email=${to}" style="color:orange;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `
  }

  await transporter.sendMail(mailOptions)
}
