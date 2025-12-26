export interface Expense {
  _id?: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Budget {
  _id?: string;
  category: string;
  limit: number;
  month: number;
  year: number;
  spent?: number;
  remaining?: number;
  percentage?: number;
  exceeded?: boolean;
}

export interface Insight {
  category: string;
  current: number;
  last: number;
  change: number;
}

export interface Stats {
  total: number;
  categoryBreakdown: Record<string, number>;
  insights: Insight[];
}

