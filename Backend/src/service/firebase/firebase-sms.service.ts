import fs from 'fs';
import path from 'path';
import https from 'https';

export class FirebaseSmsService {
  private keyPath: string | undefined;
  private apiKey: string | undefined;

  constructor() {
    this.keyPath = this.findKeyJson();
    this.apiKey =
      process.env.FIREBASE_API_KEY || process.env.FIREBASE_APIKEY || undefined;
  }

  async verifyConnection(): Promise<boolean> {
    const debug = !!process.env.FIREBASE_SMS_DEBUG;
    try {
      if (!this.keyPath || !fs.existsSync(this.keyPath)) {
        if (debug)
          console.error(
            'FirebaseSmsService: key.json not found at',
            this.keyPath,
          );
        return false;
      }
      const raw = fs.readFileSync(this.keyPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.project_id) {
        if (debug)
          console.error('FirebaseSmsService: key.json missing project_id');
        return false;
      }
      if (!this.apiKey) {
        if (debug)
          console.error('FirebaseSmsService: FIREBASE_API_KEY not set');
        return false;
      }
      return true;
    } catch (err: any) {
      if (debug)
        console.error('FirebaseSmsService verify error:', err?.message || err);
      return false;
    }
  }

  private findKeyJson(): string | undefined {
    // search upward from cwd up to 5 levels
    let dir = process.cwd();
    for (let i = 0; i < 6; i++) {
      const candidate = path.join(dir, 'key.json');
      if (fs.existsSync(candidate)) return candidate;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }

    // fallback: try relative to this source file (compiled ts-node path)
    try {
      const rel = path.resolve(__dirname, '../../..', 'key.json');
      if (fs.existsSync(rel)) return rel;
    } catch (e) {
      // ignore
    }

    return undefined;
  }

  sendVerificationCode(phoneNumber: string): Promise<any> {
    if (!this.apiKey)
      return Promise.reject(new Error('FIREBASE_API_KEY not set'));

    const url = new URL(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${this.apiKey}`,
    );

    const body = JSON.stringify({
      phoneNumber,
      // For local testing you may set FIREBASE_RECAPTCHA_TOKEN to a test token.
      recaptchaToken: process.env.FIREBASE_RECAPTCHA_TOKEN || 'unused',
    });

    const options: https.RequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            if (
              res.statusCode &&
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {
              resolve(parsed);
            } else {
              const err = new Error(
                parsed?.error?.message || `HTTP ${res.statusCode}`,
              );
              // attach raw response for debugging
              (err as any).response = parsed;
              reject(err);
            }
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.write(body);
      req.end();
    });
  }
}
