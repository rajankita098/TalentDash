import { SalaryRecord } from '@/types';

export const MOCK_SALARIES: SalaryRecord[] = [];

const companies = [
  { name: 'Google India', slug: 'google-india', industry: 'Technology', headquarters: 'Mountain View, CA' },
  { name: 'Amazon', slug: 'amazon', industry: 'E-Commerce', headquarters: 'Seattle, WA' },
  { name: 'Meta', slug: 'meta', industry: 'Technology', headquarters: 'Menlo Park, CA' },
  { name: 'Microsoft', slug: 'microsoft', industry: 'Technology', headquarters: 'Redmond, WA' },
  { name: 'Flipkart', slug: 'flipkart', industry: 'E-Commerce', headquarters: 'Bengaluru, India' },
  { name: 'Meesho', slug: 'meesho', industry: 'E-Commerce', headquarters: 'Bengaluru, India' }
];

const roles = ['Software Engineer', 'Backend Developer', 'Frontend Architect', 'Data Scientist', 'DevOps Engineer'];
const cities = ['bengaluru', 'mumbai', 'hyderabad', 'pune', 'delhi', 'san francisco', 'london'];
const levels = ['L3', 'L4', 'L5', 'SDE_I', 'SDE_II', 'SDE_III'] as const;

// Programmatically scale up 55 clean mock items matching the exact contract types
for (let i = 1; i <= 55; i++) {
  const targetComp = companies[i % companies.length];
  const loc = cities[i % cities.length];
  const isUS = loc === 'san francisco' || loc === 'london';
  
  const base = isUS ? 110000 + (i * 1200) : 1200000 + (i * 70000);
  const bonus = isUS ? 12000 + (i * 200) : 100000 + (i * 8000);
  const stock = isUS ? 25000 + (i * 500) : 150000 + (i * 12000);
  const tc = base + bonus + stock;

  MOCK_SALARIES.push({
    id: `mock-uuid-string-token-${1000 + i}`,
    companyId: `mock-company-id-${i}`,
    role: roles[i % roles.length],
    level: levels[i % levels.length],
    location: loc,
    currency: isUS ? (loc === 'london' ? 'GBP' : 'USD') : 'INR',
    experienceYears: (i % 8) + 1,
    baseSalary: base.toString(),
    bonus: bonus.toString(),
    stock: stock.toString(),
    totalCompensation: tc.toString(),
    source: 'SCRAPED',
    confidenceScore: 0.95,
    isVerified: i % 3 === 0,
    submittedAt: new Date(2026, 5, 3 - (i % 10)).toISOString(),
    company: {
      id: `mock-company-id-${i}`,
      name: targetComp.name,
      slug: targetComp.slug,
      industry: targetComp.industry,
      headquarters: targetComp.headquarters,
      foundedYear: 2000,
      headcountRange: '10000+'
    }
  });
}