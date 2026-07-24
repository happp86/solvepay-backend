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
  OrderDetails: {
    transactionId?: string;
    orderId?: string;
    orderNumber?: string;
    amount?: number;
    status?: string;
    utrNumber?: string;
    createdAt?: string;
    payoutWallet?: string;
    payoutAccount?: string;
    payoutUpi?: string;
  } | undefined;
  Settings: undefined;
  Tasks: undefined;
  TransactionRecords: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Statistics: undefined;
  Wallet: undefined;
  Tools: undefined;
  Team: undefined;
  Profile: undefined;
};
