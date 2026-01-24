
export enum TransactionType {
  INCOME = 'INCOME', // Revenue
  EXPENSE = 'EXPENSE', // Expenditure
  TRANSFER = 'TRANSFER' // Internal Transfer
}

export interface Entity {
  id: string;
  name: string;
  type: 'CLIENT' | 'VENDOR';
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note: string;
  accountId: string;
  toAccountId?: string; // Destination for transfers
  entityId?: string; // Client or Vendor
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  color: string;
  type: 'CASH' | 'BANK' | 'CREDIT';
}

export interface UserSettings {
  currency: string;
  darkMode: boolean;
  activeAccountId: string;
  companyName: string;
}

export type Tab = 'dashboard' | 'ledger' | 'add' | 'reports' | 'admin' | 'settings';

export const DEFAULT_CATEGORIES: Record<TransactionType, string[]> = {
  [TransactionType.EXPENSE]: [
    'Cost of Goods', 
    'Marketing', 
    'Payroll', 
    'Software/SaaS', 
    'Rent/Office', 
    'Travel', 
    'Taxes', 
    'Utilities'
  ],
  [TransactionType.INCOME]: [
    'Service Revenue', 
    'Product Sales', 
    'Consulting', 
    'Interest', 
    'Other Revenue'
  ],
  [TransactionType.TRANSFER]: [
    'Internal Transfer'
  ]
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
  { code: 'INR', symbol: '₹' }
];
