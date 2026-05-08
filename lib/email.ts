import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendVerificationEmail(to: string, code: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: '[Players] 이메일 인증 코드',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <div style="background: #181818; border-radius: 16px; padding: 12px 20px; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 32px;">
          <span style="font-size: 13px; font-weight: 700; color: #00F5A0; letter-spacing: -0.5px;">Players</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 700; color: #181818; margin: 0 0 8px;">이메일 인증 코드</h2>
        <p style="font-size: 15px; color: #757575; margin: 0 0 32px; line-height: 1.6;">
          아래 인증 코드를 입력창에 입력해주세요.<br/>코드는 <strong>3분 후</strong> 만료됩니다.
        </p>
        <div style="background: #F7F7F7; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #181818;">${code}</span>
        </div>
        <p style="font-size: 13px; color: #9E9E9E; margin: 0;">
          본인이 요청하지 않은 경우 이 이메일을 무시해주세요.
        </p>
      </div>
    `,
  })
}
