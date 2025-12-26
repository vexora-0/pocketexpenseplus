export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  _id: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  note?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  pendingSync?: boolean;
  localId?: string;
}

export interface Budget {
  _id: string;
  category: string;
  limit: number;
  spent: number;
  userId: string;
  month: number;
  year: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
}

export interface MonthlyStats {
  totalSpent: number;
  categoryTotals: CategoryTotal[];
  insights: string[];
}

export const CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Others',
];

export const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Wallet'];

