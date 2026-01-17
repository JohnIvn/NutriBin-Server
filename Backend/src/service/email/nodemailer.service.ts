import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter, SentMessageInfo } from 'nodemailer';

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
export class NodemailerService {
  private transporter: Transporter;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Generate a consistent email template with NutriBin branding
   * @param content The main content HTML
   * @param title Optional title for the email
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
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #FFF5E4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5E4; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #CD5C08 0%, #A34906 100%); padding: 30px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 1px;">
                      NutriBin
                    </h1>
                    ${title ? `<p style="margin: 8px 0 0 0; color: #FFF5E4; font-size: 14px; font-weight: 500;">${title}</p>` : ''}
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px; color: #333333; font-size: 16px; line-height: 1.6;">
                    ${content}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #FFF5E4; padding: 30px 40px; text-align: center; border-top: 2px solid #CD5C08;">
                    <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                      <strong>NutriBin</strong> - Smart Nutrition Management
                    </p>
                    <p style="margin: 0; color: #999999; font-size: 12px;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                    <p style="margin: 15px 0 0 0; color: #999999; font-size: 12px;">
                      © ${new Date().getFullYear()} NutriBin. All rights reserved.
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
  }

  private initializeTransporter() {
    // Configure your email transporter
    // Using port 465 with secure: true is generally more reliable for Gmail on cloud providers like Railway
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '465'),
      secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        // Essential for some cloud environments to handle certificate verification
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * Send an email
   * @param options Email options including to, subject, text/html, etc.
   * @returns Promise with send result
   */
  async sendMail(options: EmailOptions) {
    try {
      const mailOptions = {
        from: options.from || process.env.MAIL_FROM || process.env.MAIL_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc
          ? Array.isArray(options.cc)
            ? options.cc.join(', ')
            : options.cc
          : undefined,
        bcc: options.bcc
          ? Array.isArray(options.bcc)
            ? options.bcc.join(', ')
            : options.bcc
          : undefined,
        attachments: options.attachments,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: SentMessageInfo =
        await this.transporter.sendMail(mailOptions);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log('Email sent successfully:', info.messageId);
      return {
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        messageId: info.messageId as string,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        response: info.response as string,
      };
    } catch (error: unknown) {
      console.error('Error sending email:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  /**
   * Verify transporter configuration
   * @returns Promise<boolean>
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email server connection verified');
      return true;
    } catch (error) {
      console.error('Email server connection failed:', error);
      return false;
    }
  }

  /**
   * Send a simple text email
   * @param to Recipient email address
   * @param subject Email subject
   * @param text Email text content
   */
  async sendTextEmail(to: string, subject: string, text: string) {
    return this.sendMail({ to, subject, text });
  }

  /**
   * Send an HTML email
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email HTML content
   */
  async sendHtmlEmail(to: string, subject: string, html: string) {
    return this.sendMail({ to, subject, html });
  }

  /**
   * Send a welcome email
   * @param to Recipient email address
   * @param name Recipient name
   */
  async sendWelcomeEmail(to: string, name: string) {
    const subject = 'Welcome to NutriBin!';
    const content = `
      <h2 style="margin: 0 0 20px 0; color: #CD5C08; font-size: 24px;">Welcome, ${name}! 🎉</h2>
      <p style="margin: 0 0 15px 0;">Thank you for joining NutriBin, your smart nutrition management platform.</p>
      <p style="margin: 0 0 15px 0;">We're excited to have you on board and can't wait to help you on your nutrition journey.</p>
      <div style="background-color: #FFF5E4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #CD5C08;">What's Next?</p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #666;">
          <li>Explore your dashboard</li>
          <li>Set up your profile</li>
          <li>Start tracking your nutrition</li>
        </ul>
      </div>
      <p style="margin: 20px 0 0 0; color: #666;">If you have any questions, feel free to reach out to our support team.</p>
    `;
    const html = this.getEmailTemplate(content, 'Welcome Aboard');
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Send a password reset email
   * @param to Recipient email address
   * @param resetToken Password reset token
   */
  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request - NutriBin';
    const content = `
      <h2 style="margin: 0 0 20px 0; color: #CD5C08; font-size: 24px;">Reset Your Password 🔐</h2>
      <p style="margin: 0 0 15px 0;">We received a request to reset the password for your NutriBin account.</p>
      <p style="margin: 0 0 20px 0;">Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #CD5C08; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
      </div>
      <div style="background-color: #FFF5E4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #CD5C08;">⚠️ Security Note</p>
        <p style="margin: 0; color: #666; font-size: 14px;">This link will expire in <strong>1 hour</strong> for your security.</p>
      </div>
      <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    `;
    const html = this.getEmailTemplate(content, 'Password Reset');
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Send a password reset code email (6-digit code)
   * @param to Recipient email address
   * @param code 6-digit reset code
   */
  async sendPasswordResetCodeEmail(to: string, code: string) {
    const subject = 'Your NutriBin Password Reset Code';
    const content = `
      <h2 style="margin: 0 0 20px 0; color: #CD5C08; font-size: 24px;">Your Verification Code 🔑</h2>
      <p style="margin: 0 0 20px 0;">Use the verification code below to reset your NutriBin account password.</p>
      <div style="background: linear-gradient(135deg, #FFF5E4 0%, #FFE8CC 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; border: 2px solid #CD5C08;">
        <p style="margin: 0; color: #666; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
        <p style="margin: 15px 0 0 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #CD5C08; font-family: 'Courier New', monospace;">${code}</p>
      </div>
      <div style="background-color: #FFF5E4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #CD5C08;">⏱️ Time Sensitive</p>
        <p style="margin: 0; color: #666; font-size: 14px;">This code will expire in <strong>15 minutes</strong>.</p>
      </div>
      <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">If you did not request a password reset, please ignore this email and your password will remain secure.</p>
    `;
    const html = this.getEmailTemplate(content, 'Password Reset Code');
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Send a repair notification email
   * @param to Recipient email address
   * @param repairDetails Details about the repair
   */
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
      pending: '#FFA500',
      'in-progress': '#0066CC',
      completed: '#00AA00',
      cancelled: '#CC0000',
    };
    const statusColor =
      statusColors[repairDetails.status.toLowerCase()] || '#CD5C08';
    const content = `
      <h2 style="margin: 0 0 20px 0; color: #CD5C08; font-size: 24px;">Repair Status Update 🔧</h2>
      <p style="margin: 0 0 20px 0;">A repair request for Machine <strong>${repairDetails.machineId}</strong> has been <strong>${repairDetails.status}</strong>.</p>
      <div style="background-color: #FFF5E4; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${statusColor};">
        <h3 style="margin: 0 0 15px 0; color: #CD5C08; font-size: 18px;">Repair Details</h3>
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
            <td style="padding: 8px 0;">
              <span style="display: inline-block; padding: 4px 12px; background-color: ${statusColor}; color: #ffffff; border-radius: 6px; font-weight: 600; font-size: 14px; text-transform: uppercase;">${repairDetails.status}</span>
            </td>
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
