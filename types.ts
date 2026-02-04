
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
  registrationDate: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  password: string; 
  pin: string; 
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  avatar?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
  module: string;
}

export interface EmailSettings {
  adminEmail: string;
  smtpHost?: string;
  smtpUser?: string;
  smtpPass?: string;
  notifyAdminOnNewReg: boolean;
  notifyUserOnStatusChange: boolean;
  notifySecurityAlerts: boolean;
}

export interface UserSettings {
  currency: string;
  darkMode: boolean;
  activeAccountId: string;
  companyName: string;
  inventoryCategories: string[];
  remoteDbConnected: boolean;
  pricingRules: {
    fixedOverhead: number;
    variableOverheadPercent: number;
    platformFeePercent: number;
    targetMarginPercent: number;
    autoApply: boolean;
    customAdjustments: any[];
  };
  cloud: {
    scriptUrl: string;
    remoteConfigUrl?: string;
    autoSync: boolean;
    isConnected: boolean;
  };
  email: EmailSettings;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  categories: string[]; 
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  imageUrl?: string; 
}

export interface Entity {
  id: string;
  companyId: string;
  name: string;
  type: 'CLIENT' | 'VENDOR';
  email?: string;
  phone?: string;
  balance: number; 
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  companyId: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  note: string;
  accountId: string;
  toAccountId?: string; 
  entityId?: string; 
  productId?: string; 
  quantity?: number; 
  cart?: CartItem[];
  paymentStatus: 'PAID' | 'CREDIT';
  createdBy: string; 
  syncStatus: 'SYNCED' | 'PENDING';
  version: number; 
  updatedAt: string;
}

export interface Account {
  id: string;
  companyId: string;
  name: string;
  balance: number;
  color: string;
  type: 'CASH' | 'BANK' | 'CREDIT';
}

export type Tab = 'dashboard' | 'ledger' | 'inventory' | 'parties' | 'add' | 'reports' | 'admin' | 'settings' | 'users' | 'logs';

export const DEFAULT_CATEGORIES: Record<TransactionType, string[]> = {
  [TransactionType.EXPENSE]: ['Inventory Purchase', 'Marketing', 'Payroll', 'Rent/Office', 'Shipping', 'Utilities'],
  [TransactionType.INCOME]: ['Product Sales', 'Service Revenue', 'Consulting', 'Interest'],
  [TransactionType.TRANSFER]: ['Internal Transfer']
};

export const DEFAULT_PRODUCT_CATEGORIES = ['Electronics', 'Apparel', 'Grocery', 'Services'];

export const CURRENCIES = [
  { code: 'PKR', symbol: 'Rs.' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' }
];
