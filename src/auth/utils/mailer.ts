import * as nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.naver.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.NAVER_EMAIL, // 네이버 이메일 주소
    pass: process.env.NAVER_PASSWORD, // 네이버 이메일 비밀번호
  },
});

export async function sendVerificationEmail(email: string, username: string, token: string) {
  const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
  try {
    await transporter.sendMail({
      from: process.env.NAVER_EMAIL,
      to: email,
      subject: 'Email Verification',
      html: `
        <h1>Welcome, ${username}!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    });
  } catch (error) {
    console.error(error);
    throw new Error('Email sending failed.')
  }
}