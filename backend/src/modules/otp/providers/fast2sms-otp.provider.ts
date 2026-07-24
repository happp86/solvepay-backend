import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOtpProvider } from '../interfaces/otp-provider.interface';

@Injectable()
export class Fast2SmsOtpProvider implements IOtpProvider {
  private readonly logger = new Logger(Fast2SmsOtpProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://www.fast2sms.com/dev/bulkV2';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FAST2SMS_API_KEY', '');
  }

  async sendSms(phone: string, message: string): Promise<boolean> {
    // Extract the 6-digit OTP from the message
    const otpMatch = message.match(/\d{6}/);
    if (!otpMatch) {
      this.logger.error('Could not extract OTP from message');
      return false;
    }
    const otp = otpMatch[0];

    // Remove country code if present (Fast2SMS expects 10-digit Indian number)
    const cleanPhone = phone.replace(/^\+91/, '').replace(/^91/, '').trim();

    const payload = {
      route: 'q',
      message: `Your SolvePay OTP is ${otp}. This OTP is valid for 5 minutes. Do not share it with anyone.`,
      language: 'english',
      flash: 0,
      numbers: cleanPhone,
    };

    this.logger.log(`📱 Sending OTP via Fast2SMS to: ${cleanPhone}`);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        authorization: this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.return === true) {
      this.logger.log(`✅ OTP sent successfully to ${cleanPhone}. Request ID: ${data.request_id}`);
      return true;
    } else {
      this.logger.error(`❌ Fast2SMS error: ${JSON.stringify(data)}`);
      return false;
    }
  }
}
