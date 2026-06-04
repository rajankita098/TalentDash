import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Level, Currency } from '@/types';
import { CURRENCY_CONFIG } from '@/lib/currency-config';
import { ChevronLeft, ChevronRight, RotateCcw, SlidersHorizontal } from 'lucide-react';
import SalaryFilters from '@/components/SalaryFilters';

interface PageProps {
  searchParams: Promise<{
    company?: string;
    role?: string;
    level?: string;
    location?: string;
    currency?: string;
    direction?: string;
    page?: string;
  }>;
}

// --- F6 PERFORMANCE: PURE SERVER-SIDE RENDERING (SHIPS 0 BYTES CLIENT JAVASCRIPT BY DEFAULT) ---
export default async function SalariesDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const currentCompany = params.company || '';
  const currentRole = params.role || 'ALL';
  const currentLocation = params.location || 'ALL';
  const currentCurrency = (params.currency as Currency) || 'INR';
  const sortDirection = (params.direction as 'asc' | 'desc') || 'desc';
  const currentPage = Number(params.page) || 1;
  const rowsPerPage = 25;

  const currentLevels = params.level ? params.level.split(',') : [];

  // 1. Fetch Dynamic Seed Lookups to Populate Options Elements on the Server
  const allSalariesData = await prisma.salary.findMany({ select: { role: true, location: true, level: true } });
  const availableRoles = Array.from(new Set(allSalariesData.map((s) => s.role)));
  const availableLocations = Array.from(new Set(allSalariesData.map((s) => s.location)));
  const availableLevels: Level[] = ['L3', 'SDE_I', 'L4', 'SDE_II', 'L5', 'SDE_III', 'L6', 'STAFF', 'PRINCIPAL'];

  // 2. Build Prisma Filter Options Mapping Group
  const queryConditions: any = {};
  if (currentCompany) {
    queryConditions.company = { name: { contains: currentCompany, mode: 'insensitive' } };
  }
  if (currentRole !== 'ALL') {
    queryConditions.role = currentRole;
  }
  if (currentLocation !== 'ALL') {
    queryConditions.location = { equals: currentLocation, mode: 'insensitive' };
  }
  if (currentLevels.length > 0) {
    queryConditions.level = { in: currentLevels as Level[] };
  }

  const rawRecords = await prisma.salary.findMany({
    where: queryConditions,
    include: { company: true },
  });

  // 3. Process Currency Values Contextually On The Server Boundary
  let processedRecords = rawRecords.map((record) => {
    if (record.currency === currentCurrency) {
      return {
        ...record,
        baseSalary: Number(record.baseSalary),
        stock: Number(record.stock || 0),
        totalCompensation: Number(record.totalCompensation),
      };
    }
    const rate = currentCurrency === 'USD' ? CURRENCY_CONFIG.INR_TO_USD : CURRENCY_CONFIG.USD_TO_INR;
    return {
      ...record,
      currency: currentCurrency,
      baseSalary: Math.round(Number(record.baseSalary) * rate),
      stock: Math.round(Number(record.stock || 0) * rate),
      totalCompensation: Math.round(Number(record.totalCompensation) * rate),
    };
  });

  // Sort compensation ranks
  processedRecords.sort((a, b) => {
    return sortDirection === 'desc' 
      ? b.totalCompensation - a.totalCompensation 
      : a.totalCompensation - b.totalCompensation;
  });

  const totalRecords = processedRecords.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRecords = processedRecords.slice(startIndex, startIndex + rowsPerPage);

  const getLevelBadgeStyles = (level: string) => {
    const tier = level.toUpperCase();
    if (tier === 'L3' || tier === 'SDE_I') return 'bg-slate-100 text-slate-800 border-slate-200';
    if (tier === 'L4' || tier === 'SDE_II') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (tier === 'L5' || tier === 'SDE_III') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (tier === 'L6' || tier === 'STAFF') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-amber-950 text-amber-100 border-amber-900';
  };

  const formatMoney = (val: number, currency: Currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 selection:bg-sky-500/20">
      
      {/* F5 SEO: Hidden Machine Structured Schema Matrix */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": "Global Tech Talent Salaries Ledger Matrix",
            "description": "Aggregated data nodes tracking base, stock, and total compensation allocations for software engineers globally.",
            "url": "http://localhost:3000/salaries",
            "spatialCoverage": "Global",
            "temporalCoverage": "2026",
            "variableMeasured": ["Base Salary", "Stock Options", "Total Compensation"]
          })
        }}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* PLATFORM BANNERS */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Global Tech Talent Ledger</h1>
            <p className="text-sm text-slate-500 mt-1">Explore verified, cross-market software engineering compensation data nodes.</p>
          </div>

          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300 self-start md:self-auto shadow-sm">
            <Link href={`/salaries?currency=INR`} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${currentCurrency === 'INR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>INR (₹)</Link>
            <Link href={`/salaries?currency=USD`} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${currentCurrency === 'USD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>USD ($)</Link>
          </div>
        </div>

        {/* COMPONENT RE-INJECTION: PASS DYNAMIC HANDSHAKE PARAMS DOWN */}
        <SalaryFilters
          availableRoles={availableRoles}
          availableLocations={availableLocations}
          availableLevels={availableLevels}
          currentCompany={currentCompany}
          currentRole={currentRole}
          currentLocation={currentLocation}
          currentLevels={currentLevels}
          key={`filters-${currentCurrency}`}
        />

        {totalRecords === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <SlidersHorizontal size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Query Matches Located</h3>
            <Link href="/salaries" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold">Clear Active Filters</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* F6 PERFORMANCE: PRESERVE EXACT CONTAINER HEIGHT SPECIFICATION HIDING HYDRATION JUMP CLS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto min-h-[580px]">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[11px] font-bold tracking-wider uppercase select-none">
                      <th className="px-5 py-4">Company</th>
                      <th className="px-5 py-4">Role</th>
                      <th className="px-5 py-4">Level</th>
                      <th className="px-5 py-4">Location</th>
                      <th className="px-5 py-4 text-center">Experience</th>
                      <th className="px-5 py-4 text-right">Base Salary</th>
                      <th className="px-5 py-4 text-right">Stock</th>
                      <th className="px-5 py-4 text-right text-sky-700 font-black border-l border-slate-200">
                        <Link href={`/salaries?direction=${sortDirection === 'desc' ? 'asc' : 'desc'}`}>
                          Total Comp {sortDirection === 'desc' ? '▼' : '▲'}
                        </Link>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                    {paginatedRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                          <Link href={`/companies/${record.company?.slug}`} className="hover:text-sky-600 transition-colors">
                            {record.company?.name || '—'}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{record.role}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-wide border uppercase ${getLevelBadgeStyles(record.level)}`}>
                            {record.level.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 capitalize whitespace-nowrap">{record.location}</td>
                        <td className="px-5 py-4 text-center text-slate-600 font-mono whitespace-nowrap">{record.experienceYears} yrs</td>
                        <td className="px-5 py-4 text-right font-mono text-slate-600 whitespace-nowrap">{formatMoney(record.baseSalary, currentCurrency)}</td>
                        <td className="px-5 py-4 text-right font-mono text-slate-400 whitespace-nowrap">{record.stock > 0 ? formatMoney(record.stock, currentCurrency) : '—'}</td>
                        <td className="px-5 py-4 text-right font-mono text-base font-black text-[#0369A1] whitespace-nowrap bg-sky-50/30 border-l border-slate-100">
                          {formatMoney(record.totalCompensation, currentCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SERVER NAVIGATION LINKS */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm select-none">
              <span className="text-xs text-slate-500 font-medium">
                Showing <strong className="text-slate-800 font-bold">{startIndex + 1}–{Math.min(startIndex + rowsPerPage, totalRecords)}</strong> of <strong className="text-slate-800 font-bold">{totalRecords}</strong> records
              </span>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link href={`/salaries?page=${Math.max(currentPage - 1, 1)}`} className={`p-2 border border-slate-200 hover:bg-slate-50 rounded-xl ${currentPage === 1 ? 'pointer-events-none opacity-40' : ''}`}><ChevronLeft size={16} /></Link>
                <span className="text-xs font-bold text-slate-600 px-2">Page {currentPage} of {totalPages}</span>
                <Link href={`/salaries?page=${Math.min(currentPage + 1, totalPages)}`} className={`p-2 border border-slate-200 hover:bg-slate-50 rounded-xl ${currentPage === totalPages ? 'pointer-events-none opacity-40' : ''}`}><ChevronRight size={16} /></Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}