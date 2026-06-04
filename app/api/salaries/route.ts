import { prisma } from '@/lib/prisma';

// Helper to serialize BigInt fields safely to JSON strings
function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Extract and normalize Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    let limit = parseInt(searchParams.get('limit') || '10', 10);
    if (limit > 100) limit = 100;
    if (limit < 1) limit = 25;
    const skip = (page - 1) * limit;

    // 2. Extract Filters
    const companyQuery = searchParams.get('company');
    const roleQuery = searchParams.get('role');
    const levelQuery = searchParams.get('level');
    const locationQuery = searchParams.get('location');
    const currencyQuery = searchParams.get('currency');
    const sortQuery = searchParams.get('sort') || 'date_desc';

    // 3. Construct Dynamic Prisma Where Clause
    const whereClause: any = {};

    if (companyQuery) {
      whereClause.company = {
        name: {
          contains: companyQuery,
          mode: 'insensitive',
        },
      };
    }

    if (roleQuery) {
      whereClause.role = {
        contains: roleQuery,
        mode: 'insensitive',
      };
    }

    if (locationQuery) {
      whereClause.location = {
        contains: locationQuery,
        mode: 'insensitive',
      };
    }

    if (levelQuery) {
      whereClause.level = levelQuery;
    }
    if (currencyQuery) {
      whereClause.currency = currencyQuery;
    }

    // 4. Sort Ordering
    let orderBy: any = { submittedAt: 'desc' };
    if (sortQuery === 'total_comp_desc') {
      orderBy = { totalCompensation: 'desc' };
    } else if (sortQuery === 'total_comp_asc') {
      orderBy = { totalCompensation: 'asc' };
    } else if (sortQuery === 'date_desc') {
      orderBy = { submittedAt: 'desc' };
    }

    // 5. Query data and count concurrently
    const [salaries, totalCount] = await Promise.all([
      prisma.salary.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              name: true,
              slug: true,
              industry: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.salary.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const payload = serializeBigInt({
      data: salaries,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    });

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
      },
    });
  } catch (error: any) {
    console.error('Query pipeline failure:', error);
    return new Response(
      JSON.stringify({ error: true, message: 'Internal directory lookup runtime failure' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}