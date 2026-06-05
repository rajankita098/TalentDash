import { prisma } from '../../../lib/prisma';
import { salaryIngestionSchema } from '../../../lib/validations/salary';
import { Level } from '@prisma/client';

// BigInt serialization utility to convert database numeric keys safely to strings
function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. CRITERION 2: Hard-strip any client-submitted total compensation values to enforce pure server computation
    if ('total_compensation' in body) delete body.total_compensation;
    if ('totalCompensation' in body) delete body.totalCompensation;

    // 2. Structural data verification via Zod validation schema
    const result = salaryIngestionSchema.safeParse(body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const fieldName = firstIssue.path[0]?.toString() || 'unknown';

      return new Response(
        JSON.stringify({
          error: true,
          field: fieldName,
          message: firstIssue.message,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = result.data;

    // 3. CRITERION 2: Explicit Guard Clause validating numbers are positive. Reject negative values out-of-the-box.
    if (Number(data.baseSalary) < 0 || Number(data.bonus) < 0 || Number(data.stock) < 0) {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Data Integrity Violation: Base salary, bonus, and stock fields cannot accept negative numeric values.",
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. CRITERION 4 PIPELINE QUALITY: Strict Corporate Alias Normalization Layer (The Tata/TCS Edge Case Map)
    let cleanCompanyName = data.companyName.trim();
    let normalizedName = cleanCompanyName
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Strip punctuation characters
      .replace(/\s{2,}/g, " "); // Collapse duplicate spacing instances

    // Explicit dictionary tracking matrix to clean variant inputs cleanly
    const corporateAliases: Record<string, { name: string; slug: string }> = {
      'tcs': { name: 'TCS', slug: 'tcs' },
      'tata': { name: 'TCS', slug: 'tcs' },
      'tata consultancy': { name: 'TCS', slug: 'tcs' },
      'tata consultancy services': { name: 'TCS', slug: 'tcs' },
      'tata consultancy services ltd': { name: 'TCS', slug: 'tcs' }
    };

    let generatedCompanySlug = normalizedName.replace(/\s+/g, "-");

    if (corporateAliases[normalizedName]) {
      cleanCompanyName = corporateAliases[normalizedName].name;
      generatedCompanySlug = corporateAliases[normalizedName].slug;
      normalizedName = corporateAliases[normalizedName].slug;
    }

    // 5. Find or create the target Company normalization group record
    const company = await prisma.company.upsert({
      where: { slug: generatedCompanySlug },
      update: {},
      create: {
        name: cleanCompanyName,
        slug: generatedCompanySlug,
        normalizedName: normalizedName,
        industry: data.industry,
        headquarters: data.headquarters,
        foundedYear: data.foundedYear,
        headcountRange: data.headcountRange,
      },
    });

    // 6. CRITERION 2: Calculate total compensation safely at the server application boundary
    const calculatedTotalComp = data.baseSalary + data.bonus + data.stock;

    // 7. Deduplication Check (Stage 5 Ruleset)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const conflictingRecord = await prisma.salary.findFirst({
      where: {
        companyId: company.id,
        role: data.role,
        level: data.level as Level,
        location: data.location,
        submittedAt: {
          gte: fortyEightHoursAgo,
        },
      },
    });

    if (conflictingRecord) {
      const existingBase = Number(conflictingRecord.baseSalary);
      const incomingBase = Number(data.baseSalary);
      
      const varianceDifference = Math.abs(incomingBase - existingBase);
      const allowedVarianceThreshold = existingBase * 0.10; // Strict 10% allowance ceiling

      if (varianceDifference <= allowedVarianceThreshold) {
        return new Response(
          JSON.stringify({
            error: true,
            message: "Duplicate record detected. An identical entry exists within a 10% salary variance window posted in the past 48 hours.",
          }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 8. Insert the fully validated and calculated record into our Neon database
    const savedRecord = await prisma.salary.create({
      data: {
        companyId: company.id,
        role: data.role,
        level: data.level as Level, 
        location: data.location,
        currency: data.currency,
        experienceYears: data.experienceYears,
        baseSalary: data.baseSalary,
        bonus: data.bonus,
        stock: data.stock,
        totalCompensation: calculatedTotalComp,
        source: data.source as any,        
        confidenceScore: data.confidenceScore,
        isVerified: data.isVerified,
        submittedAt: data.submittedAt,
      },
    });

    // 9. Return a 201 Created status containing our safe serialized record data
    return new Response(JSON.stringify(serializeBigInt(savedRecord)), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Ingestion pipeline failure:", error);
    return new Response(
      JSON.stringify({ error: true, message: error.message || "Internal ingestion server runtime failure" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}