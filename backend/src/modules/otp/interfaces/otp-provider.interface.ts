export const OTP_PROVIDER_TOKEN = 'IOtpProvider';

export interface IOtpProvider {
  sendSms(phone: string, message: string): Promise<boolean>;
}
