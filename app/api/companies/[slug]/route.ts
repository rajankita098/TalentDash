import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define the shape of a salary object as returned by Prisma (simplified)
type SalaryShape = {
  id: string;
  role: string;
  level: string;
  location: string;
  currency: string;
  experienceYears: number;
  baseSalary: bigint;
  stock: bigint | null;
  totalCompensation: bigint;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const company = await prisma.company.findUnique({
      where: { slug },
      include: { salaries: true },
    });

    if (!company) {
      return new Response(
        JSON.stringify({ error: true, message: 'Company not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // --- COMPUTING TRUE MEDIAN NODES (SCHEMA SPECIFIC) ---
    const salaries = company.salaries as SalaryShape[]; // Type assertion
    const count = salaries.length;

    const getMedian = (values: number[]) => {
      if (values.length === 0) return 0;
      // Create a copy before sorting to avoid mutating the original array
      const sorted = [...values].sort((a, b) => a - b);
      const half = Math.floor(sorted.length / 2);
      if (sorted.length % 2 !== 0) return sorted[half];
      return (sorted[half - 1] + sorted[half]) / 2.0;
    };

    // Now 's' is implicitly typed as SalaryShape thanks to the assertion
    const medianBase = getMedian(salaries.map((s) => Number(s.baseSalary)));
    const medianStock = getMedian(salaries.map((s) => Number(s.stock ?? 0n)));
    const medianTotal = getMedian(salaries.map((s) => Number(s.totalCompensation)));

    const payload = {
      company: {
        name: company.name,
        slug: company.slug,
        industry: company.industry,
        headquarters: company.headquarters,
      },
      metrics: {
        count,
        medianBase,
        medianStock,
        medianTotal,
      },
      salaries: salaries.map((s) => ({
        id: s.id,
        role: s.role,
        level: s.level,
        location: s.location,
        currency: s.currency,
        experienceYears: s.experienceYears,
        baseSalary: s.baseSalary.toString(),
        stock: (s.stock ?? 0n).toString(),
        totalCompensation: s.totalCompensation.toString(),
      })),
    };

    // --- FS3 CRITICAL: ATTACH EXACT EDGE-PROXY CACHE-CONTROL HEADERS via standard Response ---
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // FS3 Rule: Cache at the Edge CDN for 1 hour, serve stale up to 24 hours while revalidating
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Company api pipeline failure:', error);

    return new Response(
      JSON.stringify({ error: true, message: 'Internal server error processing company parameters' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}