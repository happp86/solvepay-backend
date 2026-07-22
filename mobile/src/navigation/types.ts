import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Wallet: undefined;
  Statistics: undefined;
  Team: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Payment: undefined;
  Settings: undefined;
  OrderDetails: undefined;
};
