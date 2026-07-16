import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import config from '../config/config';

/**
 * Email Service
 * Uses Nodemailer with Ethereal (dev) or SMTP (production)
 * * Free email API options for production:
 * - Brevo (ex-Sendinblue): 300 emails/day free → https://brevo.com
 * - Resend: 3000 emails/month free → https://resend.com
 * * For dev mode, uses Ethereal which captures emails and provides preview URLs.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isDevMode: boolean;
  private initPromise: Promise<void>; // مضاف لضمان اكتمال التهيئة قبل محاولة الإرسال

  constructor() {
    this.isDevMode = process.env.NODE_ENV !== 'production';
    this.initPromise = this.initTransporter();
  }

  private async initTransporter() {
    try {
      // Check if email credentials are provided in config
      if (config.email.user && config.email.password) {
        // Use configured email service (Gmail, etc.)
        this.transporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port,
          secure: config.email.secure,
          auth: {
            user: config.email.user,
            pass: config.email.password,
          },
        });
        this.isDevMode = false;
        logger.info('Email service initialized with configured SMTP', { host: config.email.host });
      } else if (this.isDevMode) {
        // Dev mode: Use Ethereal (free test emails with preview URLs)
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info('Email service initialized with Ethereal (dev mode)');
      } else {
        // Production: Use SMTP from environment variables
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
          },
        });
        logger.info('Email service initialized with SMTP (production mode)');
      }
    } catch (err) {
      logger.error('Failed to initialize email transporter', err);
    }
  }

  /**
   * Send verification email with OTP code
   */
  async sendVerificationEmail(to: string, otpCode: string, userName: string): Promise<{ previewUrl?: string }> {
    // ننتظر حتى تكتمل عملية التهيئة تماماً قبل محاولة الإرسال
    await this.initPromise;

    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>تأكيد البريد الإلكتروني</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a237e 0%, #283593 100%); padding: 32px 24px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">باسرا</h1>
                      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">BASIRA - Financial Guidance</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 32px 24px;">
                      <h2 style="margin: 0 0 16px; color: #1a237e; font-size: 20px;">تأكيد البريد الإلكتروني</h2>
                      <p style="margin: 0 0 12px; color: #333333; font-size: 16px; line-height: 1.6;">
                        مرحباً <strong>${userName}</strong>،
                      </p>
                      <p style="margin: 0 0 24px; color: #555555; font-size: 15px; line-height: 1.6;">
                        شكراً لتسجيلك في باسرا! رمز التحقق الخاص بك هو:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 8px 0 24px;">
                            <div style="background-color: #f0f4ff; border: 2px solid #1a237e; border-radius: 8px; padding: 20px 40px; display: inline-block;">
                              <span style="font-size: 32px; font-weight: 700; color: #1a237e; letter-spacing: 8px;">${otpCode}</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 0; color: #888888; font-size: 13px; line-height: 1.5; text-align: center;">
                        إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد.
                        <br>
                        هذا الرمز صالح لمدة 24 ساعة.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 16px 24px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} BASIRA. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const text = `
مرحباً ${userName}،

شكراً لتسجيلك في باسرا!
رمز التحقق الخاص بك هو:

${otpCode}

هذا الرمز صالح لمدة 24 ساعة.

إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد.

© ${new Date().getFullYear()} BASIRA. All rights reserved.
    `.trim();

    const mailOptions: EmailOptions = {
      to,
      subject: 'Confirm your email - تأكيد البريد الإلكتروني | BASIRA',
      html,
      text,
    };

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"BASIRA" <noreply@basira.app>',
        ...mailOptions,
      });

      let previewUrl: string | undefined;
      if (this.isDevMode) {
        previewUrl = nodemailer.getTestMessageUrl(info) as string;
        logger.info('Verification email sent (dev mode)', { to, previewUrl });
      } else {
        logger.info('Verification email sent (production)', { to, messageId: info.messageId });
      }

      return { previewUrl };
    } catch (error) {
      // طباعة تفصيلية للخطأ في الـ Console لمعرفة السبب الحقيقي فوراً
      console.error('--- CRITICAL EMAIL ERROR ---');
      console.error(error);
      console.error('----------------------------');
      
      logger.error('Failed to send verification email', { to, error });
      throw error;
    }
  }

  /**
   * Verify transporter is ready
   */
  isReady(): boolean {
    return this.transporter !== null;
  }
}

export const emailService = new EmailService();