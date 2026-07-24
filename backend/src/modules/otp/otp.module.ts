import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { OTP_PROVIDER_TOKEN } from './interfaces/otp-provider.interface';
import { Fast2SmsOtpProvider } from './providers/fast2sms-otp.provider';
import { ConsoleOtpProvider } from './providers/console-otp.provider';
import { Msg91OtpProvider } from './providers/msg91-otp.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    OtpService,
    Fast2SmsOtpProvider,
    ConsoleOtpProvider,
    Msg91OtpProvider,
    {
      provide: OTP_PROVIDER_TOKEN,
      useFactory: (
        configService: ConfigService,
        fast2sms: Fast2SmsOtpProvider,
        msg91: Msg91OtpProvider,
        console: ConsoleOtpProvider,
      ) => {
        const provider = configService.get<string>('OTP_PROVIDER', 'console');
        if (provider === 'fast2sms') return fast2sms;
        if (provider === 'msg91') return msg91;
        return console;
      },
      inject: [ConfigService, Fast2SmsOtpProvider, Msg91OtpProvider, ConsoleOtpProvider],
    },
  ],
  exports: [OtpService],
})
export class OtpModule {}
