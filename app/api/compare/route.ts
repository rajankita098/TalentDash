import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple regex utility to safely identify true PostgreSQL UUID patterns
const isUUID = (val: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const s1 = searchParams.get('s1')?.trim();
    const s2 = searchParams.get('s2')?.trim();

    // 1. Edge Case Guard: Ensure both components are selected and not left on a placeholder drop-down node
    if (!s1 || !s2 || s1 === 'none' || s2 === 'none' || s1 === '' || s2 === '') {
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: "Comparison Selection Incomplete: Please select two different records or companies to calculate performance deltas." 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Identity Protection Check: Direct query string value collision match
    if (s1.toLowerCase() === s2.toLowerCase()) {
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: "Identity Protection: Cannot compare a company or salary profile directly against itself. Please select a different entity." 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let record1: any = null;
    let record2: any = null;

    // --- SMART RESOLUTION PIPELINE FOR DATA MATRICES ---
    
    // Fetch Node 1
    if (isUUID(s1)) {
      record1 = await prisma.salary.findUnique({
        where: { id: s1 },
        include: { company: true }
      });
    } else {
      record1 = await prisma.salary.findFirst({
        where: { 
          company: { 
            slug: { equals: s1, mode: 'insensitive' } 
          } 
        },
        include: { company: true },
        orderBy: { totalCompensation: 'desc' }
      });
    }

    // Fetch Node 2
    if (isUUID(s2)) {
      record2 = await prisma.salary.findUnique({
        where: { id: s2 },
        include: { company: true }
      });
    } else {
      record2 = await prisma.salary.findFirst({
        where: { 
          company: { 
            slug: { equals: s2, mode: 'insensitive' } 
          } 
        },
        include: { company: true },
        orderBy: { totalCompensation: 'desc' }
      });
    }

    // 3. Post-Fetch Cross-Validation: Check if the separate database lookups resolved to the same corporate ID node
    if (record1 && record2 && record1.companyId === record2.companyId) {
      return new Response(
        JSON.stringify({
          error: true,
          message: "Identity Protection: Both selection tracks point to the same company node profile. Please choose a different company to run a true variance calculation."
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Validate findings before computing deltas
    if (!record1 || !record2) {
      return new Response(
        JSON.stringify({ 
          error: true, 
          message: "One or both comparative records could not be located in Neon PostgreSQL matching those criteria strings." 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
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
          stock: (record1.stock || 0n).toString(),
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
          stock: (record2.stock || 0n).toString(),
          totalCompensation: record2.totalCompensation.toString(),
          company: record2.company
        }
      }
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Comparison utility failure:", error);
    return new Response(
      JSON.stringify({ error: true, message: "Internal Server Error parsing delta vectors" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}