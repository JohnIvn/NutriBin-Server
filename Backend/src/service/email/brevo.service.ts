import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

@Injectable()
export class BrevoService {
  private tranEmailApi: any;
  private defaultSender: { email: string; name?: string };

  constructor() {
    const apiKey =
      process.env.BREVO_API_KEY ||
      process.env.SENDINBLUE_API_KEY ||
      process.env.SIB_API_KEY;
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    if (apiKey) {
      const apiKeyAuth = defaultClient.authentications['api-key'];
      apiKeyAuth.apiKey = apiKey;
    }
    this.tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    const fromEnv = process.env.MAIL_FROM || process.env.MAIL_USER || '';
    if (fromEnv) {
      // MAIL_FROM may be in format "Name <email>"
      const matches = /^(.*)<([^>]+)>$/.exec(fromEnv);
      if (matches) {
        this.defaultSender = {
          name: matches[1].trim(),
          email: matches[2].trim(),
        };
      } else {
        this.defaultSender = { email: fromEnv };
      }
    } else {
      this.defaultSender = { email: '' };
    }
  }

  private formatRecipients(value?: string | string[]) {
    if (!value) return [] as Array<{ email: string }>;
    if (Array.isArray(value)) return value.map((e) => ({ email: e }));
    return [{ email: value }];
  }

