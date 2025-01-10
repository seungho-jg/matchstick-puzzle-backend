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
  const logoUrl = 'https://matchstick-puzzle.com/logo2.webp';
  
  try {
    await transporter.sendMail({
      from: process.env.NAVER_EMAIL,
      to: email,
      subject: '성냥개비 퍼즐 - 이메일 인증',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 30px;
                text-align: center;
              }
              .logo {
                width: 150px;
                margin-bottom: 20px;
              }
              .welcome {
                color: #1a1a1a;
                font-size: 24px;
                margin-bottom: 20px;
              }
              .message {
                color: #666;
                margin-bottom: 30px;
              }
              .button {
                background-color: #f43f5e;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                display: inline-block;
                margin: 20px 0;
              }
              .button:hover {
                background-color: #e11d48;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${logoUrl}" alt="성냥개비 퍼즐 로고" class="logo">
              <h1 class="welcome">${username}님, 환영합니다!</h1>
              <p class="message">
                성냥개비 퍼즐의 회원이 되신 것을 환영합니다.<br>
                아래 버튼을 클릭하여 이메일 인증을 완료해 주세요.
              </p>
              <a href="${verificationUrl}" class="button">이메일 인증하기</a>
              <p class="footer">
                이 메일은 성냥개비 퍼즐 회원가입 과정에서 발송되었습니다.<br>
                본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다.
              </p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error(error);
    throw new Error('이메일 전송에 실패했습니다.')
  }
}