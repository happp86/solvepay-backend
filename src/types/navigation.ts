export type RootStackParamList = {
  // Auth Screens
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: { emailOrPhone?: string };
  PrivacyPolicy: undefined;

  // Main Tabs
  MainTabs: { screen?: keyof MainTabParamList } | undefined;

  // Detail Stack Screens
  Payment: { recipientName?: string; recipientAvatar?: string; initialAmount?: string };
  OrderDetails: { transactionId: string };
  Settings: undefined;
  Tasks: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Statistics: undefined;
  Wallet: undefined;
  Team: undefined;
  Profile: undefined;
};
