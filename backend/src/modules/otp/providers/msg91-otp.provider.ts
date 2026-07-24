import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOtpProvider } from '../interfaces/otp-provider.interface';

@Injectable()
export class Msg91OtpProvider implements IOtpProvider {
  private readonly logger = new Logger(Msg91OtpProvider.name);
  private readonly authKey: string;
  private readonly baseUrl = 'https://control.msg91.com/api/v5/otp';

  constructor(private readonly configService: ConfigService) {
    this.authKey = this.configService.get<string>('MSG91_AUTH_KEY', '');
  }

  async sendSms(phone: string, message: string): Promise<boolean> {
    // Extract 6-digit OTP from message
    const otpMatch = message.match(/\d{6}/);
    if (!otpMatch) {
      this.logger.error('Could not extract OTP from message');
      return false;
    }
    const otp = otpMatch[0];

    // MSG91 expects 91+10digit format (Indian numbers)
    const cleanPhone = phone.replace(/^\+91/, '').replace(/^91/, '').trim();
    const mobileWithCountry = `91${cleanPhone}`;

    this.logger.log(`📱 Sending OTP via MSG91 to: ${cleanPhone}`);

    try {
      const response = await fetch(
        `${this.baseUrl}?mobile=${mobileWithCountry}&otp=${otp}`,
        {
          method: 'POST',
          headers: {
            authkey: this.authKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (data.type === 'success') {
        this.logger.log(
          `✅ OTP sent successfully via MSG91 to ${cleanPhone}. Request ID: ${data.request_id}`,
        );
        return true;
      } else {
        this.logger.error(`❌ MSG91 error: ${JSON.stringify(data)}`);
        return false;
      }
    } catch (err) {
      this.logger.error(`❌ MSG91 network error: ${err}`);
      return false;
    }
  }
}
