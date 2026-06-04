import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { salaryIngestionSchema } from '../../../lib/validations/salary';
import { Level } from '@prisma/client'; // Make sure this is imported at the top of the file


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

    // 1. Hard-strip any client-submitted total_compensation parameter
    if ('total_compensation' in body) delete body.total_compensation;
    if ('totalCompensation' in body) delete body.totalCompensation;

    // 2. Structural data verification via Zod validation schema
    const result = salaryIngestionSchema.safeParse(body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const fieldName = firstIssue.path[0]?.toString() || 'unknown';

      return NextResponse.json(
        {
          error: true,
          field: fieldName,
          message: firstIssue.message,
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // 3. Normalization pipeline: lowercase + trim + strip punctuation
    const cleanCompanyName = data.companyName.trim();
    const normalizedName = cleanCompanyName
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Strip punctuation characters
      .replace(/\s{2,}/g, " "); // Collapse duplicate spacing instances

    const generatedCompanySlug = normalizedName.replace(/\s+/g, "-");

    // 4. Find or create the target Company normalization group record
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

    // 5. Calculate total compensation safely at the application boundary using BigInt
    const calculatedTotalComp = data.baseSalary + data.bonus + data.stock;

    // 6. Deduplication Check (Stage 5 Ruleset)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const conflictingRecord = await prisma.salary.findFirst({
      where: {
        companyId: company.id,
        role: data.role,
        level: data.level as Level, // <-- Explicitly tell TypeScript this matches your database enum rules        location: data.location,
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
        return NextResponse.json(
          {
            error: true,
            message: "Duplicate record detected. An identical entry exists within a 10% salary variance window posted in the past 48 hours.",
          },
          { status: 409 }
        );
      }
    }

    // 7. Insert the fully validated and calculated record into our Neon database
    const savedRecord = await prisma.salary.create({
      data: {
        companyId: company.id,
        role: data.role,
        level: data.level as Level, // <-- Explicitly tell TypeScript this matches your database enum rules        
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

    // 8. Return a 201 Created status containing our safe serialized record data
    return NextResponse.json(serializeBigInt(savedRecord), { status: 201 });

  } catch (error: any) {
    console.error("Ingestion pipeline failure:", error);
    return NextResponse.json(
      { error: true, message: error.message || "Internal ingestion server runtime failure" },
      { status: 500 }
    );
  }
}