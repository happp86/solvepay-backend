export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  accountTier: 'Verified PRO' | 'Standard' | 'Enterprise';
  balance: number;
  currency: string;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  category: 'Shopping' | 'Transfer' | 'Salary' | 'Utilities' | 'Food' | 'Entertainment';
  amount: number;
  type: 'income' | 'expense';
  date: string;
  time: string;
  status: 'Completed' | 'Pending' | 'Failed';
  icon: string;
  recipientName?: string;
  recipientAvatar?: string;
  paymentMethod: string;
  fee: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Pending' | 'Offline';
  spentThisMonth: number;
}

export interface VirtualCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  cardType: 'Visa' | 'Mastercard';
  tier: 'Platinum' | 'Gold' | 'Black';
  bgGradient: [string, string];
  isFrozen: boolean;
  balance: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}
