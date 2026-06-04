import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Salary } from '@prisma/client'; // Import the Prisma type

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

    const salaries: Salary[] = company.salaries; // Explicitly type the array
    const count = salaries.length;

    const getMedian = (values: number[]) => {
      if (values.length === 0) return 0;
      const sorted = [...values].sort((a, b) => a - b);
      const half = Math.floor(sorted.length / 2);
      if (sorted.length % 2 !== 0) return sorted[half];
      return (sorted[half - 1] + sorted[half]) / 2.0;
    };

    // Now TypeScript knows 's' is of type Salary
    const medianBase = getMedian(salaries.map((s) => Number(s.baseSalary)));
    const medianStock = getMedian(salaries.map((s) => Number(s.stock || 0n)));
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
        stock: (s.stock || 0n).toString(),
        totalCompensation: s.totalCompensation.toString(),
      }))
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error("Company api pipeline failure:", error);
    return new Response(
      JSON.stringify({ error: true, message: 'Internal server error processing company parameters' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
