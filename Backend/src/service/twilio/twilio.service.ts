import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';

export interface SmsOptions {
  to: string | string[];
  body: string;
  from?: string;
  mediaUrls?: string[];
}

@Injectable()
export class TwilioService {
  private client: any;
  private accountSid: string;
  private defaultFrom: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    const authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.defaultFrom = process.env.TWILIO_FROM || '';

    if (this.accountSid && authToken) {
      const twilioFactory = (Twilio as any).default || Twilio;
      this.client = twilioFactory(this.accountSid, authToken);
    } else {
      this.client = null;
    }
  }

  private formatRecipients(value?: string | string[]) {
    if (!value) return [] as string[];
    return Array.isArray(value) ? value : [value];
  }

  async sendSms(options: SmsOptions) {
    if (!this.client) {
      throw new Error(
        'Twilio credentials not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN)',
      );
    }

    const from = options.from || this.defaultFrom;
    if (!from)
      throw new Error(
        'Twilio `from` phone number not configured (TWILIO_FROM)',
      );

    const recipients = this.formatRecipients(options.to);
    if (!recipients.length) throw new Error('No recipient provided');

    try {
      // If single recipient, send single message and return its result
      if (recipients.length === 1) {
        const message = await this.client.messages.create({
          to: recipients[0],
          from,
          body: options.body,
          mediaUrl:
            options.mediaUrls && options.mediaUrls.length
              ? options.mediaUrls
              : undefined,
        });
        return {
          success: true,
          sid: message && message.sid ? message.sid : undefined,
          response: message,
        };
      }

      // Bulk send: fire off in parallel
      const results = await Promise.all(
        recipients.map((r) =>
          this.client.messages.create({
            to: r,
            from,
            body: options.body,
            mediaUrl:
              options.mediaUrls && options.mediaUrls.length
                ? options.mediaUrls
                : undefined,
          }),
        ),
      );
      return { success: true, response: results };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Twilio send error:', err);
      throw new Error(`Failed to send SMS via Twilio: ${message}`);
    }
  }

  async sendBulkSms(to: string[], body: string, from?: string) {
    return this.sendSms({ to, body, from });
  }

  async sendOtp(to: string, code: string) {
    const body = `Your NutriBin verification code is: ${code}\nThis code expires in 10 minutes.`;
    return this.sendSms({ to, body });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      if (!this.accountSid) return false;
      const account = await this.client.api.accounts(this.accountSid).fetch();
      return !!(account && account.sid);
    } catch (err) {
      console.error('Twilio verification error:', err);
      return false;
    }
  }
}