  async sendMail(options: EmailOptions) {
    if (
      !process.env.BREVO_API_KEY &&
      !process.env.SENDINBLUE_API_KEY &&
      !process.env.SIB_API_KEY
    ) {
      throw new Error('Brevo API key not configured (BREVO_API_KEY)');
    }

    const sender =
      options.from ||
      (this.defaultSender && this.defaultSender.email) ||
      process.env.MAIL_FROM ||
      process.env.MAIL_USER ||
      '';

    const payload: any = {
      sender:
        this.defaultSender && this.defaultSender.email
          ? this.defaultSender
          : { email: sender },
      to: this.formatRecipients(options.to),
      subject: options.subject,
      htmlContent: options.html,
      textContent: options.text,
    };

    const cc = this.formatRecipients(options.cc as string | string[]);
    const bcc = this.formatRecipients(options.bcc as string | string[]);
    if (cc.length) payload.cc = cc;
    if (bcc.length) payload.bcc = bcc;

    if (options.attachments && options.attachments.length) {
      payload.attachment = options.attachments.map((a) => {
        const content = a.content
          ? typeof a.content === 'string'
            ? Buffer.from(a.content).toString('base64')
            : Buffer.from(a.content).toString('base64')
          : undefined;
        return {
          name: a.filename,
          content,
        };
      });
    }

    try {
      const result = await this.tranEmailApi.sendTransacEmail(payload);
      return {
        success: true,
        messageId: result && result.messageId ? result.messageId : undefined,
        response: result,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Brevo send error:', err);
      throw new Error(`Failed to send email via Brevo: ${message}`);
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      // Basic verification: ensure API key exists and TransactionalEmailsApi can be constructed
      if (
        !process.env.BREVO_API_KEY &&
        !process.env.SENDINBLUE_API_KEY &&
        !process.env.SIB_API_KEY
      )
        return false;
      return true;
    } catch (err) {
      console.error('Brevo verification error:', err);
      return false;
    }
  }

  async sendTextEmail(to: string, subject: string, text: string) {
    return this.sendMail({ to, subject, text });
  }

  async sendHtmlEmail(to: string, subject: string, html: string) {
    return this.sendMail({ to, subject, html });
  }

  // Convenience methods kept from the original service
  async sendWelcomeEmail(to: string, name: string) {
    const subject = 'Welcome to NutriBin!';
    const content = `<h2>Welcome, ${name}!</h2><p>Thanks for joining NutriBin.</p>`;
    const html = `<!doctype html><html><body>${content}</body></html>`;
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Send an MFA verification email using the branded template
   */
  async sendMfaVerificationEmail(
    to: string,
    firstName: string,
    verificationLink: string,
  ) {
    const subject = 'NutriBin - Verify Your Login';
    const content = `
      <h2 style="margin: 0 0 20px 0; color: #4F6F52; font-size: 24px;">Verify Your Login 🔐</h2>
      <p style="margin: 0 0 15px 0;">Hello <strong>${firstName}</strong>,</p>
      <p style="margin: 0 0 20px 0;">A login attempt was made to your NutriBin account. To complete the sign-in process, please verify your identity by clicking the button below.</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${verificationLink}" style="display: inline-block; background-color: #4F6F52; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 6px 12px rgba(79, 111, 82, 0.16);">Verify Login</a>
      </div>
      <div style="background-color: #F0F7EE; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #4F6F52;">⏱️ Time Sensitive</p>
        <p style="margin: 0; color: #666; font-size: 14px;">This verification link will expire in <strong>24 hours</strong>.</p>
      </div>
      <div style="background-color: #F7FBF7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #86C166;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #3A4D39;">⚠️ Security Alert</p>
        <p style="margin: 0; color: #666; font-size: 14px;">If you didn't attempt to log in, please ignore this email and ensure your account password is secure.</p>
      </div>
    `;
    const html = this.getEmailTemplate(content, 'Multi-Factor Authentication');
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Send a simple staff email verification code (used for signup)
   */
  async sendStaffVerificationCode(to: string, code: string) {
    const subject = 'Verify your NutriBin staff email';
    const content = `
      <h2 style="margin: 0 0 12px 0; color: #4F6F52; font-size: 20px;">Email Verification</h2>
      <p style="margin: 0 0 10px 0; color: #333; font-size: 15px;">Use the verification code below to confirm your email address for your staff profile.</p>
      <div style="text-align: center; margin: 18px 0;">
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #4F6F52; margin: 0;">${code}</p>
      </div>
      <p style="margin: 12px 0 0 0; color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
    `;
    const html = this.getEmailTemplate(content, 'Email Verification');
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Send a staff new-email verification code (includes recipient name)
   */
  async sendStaffChangeVerification(
    to: string,
    firstName: string,
    code: string,
  ) {
    const subject = 'Verify your new NutriBin staff email';
    const content = `
      <h2 style="margin: 0 0 12px 0; color: #4F6F52; font-size: 20px;">Email Change Verification</h2>
      <p style="margin: 0 0 10px 0; color: #333; font-size: 15px;">Hello ${firstName},</p>
      <p style="margin: 0 0 12px 0; color: #333; font-size: 15px;">Use the verification code below to confirm your new email address for your staff profile.</p>
      <div style="text-align: center; margin: 18px 0;">
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #4F6F52; margin: 0;">${code}</p>
      </div>
      <p style="margin: 12px 0 0 0; color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
      <p style="margin: 12px 0 0 0; color: #666; font-size: 14px;">If you did not request this change, please ignore this email.</p>
      <br />
      <p style="margin: 8px 0 0 0; color: #333; font-size: 14px;">Thanks,</p>
      <p style="margin: 0 0 0 0; color: #333; font-size: 14px;">NutriBin Team</p>
    `;
    const html = this.getEmailTemplate(content, 'Email Change Verification');
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Branded HTML email wrapper
   */
  private getEmailTemplate(content: string, title?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title || 'NutriBin'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F0F7EE;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0F7EE; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06); overflow: hidden;">
                <tr>
                  <td style="background: linear-gradient(135deg, #4F6F52 0%, #3A4D39 100%); padding: 30px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 1px;">NutriBin</h1>
                    ${title ? `<p style="margin: 8px 0 0 0; color: #F0F7EE; font-size: 14px; font-weight: 500;">${title}</p>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px; color: #333333; font-size: 16px; line-height: 1.6;">
                    ${content}
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #F0F7EE; padding: 30px 40px; text-align: center; border-top: 2px solid #4F6F52;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;"><strong>NutriBin</strong> - Smart Nutrition Management</p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
                    <p style="margin: 15px 0 0 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} NutriBin. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request - NutriBin';
    const content = `
      <h2 style="margin: 0 0 20px 0; color: #4F6F52; font-size: 24px;">Reset Your Password 🔐</h2>
      <p style="margin: 0 0 15px 0;">We received a request to reset the password for your NutriBin account.</p>
      <p style="margin: 0 0 20px 0;">Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #4F6F52; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
      </div>
      <div style="background-color: #F0F7EE; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #4F6F52;">⚠️ Security Note</p>
        <p style="margin: 0; color: #666; font-size: 14px;">This link will expire in <strong>1 hour</strong> for your security.</p>
      </div>
      <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    `;
    const html = this.getEmailTemplate(content, 'Password Reset');
    return this.sendHtmlEmail(to, subject, html);
  }

  async sendPasswordResetCodeEmail(to: string, code: string) {
    const subject = 'Your NutriBin Password Reset Code';
    const content = `
      <h2 style="margin: 0 0 20px 0; color: #4F6F52; font-size: 24px;">Your Verification Code 🔑</h2>
      <p style="margin: 0 0 20px 0;">Use the verification code below to reset your NutriBin account password.</p>
      <div style="background: linear-gradient(135deg, #F0F7EE 0%, #E6F2E6 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; border: 2px solid #4F6F52;">
        <p style="margin: 0; color: #666; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
        <p style="margin: 15px 0 0 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4F6F52; font-family: 'Courier New', monospace;">${code}</p>
      </div>
      <div style="background-color: #F0F7EE; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #4F6F52;">⏱️ Time Sensitive</p>
        <p style="margin: 0; color: #666; font-size: 14px;">This code will expire in <strong>15 minutes</strong>.</p>
      </div>
      <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">If you did not request a password reset, please ignore this email and your password will remain secure.</p>
    `;
    const html = this.getEmailTemplate(content, 'Password Reset Code');
    return this.sendHtmlEmail(to, subject, html);
  }

  async sendRepairNotification(
    to: string,
    repairDetails: {
      machineId: string;
      issueType: string;
      status: string;
      description?: string;
    },
  ) {
    const subject = `Repair Notification - Machine ${repairDetails.machineId}`;
    const statusColors: Record<string, string> = {
      pending: '#86C166',
      'in-progress': '#4F6F52',
      completed: '#16A34A',
      cancelled: '#CC0000',
    };
    const statusColor =
      statusColors[repairDetails.status.toLowerCase()] || '#4F6F52';
    const content = `
      <h2 style="margin: 0 0 20px 0; color: #4F6F52; font-size: 24px;">Repair Status Update 🔧</h2>
      <p style="margin: 0 0 20px 0;">A repair request for Machine <strong>${repairDetails.machineId}</strong> has been <strong>${repairDetails.status}</strong>.</p>
      <div style="background-color: #F0F7EE; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${statusColor};">
        <h3 style="margin: 0 0 15px 0; color: #4F6F52; font-size: 18px;">Repair Details</h3>
        <table width="100%" cellpadding="8" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: 600; width: 140px;">Machine ID:</td>
            <td style="padding: 8px 0; color: #333;">${repairDetails.machineId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: 600;">Issue Type:</td>
            <td style="padding: 8px 0; color: #333;">${repairDetails.issueType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: 600;">Status:</td>
            <td style="padding: 8px 0;"><span style="display: inline-block; padding: 4px 12px; background-color: ${statusColor}; color: #ffffff; border-radius: 6px; font-weight: 600; font-size: 14px; text-transform: uppercase;">${repairDetails.status}</span></td>
          </tr>
          ${
            repairDetails.description
              ? `
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: 600; vertical-align: top;">Description:</td>
            <td style="padding: 8px 0; color: #333;">${repairDetails.description}</td>
          </tr>`
              : ''
          }
        </table>
      </div>
      <p style="margin: 20px 0 0 0; color: #666;">You will receive further updates as the repair progresses.</p>
    `;
    const html = this.getEmailTemplate(content, 'Repair Notification');
    return this.sendHtmlEmail(to, subject, html);
  }
}
