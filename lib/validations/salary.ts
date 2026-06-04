import { z } from 'zod';

// Match the Prisma Enums exactly
export const LevelEnum = z.enum([
  'L3', 'L4', 'L5', 'L6', 'SDE_I', 'SDE_II', 'SDE_III', 
  'STAFF', 'PRINCIPAL', 'IC3', 'IC4', 'IC5'
]);

export const CurrencyEnum = z.enum(['INR', 'USD', 'GBP', 'EUR']);
export const SourceEnum = z.enum(['USER_SUBMITTED', 'SCRAPED', 'ANONYMOUS']);

export const salaryIngestionSchema = z.object({
  // Company properties for the initial lookup/creation sequence
  companyName: z.string().min(1, { message: "companyName is required" }),
  industry: z.string().min(1, { message: "industry is required" }),
  headquarters: z.string().min(1, { message: "headquarters is required" }),
  foundedYear: z.number().int().nullable().optional(),
  headcountRange: z.string().nullable().optional(),

  // Salary properties
  role: z.string().min(1, { message: "role is required" }),
  level: LevelEnum,
  location: z.string().min(1, { message: "location is required" }),
  currency: CurrencyEnum,
  
  // Cleaned up experienceYears parameter (Only defined once!)
  experienceYears: z.number({ message: "experienceYears must be a number" })
    .int()
    .gt(0, { message: "experience_years must be > 0" })
    .lt(51, { message: "experience_years must be < 51" }),
  
  // Handled as strings or numbers from JSON payload, parsed to BigInt safely
  baseSalary: z.union([z.number(), z.string()]).transform((val, ctx) => {
    try {
      const b = BigInt(val);
      if (b <= 0n) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "base_salary must be > 0" });
        return z.NEVER;
      }
      return b;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid base_salary format" });
      return z.NEVER;
    }
  }),
  bonus: z.union([z.number(), z.string()]).optional().default(0).transform((val) => {
    try { return BigInt(val); } catch { return 0n; }
  }),
  stock: z.union([z.number(), z.string()]).optional().default(0).transform((val) => {
    try { return BigInt(val); } catch { return 0n; }
  }),

  // Metadata pipeline constraints
  source: SourceEnum.default('SCRAPED'),
  confidenceScore: z.number().min(0.0).max(1.0).default(0.95), // Correct property name instead of duplicate experienceYears!
  isVerified: z.boolean().optional().default(false),
  submittedAt: z.any().optional().transform((val) => val ? new Date(val) : new Date())
});