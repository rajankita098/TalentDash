import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const salaries = company.salaries;
    const count = salaries.length;

    const getMedian = (values: number[]) => {
      if (values.length === 0) return 0;
      values.sort((a, b) => a - b);
      const half = Math.floor(values.length / 2);
      if (values.length % 2 !== 0) return values[half];
      return (values[half - 1] + values[half]) / 2.0;
    };

    const medianBase = getMedian(salaries.map((s) => Number(s.baseSalary)));
    const medianStock = getMedian(salaries.map((s) => Number(s.stock)));
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
      salaries: salaries.map(s => ({
        id: s.id,
        role: s.role,
        level: s.level,
        location: s.location,
        currency: s.currency,
        experienceYears: s.experienceYears,
        baseSalary: s.baseSalary.toString(),
        stock: s.stock.toString(),
        totalCompensation: s.totalCompensation.toString(),
      }))
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