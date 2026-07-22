import { COMMISSION_RATE, CURRENCY_SYMBOL } from '../config/commission';

/**
 * Calculates commission amount based on order amount and global COMMISSION_RATE.
 * Formula: commission = (orderAmount * COMMISSION_RATE) / 100
 */
export const calculateCommission = (
  orderAmount: number,
  rate: number = COMMISSION_RATE
): number => {
  if (isNaN(orderAmount) || orderAmount <= 0) return 0;
  return (orderAmount * rate) / 100;
};

/**
 * Formats monetary amounts to 2 decimal places with currency symbol.
 * Example: 100 -> ₹100.00
 */
export const formatCurrency = (
  amount: number,
  symbol: string = CURRENCY_SYMBOL
): string => {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `${symbol}${safeAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Returns complete commission breakdown details for a given order amount.
 */
export interface CommissionBreakdown {
  orderAmount: number;
  rate: number;
  commissionAmount: number;
  formattedOrderAmount: string;
  formattedCommission: string;
  netPayout: number;
  formattedNetPayout: string;
}

export const getCommissionBreakdown = (
  orderAmount: number,
  rate: number = COMMISSION_RATE
): CommissionBreakdown => {
  const commissionAmount = calculateCommission(orderAmount, rate);
  const netPayout = orderAmount - commissionAmount;

  return {
    orderAmount,
    rate,
    commissionAmount,
    formattedOrderAmount: formatCurrency(orderAmount),
    formattedCommission: formatCurrency(commissionAmount),
    netPayout,
    formattedNetPayout: formatCurrency(netPayout),
  };
};
