import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

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

  private initializeTransporter() {
    // Configure your email transporter
    // You can use environment variables for configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
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

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
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
    const html = `
      <h1>Welcome to NutriBin, ${name}!</h1>
      <p>Thank you for joining our platform.</p>
      <p>We're excited to have you on board!</p>
      <br/>
      <p>Best regards,</p>
      <p>The NutriBin Team</p>
    `;
    return this.sendHtmlEmail(to, subject, html);
  }

  /**
   * Send a password reset email
   * @param to Recipient email address
   * @param resetToken Password reset token
   */
  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request';
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your NutriBin account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br/>
      <p>Best regards,</p>
      <p>The NutriBin Team</p>
    `;
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
    const html = `
      <h2>Repair Notification</h2>
      <p>A repair request has been ${repairDetails.status}.</p>
      <h3>Details:</h3>
      <ul>
        <li><strong>Machine ID:</strong> ${repairDetails.machineId}</li>
        <li><strong>Issue Type:</strong> ${repairDetails.issueType}</li>
        <li><strong>Status:</strong> ${repairDetails.status}</li>
        ${repairDetails.description ? `<li><strong>Description:</strong> ${repairDetails.description}</li>` : ''}
      </ul>
      <br/>
      <p>Best regards,</p>
      <p>The NutriBin Team</p>
    `;
    return this.sendHtmlEmail(to, subject, html);
  }
}
