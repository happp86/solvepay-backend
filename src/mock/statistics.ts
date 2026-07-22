import { CategoryExpense } from '../types/data';

export const mockCategories: CategoryExpense[] = [
  {
    category: 'Shopping & Tech',
    amount: 2499.00,
    percentage: 45,
    color: '#18C964',
    icon: '🛍️',
  },
  {
    category: 'Cloud & Utilities',
    amount: 1120.50,
    percentage: 22,
    color: '#6366F1',
    icon: '⚡',
  },
  {
    category: 'Food & Dining',
    amount: 680.20,
    percentage: 15,
    color: '#F59E0B',
    icon: '🍔',
  },
  {
    category: 'Team Transfers',
    amount: 540.00,
    percentage: 12,
    color: '#EC4899',
    icon: '👥',
  },
  {
    category: 'Travel & Rides',
    amount: 310.80,
    percentage: 6,
    color: '#14B8A6',
    icon: '✈️',
  },
];

export const mockMonthlyStats = {
  totalSpent: 5150.50,
  totalIncome: 11700.00,
  savings: 6549.50,
  monthlyChange: '+18.4% vs last month',
  weeklyData: [
    { day: 'Mon', spent: 120, income: 400 },
    { day: 'Tue', spent: 450, income: 0 },
    { day: 'Wed', spent: 890, income: 3200 },
    { day: 'Thu', spent: 310, income: 0 },
    { day: 'Fri', spent: 2500, income: 8500 },
    { day: 'Sat', spent: 680, income: 0 },
    { day: 'Sun', spent: 200, income: 0 },
  ],
};
