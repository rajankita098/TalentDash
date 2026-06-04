export type Level = 'L3' | 'L4' | 'L5' | 'L6' | 'SDE_I' | 'SDE_II' | 'SDE_III' | 'STAFF' | 'PRINCIPAL' | 'IC3' | 'IC4' | 'IC5';
export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR';
export type Source = 'USER_SUBMITTED' | 'SCRAPED' | 'ANONYMOUS';

export interface CompanyMetadata {
  id: string;
  name: string;
  slug: string;
  industry: string;
  headquarters: string;
  foundedYear: number;
  headcountRange: string;
}

export interface SalaryRecord {
  id: string;
  companyId: string;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experienceYears: number;
  baseSalary: string | number;
  bonus: string | number;
  stock: string | number;
  totalCompensation: string | number;
  source: Source;
  confidenceScore: number;
  isVerified: boolean;
  submittedAt: string;
  company?: CompanyMetadata;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedSalariesResponse {
  data: SalaryRecord[];
  meta: PaginationMeta;
}