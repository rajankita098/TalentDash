import { Level, Currency, Source } from '@prisma/client';
import { prisma } from '../lib/prisma'; // Imports your configured client singleton

// Helper utility to safely generate a uniform, clean slug from erratic company strings
function generateSlug(name: string): string {
  let cleaned = name.toLowerCase().trim();
  // Strip out regional suffixes to normalize variations like "Google India" to "google"
  cleaned = cleaned.replace(/\b(india|technologies|solutions|inc|ltd|limited|corp)\b/g, '');
  return cleaned.trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface RawSalarySeed {
  companyName: string;
  industry: string;
  headquarters: string;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experienceYears: number;
  baseSalary: number;
  bonus: number;
  stock: number;
}

const SEED_RECORDS: RawSalarySeed[] = [
  // --- 1. DEMONSTRATING SLUG NORMALIZATION ---
  { companyName: "Google India", industry: "Technology", headquarters: "Mountain View, CA", role: "Software Engineer", level: Level.L4, location: "Bengaluru", currency: Currency.INR, experienceYears: 3, baseSalary: 2800000, bonus: 400000, stock: 600000 },
  { companyName: "GOOGLE", industry: "Technology", headquarters: "Mountain View, CA", role: "Site Reliability Engineer", level: Level.L5, location: "Hyderabad", currency: Currency.INR, experienceYears: 5, baseSalary: 4200000, bonus: 500000, stock: 900000 },
  { companyName: "google", industry: "Technology", headquarters: "Mountain View, CA", role: "Product Manager", level: Level.L3, location: "San Francisco", currency: Currency.USD, experienceYears: 1, baseSalary: 140000, bonus: 15000, stock: 30000 },

  // --- 2. REQUIRED INTENTIONAL CONTRACT EDGE CASES ---
  { companyName: "Meta", industry: "Technology", headquarters: "Menlo Park, CA", role: "Production Engineer", level: Level.L5, location: "London", currency: Currency.GBP, experienceYears: 6, baseSalary: 110000, bonus: 0, stock: 65000 }, // EDGE CASE: Zero Bonus
  { companyName: "Amazon", industry: "E-Commerce", headquarters: "Seattle, WA", role: "SDE II", level: Level.SDE_II, location: "Mumbai", currency: Currency.INR, experienceYears: 4, baseSalary: 3400000, bonus: 800000, stock: 0 }, // EDGE CASE: Zero Stock
  { companyName: "NVIDIA", industry: "Semiconductors", headquarters: "Santa Clara, CA", role: "ASIC Engineer", level: Level.IC5, location: "Pune", currency: Currency.INR, experienceYears: 8, baseSalary: 5500000, bonus: 900000, stock: 4500000 }, // EDGE CASE: Very High Equity
  { companyName: "Microsoft", industry: "Technology", headquarters: "Redmond, WA", role: "Partner Architect", level: Level.PRINCIPAL, location: "Bengaluru", currency: Currency.INR, experienceYears: 16, baseSalary: 9500000, bonus: 2500000, stock: 6000000 }, // EDGE CASE: Principal Level

  // --- 3. FILLING REMAINING TARGET COMPANIES & MULTI-CITY FOOTPRINT ---
  // Flipkart
  { companyName: "Flipkart", industry: "E-Commerce", headquarters: "Bengaluru, India", role: "SDE I", level: Level.SDE_I, location: "Bengaluru", currency: Currency.INR, experienceYears: 1, baseSalary: 1800000, bonus: 200000, stock: 150000 },
  { companyName: "Flipkart", industry: "E-Commerce", headquarters: "Bengaluru, India", role: "SDE III", level: Level.SDE_III, location: "Bengaluru", currency: Currency.INR, experienceYears: 7, baseSalary: 4800000, bonus: 600000, stock: 800000 },
  
  // Meesho
  { companyName: "Meesho", industry: "E-Commerce", headquarters: "Bengaluru, India", role: "SDE II", level: Level.SDE_II, location: "Bengaluru", currency: Currency.INR, experienceYears: 3, baseSalary: 2600000, bonus: 300000, stock: 400000 },
  { companyName: "Meesho", industry: "E-Commerce", headquarters: "Bengaluru, India", role: "SDE I", level: Level.SDE_I, location: "Mumbai", currency: Currency.INR, experienceYears: 1, baseSalary: 1400000, bonus: 150000, stock: 100000 },

  // Razorpay
  { companyName: "Razorpay", industry: "Fintech", headquarters: "Bengaluru, India", role: "Software Engineer", level: Level.L4, location: "Pune", currency: Currency.INR, experienceYears: 3, baseSalary: 2400000, bonus: 250000, stock: 300000 },
  { companyName: "Razorpay", industry: "Fintech", headquarters: "Bengaluru, India", role: "Engineering Manager", level: Level.STAFF, location: "Bengaluru", currency: Currency.INR, experienceYears: 9, baseSalary: 5200000, bonus: 800000, stock: 1000000 },

  // Zepto
  { companyName: "Zepto", industry: "Quick-Commerce", headquarters: "Mumbai, India", role: "SDE II", level: Level.SDE_II, location: "Mumbai", currency: Currency.INR, experienceYears: 4, baseSalary: 3200000, bonus: 400000, stock: 500000 },
  { companyName: "Zepto", industry: "Quick-Commerce", headquarters: "Mumbai, India", role: "SDE I", level: Level.SDE_I, location: "Delhi", currency: Currency.INR, experienceYears: 2, baseSalary: 2000000, bonus: 200000, stock: 200000 },

  // TCS
  { companyName: "TCS", industry: "IT Services", headquarters: "Mumbai, India", role: "System Engineer", level: Level.L3, location: "Pune", currency: Currency.INR, experienceYears: 2, baseSalary: 450000, bonus: 40000, stock: 0 },
  { companyName: "TCS", industry: "IT Services", headquarters: "Mumbai, India", role: "Technical Lead", level: Level.L5, location: "Delhi", currency: Currency.INR, experienceYears: 8, baseSalary: 1400000, bonus: 100000, stock: 0 },

  // Infosys
  { companyName: "Infosys", industry: "IT Services", headquarters: "Bengaluru, India", role: "Systems Engineer", level: Level.L3, location: "Hyderabad", currency: Currency.INR, experienceYears: 1, baseSalary: 400000, bonus: 35000, stock: 0 },
  { companyName: "Infosys", industry: "IT Services", headquarters: "Bengaluru, India", role: "Technology Architect", level: Level.STAFF, location: "Bengaluru", currency: Currency.INR, experienceYears: 11, baseSalary: 2200000, bonus: 200000, stock: 150000 },

  // Wipro
  { companyName: "Wipro", industry: "IT Services", headquarters: "Bengaluru, India", role: "Project Manager", level: Level.L5, location: "Pune", currency: Currency.INR, experienceYears: 9, baseSalary: 1600000, bonus: 120000, stock: 0 }
];

// Dynamically scale the remaining layout up to 60+ entries to generate real statistical spreads
const targets = ["Google", "Amazon", "Meta", "Microsoft", "Flipkart", "Meesho", "NVIDIA", "TCS", "Infosys", "Wipro", "Razorpay", "Zepto"];
const roles = ["Software Engineer", "Backend Developer", "Frontend Architect", "Data Scientist", "DevOps Engineer"];
const cities = ["Bengaluru", "Mumbai", "Hyderabad", "Pune", "Delhi", "San Francisco", "London"];
const levels = [Level.L3, Level.L4, Level.L5, Level.L6, Level.SDE_I, Level.SDE_II, Level.SDE_III];

// Look for this loop starting around line 50
for (let i = 0; i < 45; i++) {
  const comp = targets[i % targets.length];
  const loc = cities[i % cities.length];
  const isUSorUK = loc === "San Francisco" || loc === "London";
  const curr = isUSorUK ? (loc === "London" ? Currency.GBP : Currency.USD) : Currency.INR;
  
  const basePrice = isUSorUK ? 100000 + (i * 1500) : 600000 + (i * 80000);
  const bonusPrice = isUSorUK ? 10000 + (i * 300) : 50000 + (i * 10000);
  const stockPrice = isUSorUK ? 20000 + (i * 800) : 50000 + (i * 15000);

  SEED_RECORDS.push({
    companyName: comp,
    industry: "Technology",
    headquarters: "Global Office",
    role: roles[i % roles.length],
    level: levels[i % levels.length],
    location: loc,
    currency: curr,
    // Change ONLY this line right here to match exactly:
    experienceYears: (i % 8) + 1, 
    baseSalary: Math.floor(basePrice),
    bonus: Math.floor(bonusPrice),
    stock: Math.floor(stockPrice)
  });
}

async function main() {
  console.log("Starting transactional pipeline seed data insertion...");

  for (const record of SEED_RECORDS) {
    const calculatedSlug = generateSlug(record.companyName);
    
    // Normalize and display base display name (Capitalize first letter)
    const formalName = record.companyName.toLowerCase() === 'google' 
      ? "Google India" 
      : record.companyName;

    // 1. Upsert parent company based on slug uniqueness to ensure normalization
    const company = await prisma.company.upsert({
      where: { slug: calculatedSlug },
      update: {},
      create: {
        name: formalName,
        slug: calculatedSlug,
        normalizedName: calculatedSlug,
        industry: record.industry,
        headquarters: record.headquarters,
        headcountRange: "10000+",
        foundedYear: 2000,
      },
    });

    // 2. Compute true total compensation sum
    const totalComp = BigInt(record.baseSalary) + BigInt(record.bonus) + BigInt(record.stock);

    await prisma.salary.create({
      data: {
        company: {
          connect: { id: company.id }
        },
        role: record.role,
        level: record.level,
        location: record.location.toLowerCase(),
        currency: record.currency,
        experienceYears: record.experienceYears,
        baseSalary: BigInt(record.baseSalary),
        bonus: BigInt(record.bonus),
        stock: BigInt(record.stock),
        totalCompensation: totalComp,
        source: Source.SCRAPED,
        confidenceScore: 0.95,
        isVerified: true,
        submittedAt: new Date() // Explicitly provides the required timestamp fallback
      },
    });
  }

  console.log(`Successfully completed seeding. Registered ${SEED_RECORDS.length} records cleanly.`);
}

main()
  .catch((e) => {
    console.error("Execution aborted due to seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });