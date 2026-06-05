// app/api/salaries/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    let limit = parseInt(searchParams.get('limit') || '25', 10);
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    // --- Company filter: get matching company IDs first ---
    const companyQuery = searchParams.get('company');
    if (companyQuery && companyQuery.trim() !== '') {
      const matchingCompanies = await prisma.company.findMany({
        where: {
          name: {
            contains: companyQuery.trim(),
            mode: 'insensitive',
          },
        },
        select: { id: true },
      });
      const companyIds = matchingCompanies.map(c => c.id);
      if (companyIds.length === 0) {
        // No matching companies → return empty result immediately
        return Response.json({
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        });
      }
      where.companyId = { in: companyIds };
    }

    // --- Role filter ---
    const roleQuery = searchParams.get('role');
    if (roleQuery && roleQuery !== 'ALL') {
      where.role = roleQuery;
    }

    // --- Location filter ---
    const locationQuery = searchParams.get('location');
    if (locationQuery && locationQuery !== 'ALL') {
      where.location = locationQuery;
    }

    // --- Level filter ---
    const levelQuery = searchParams.get('level');
    if (levelQuery) {
      const levels = levelQuery.split(',');
      where.level = { in: levels };
    }

    // --- Currency filter ---
    const currencyQuery = searchParams.get('currency');
    if (currencyQuery) {
      where.currency = currencyQuery;
    }

    // --- Sorting ---
    let orderBy: any = { submittedAt: 'desc' };
    const direction = searchParams.get('direction');
    if (direction === 'asc') orderBy = { totalCompensation: 'asc' };
    if (direction === 'desc') orderBy = { totalCompensation: 'desc' };

    // --- Fetch salaries and total count ---
    const [salaries, total] = await Promise.all([
      prisma.salary.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true, slug: true, industry: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.salary.count({ where }),
    ]);

    // Serialize BigInt values
    const serialized = JSON.parse(
      JSON.stringify(salaries, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
    );

    return Response.json({
      data: serialized,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('API /salaries error:', error);
    return Response.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    );
  }
}