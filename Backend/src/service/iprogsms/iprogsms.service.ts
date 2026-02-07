import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class IprogSmsService {
  private readonly logger = new Logger(IprogSmsService.name);
  private readonly apiToken: string;
  private readonly baseUrl = 'https://www.iprogsms.com/api/v1/sms_messages';

  constructor() {
    this.apiToken =
      process.env.IPROG_SMS_API_TOKEN || process.env.SMS_KEY || '';
  }

  private sendRequest(
    phone: string,
    message: string,
  ): Promise<{ statusCode?: number; body: string; headers: any }> {
    return new Promise((resolve, reject) => {
      if (!this.apiToken)
        return reject(
          new Error(
            'IPROG SMS token not configured (IPROG_SMS_API_TOKEN or SMS_KEY)',
          ),
        );

      const params = new URLSearchParams({
        api_token: this.apiToken,
        message,
        phone_number: phone,
      });

      const bodyString = params.toString();
      const displayBody = bodyString.replace(
        /api_token=[^&]*/i,
        'api_token=***',
      );
      this.logger.log(
        `IprogSMS request POST -> ${this.baseUrl} body=${displayBody}`,
      );

      const parsedUrl = new URL(this.baseUrl);
      const options: https.RequestOptions = {
        method: 'POST',
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
        port: parsedUrl.port || 443,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(bodyString),
          Accept: 'application/json, text/plain, */*',
          'User-Agent': 'NutriBin/1.0',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          this.logger.log(
            `IprogSMS response <- phone=${phone} status=${res.statusCode} body=${
              data && data.length > 200
                ? data.slice(0, 200) + '...(truncated)'
                : data
            }`,
          );
          resolve({
            statusCode: res.statusCode,
            body: data,
            headers: res.headers,
          });
        });
      });

      req.on('error', (err) => reject(err));
      req.write(bodyString);
      req.end();
    });
  }

  async sendSms(options: { to: string | string[]; body: string }) {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    if (!recipients.length) throw new Error('No recipient provided');

    const normalize = (raw?: string) => {
      if (!raw) return '';
      let p = String(raw).trim();
      // remove all non-digit characters
      p = p.replace(/\D+/g, '');
      // If starts with '0' and length 11 (09xxxxxxxxx) -> replace leading 0 with 63
      if (p.length === 11 && p.startsWith('09')) return '63' + p.slice(1);
      // If starts with '9' and length 10 -> assume local without leading 0
      if (p.length === 10 && p.startsWith('9')) return '63' + p;
      // If starts with '63' and length 12 -> already ok
      if (p.length === 12 && p.startsWith('63')) return p;
      // If starts with '0' but different length, try replace leading 0
      if (p.startsWith('0')) return '63' + p.slice(1);
      // If starts with '63' but different formatting, keep digits-only
      return p;
    };

    try {
      const normalized = recipients.map((r) => normalize(r));
      this.logger.log(
        `IprogSMS sendSms called. recipients=${JSON.stringify(
          recipients,
        )} normalized=${JSON.stringify(normalized)}`,
      );

      if (recipients.length === 1) {
        const to = normalized[0];
        const r = await this.sendRequest(to, options.body);
        this.logger.log(`IprogSMS sent to ${to} status=${r.statusCode}`);
        return { success: true, response: r };
      }

      const results = await Promise.all(
        normalized.map((p) => this.sendRequest(p, options.body)),
      );
      this.logger.log(
        `IprogSMS bulk send results: ${results
          .map((r) => r?.statusCode)
          .join(',')}`,
      );
      return { success: true, response: results };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('IprogSMS send error:', err as any);
      throw new Error(`Failed to send SMS via IprogSMS: ${msg}`);
    }
  }

  async sendBulkSms(to: string[], body: string) {
    return this.sendSms({ to, body });
  }

  async sendOtp(to: string, code: string) {
    const body = `Your NutriBin verification code is: ${code}\nThis code expires in 10 minutes.`;
    return this.sendSms({ to, body });
  }

  async verifyConnection(): Promise<boolean> {
    return await Promise.resolve(Boolean(this.apiToken));
  }
}
