
export enum TransactionType {
  INCOME = 'INCOME', // Revenue
  EXPENSE = 'EXPENSE', // Expenditure
  TRANSFER = 'TRANSFER' // Internal Transfer
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categories: string[]; // Updated to array for multiple tags
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
}

export interface Entity {
  id: string;
  name: string;
  type: 'CLIENT' | 'VENDOR';
  email?: string;
  phone?: string;
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
  productId?: string; // Linked product for inventory
  quantity?: number; // Quantity for inventory
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

export type Tab = 'dashboard' | 'ledger' | 'inventory' | 'add' | 'reports' | 'admin' | 'settings';

export const DEFAULT_CATEGORIES: Record<TransactionType, string[]> = {
  [TransactionType.EXPENSE]: [
    'Inventory Purchase',
    'Marketing',
    'Payroll',
    'Rent/Office',
    'Shipping',
    'Utilities'
  ],
  [TransactionType.INCOME]: [
    'Product Sales',
    'Service Revenue',
    'Consulting',
    'Interest'
  ],
  [TransactionType.TRANSFER]: [
    'Internal Transfer'
  ]
};

export const CURRENCIES = [
  { code: 'PKR', symbol: 'Rs.' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' }
];
