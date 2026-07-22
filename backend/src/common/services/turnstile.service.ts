import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);
  private readonly secretKey: string;
  private readonly verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  constructor(private readonly configService: ConfigService) {
    // Default to Cloudflare test secret key that always passes (1x0000000000000000000000000000000AA)
    this.secretKey = this.configService.get<string>(
      'CLOUDFLARE_TURNSTILE_SECRET_KEY',
      '1x0000000000000000000000000000000AA',
    );
  }

  async verifyToken(token?: string, remoteIp?: string): Promise<boolean> {
    // If no token provided and environment is dev or test key is set, bypass
    if (!token && (this.secretKey === '1x0000000000000000000000000000000AA' || process.env.NODE_ENV !== 'production')) {
      this.logger.debug('Cloudflare Turnstile token bypassed (Development/Test Mode)');
      return true;
    }

    if (!token) {
      throw new BadRequestException('Cloudflare Turnstile security token is required.');
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', this.secretKey);
      formData.append('response', token);
      if (remoteIp) {
        formData.append('remoteip', remoteIp);
      }

      const response = await fetch(this.verifyUrl, {
        method: 'POST',
        body: formData,
      });

      const outcome = await response.json();

      if (outcome.success) {
        this.logger.log('✅ Cloudflare Turnstile verification successful');
        return true;
      } else {
        this.logger.warn(`❌ Cloudflare Turnstile verification failed: ${JSON.stringify(outcome['error-codes'])}`);
        throw new BadRequestException('Security verification failed. Please try again.');
      }
    } catch (error) {
      this.logger.error('Error contacting Cloudflare Turnstile API:', error);
      // In development fallback to true
      if (process.env.NODE_ENV !== 'production') {
        return true;
      }
      throw new BadRequestException('Security verification service unavailable.');
    }
  }
}
