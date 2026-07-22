import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { OTP_PROVIDER_TOKEN } from './interfaces/otp-provider.interface';
import { Fast2SmsOtpProvider } from './providers/fast2sms-otp.provider';
import { ConsoleOtpProvider } from './providers/console-otp.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    OtpService,
    Fast2SmsOtpProvider,
    ConsoleOtpProvider,
    {
      provide: OTP_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService, fast2sms: Fast2SmsOtpProvider, console: ConsoleOtpProvider) => {
        const provider = configService.get<string>('OTP_PROVIDER', 'console');
        if (provider === 'fast2sms') {
          return fast2sms;
        }
        return console;
      },
      inject: [ConfigService, Fast2SmsOtpProvider, ConsoleOtpProvider],
    },
  ],
  exports: [OtpService],
})
export class OtpModule {}
