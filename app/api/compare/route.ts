import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple regex utility to safely identify true PostgreSQL UUID patterns
const isUUID = (val: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.nextUrl);
    const s1 = searchParams.get('s1');
    const s2 = searchParams.get('s2');

    // 1. Guard Clauses: Ensure parameters are active
    if (!s1 || !s2) {
      return NextResponse.json(
        { error: true, message: "Missing required query string identifiers s1 and s2" },
        { status: 400 }
      );
    }

    // 2. Identity Protection Check
    if (s1 === s2) {
      return NextResponse.json(
        { error: true, message: "Identity Protection: Cannot compare an item node against itself" },
        { status: 400 }
      );
    }

    let record1: any = null;
    let record2: any = null;

    // --- SMART RESOLUTION PIPELINE FOR DATA MATRIXES ---
    
    // Fetch Node 1 (Check if it's a UUID or a Company Slug)
    if (isUUID(s1)) {
      record1 = await prisma.salary.findUnique({
        where: { id: s1 },
        include: { company: true }
      });
    } else {
      // It's a corporate slug string (like 'flipkart')! Fetch its highest paying or first record entry.
      record1 = await prisma.salary.findFirst({
        where: { company: { slug: s1 } },
        include: { company: true },
        orderBy: { totalCompensation: 'desc' }
      });
    }

    // Fetch Node 2 (Check if it's a UUID or a Company Slug)
    if (isUUID(s2)) {
      record2 = await prisma.salary.findUnique({
        where: { id: s2 },
        include: { company: true }
      });
    } else {
      record2 = await prisma.salary.findFirst({
        where: { company: { slug: s2 } },
        include: { company: true },
        orderBy: { totalCompensation: 'desc' }
      });
    }

    // 4. Validate findings before computing deltas
    if (!record1 || !record2) {
      return NextResponse.json(
        { error: true, message: "One or both comparative records could not be located in Neon PostgreSQL" },
        { status: 404 }
      );
    }

    // 5. Structure payload neatly mapping BigInts to safe display strings
    const payload = {
      error: false,
      comparison: {
        record1: {
          id: record1.id,
          role: record1.role,
          level: record1.level,
          location: record1.location,
          currency: record1.currency,
          experienceYears: record1.experienceYears,
          baseSalary: record1.baseSalary.toString(),
          stock: record1.stock.toString(),
          totalCompensation: record1.totalCompensation.toString(),
          company: record1.company
        },
        record2: {
          id: record2.id,
          role: record2.role,
          level: record2.level,
          location: record2.location,
          currency: record2.currency,
          experienceYears: record2.experienceYears,
          baseSalary: record2.baseSalary.toString(),
          stock: record2.stock.toString(),
          totalCompensation: record2.totalCompensation.toString(),
          company: record2.company
        }
      }
    };

    return NextResponse.json(payload, { status: 200 });

  } catch (error: any) {
    console.error("Comparison utility failure:", error);
    return NextResponse.json(
      { error: true, message: "Internal Server Error parsing delta vectors" },
      { status: 500 }
    );
  }
}