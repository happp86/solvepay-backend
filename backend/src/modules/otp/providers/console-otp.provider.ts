import { Injectable, Logger } from '@nestjs/common';
import { IOtpProvider } from '../interfaces/otp-provider.interface';

@Injectable()
export class ConsoleOtpProvider implements IOtpProvider {
  private readonly logger = new Logger(ConsoleOtpProvider.name);

  async sendSms(phone: string, message: string): Promise<boolean> {
    this.logger.log(`📱 [SMS PROVIDER OUTBOUND] To: ${phone} | Content: "${message}"`);
    return true;
  }
}
