import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Currency } from '@/types';
import Image from 'next/image';
import {
  Building2, MapPin, Briefcase, Calendar, Users,
  ArrowLeftRight, ArrowUpRight, TrendingUp, HelpCircle
} from 'lucide-react';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. DYNAMIC METADATA GENERATION FOR CRAWLERS
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({ where: { slug } });

  if (!company) return {};

  const pageTitle = `Software Engineer Salaries at ${company.name} India — L3 to L5 | TalentDash`;
  const pageDesc = `See verified salary breakdown, base salary, stock options, total package arrays, and level distribution matrices for software engineering positions at ${company.name}.`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: `http://localhost:3000/companies/${slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: `http://localhost:3000/companies/${slug}`,
      type: 'website',
    }
  };
}

// --- FS3/F3: PRE-GENERATE STATIC PAGES FOR ALL REAL DATABASE COMPANIES AT BUILD TIME ---
export async function generateStaticParams() {
  const companies = await prisma.company.findMany({
    select: { slug: true },
  });

  return companies.map((c) => ({
    slug: c.slug,
  }));
}

// FS3: Instructs Next.js to dynamically render and cache pages added after the build time
export const dynamicParams = true;

export default async function CompanyProfilePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Direct Server-Side Query against real database nodes
  const companyData = await prisma.company.findUnique({
    where: { slug },
    include: { salaries: true },
  });

  if (!companyData) {
    notFound();
  }

  const salaries = companyData.salaries;
  const count = salaries.length;

  if (count === 0) {
    notFound();
  }

  // 2. Compute Mathematical Targets (Median, Minimum, and Maximum ranges)
  const getMedian = (values: number[]) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const half = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2.0;
  };

  const tcValues = salaries.map((s) => Number(s.totalCompensation));
  const medianTotal = getMedian(tcValues);
  const minTotal = Math.min(...tcValues);
  const maxTotal = Math.max(...tcValues);

  // 3. Level Distribution Map Calculations (Percentage calculation for horizontal bar layout)
  const distributionMap: Record<string, number> = {};
  salaries.forEach((s) => {
    distributionMap[s.level] = (distributionMap[s.level] || 0) + 1;
  });

  const levelOrder = ['L3', 'SDE_I', 'L4', 'SDE_II', 'L5', 'SDE_III', 'L6', 'STAFF', 'PRINCIPAL'];
  const presentLevels = Object.keys(distributionMap).sort(
    (a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b)
  );

  // Reusable custom badge helper matching F2 styles exactly
  const getLevelBadgeStyles = (level: string) => {
    const tier = level.toUpperCase();
    if (tier === 'L3' || tier === 'SDE_I') return 'bg-slate-100 text-slate-800 border-slate-200';
    if (tier === 'L4' || tier === 'SDE_II') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (tier === 'L5' || tier === 'SDE_III') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (tier === 'L6' || tier === 'STAFF') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-amber-950 text-amber-100 border-amber-900';
  };

  // Stacked horizontal distribution segment colors mapping tool
  const getLevelColorHex = (level: string) => {
    const tier = level.toUpperCase();
    if (tier === 'L3' || tier === 'SDE_I') return 'bg-slate-400';
    if (tier === 'L4' || tier === 'SDE_II') return 'bg-blue-500';
    if (tier === 'L5' || tier === 'SDE_III') return 'bg-indigo-500';
    if (tier === 'L6' || tier === 'STAFF') return 'bg-purple-500';
    return 'bg-amber-700';
  };

  const formatMoney = (val: number, currency: Currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 selection:bg-sky-500/20">
      {/* F5 SEO: MACHINE READABLE ENTITY SCHEMA */}
      <div className="relative w-16 h-16 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden p-2 shrink-0">

        <Image
          src={"https://www.svgrepo.com/show/530662/ribosome.svg"}
          alt={`${companyData.name} Corporate Visual Identifier Logo Mark`}
          width={48}         // Allocates correct baseline spatial pixel boundaries
          height={48}        // Allocates correct baseline spatial pixel boundaries
          priority           // Instantly loads image asset above the fold to keep LCP under 2s
          className="object-contain w-full h-full" // Ensures the logo scales down nicely without stretching
        />

      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": `${companyData.name} Software Engineering Compensation Metrics Profile`,
            "description": `Aggregated crowdsourced ledger nodes mapping positions and total package allowances systematically across structural tiers inside ${companyData.name}.`,
            "url": `http://localhost:3000/companies/${slug}`,
            "spatialCoverage": "India",
            "temporalCoverage": "2026",
            "measurementTechnique": "Verified Corporate Ledger Aggregations"
          })
        }}
      />
      <div className="max-w-6xl mx-auto space-y-6">

        {/* BACK NAVIGATION ACTION BUTTON */}
        <Link href="/salaries" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider">
          ← Return to Master Ledger Table
        </Link>

        {/* F3 — HIGH-DENSITY COMPANY METADATA HEADER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm">
                <Building2 size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">{companyData.name}</h1>
                <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mt-0.5">{companyData.industry}</p>
              </div>
            </div>

            {/* HEADER META GRID TAG CHIPS */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5"><Calendar size={13} className="text-slate-400" /> Est. {companyData.foundedYear || '—'}</span>
              <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5"><Users size={13} className="text-slate-400" /> {companyData.headcountRange || '10,000+'} Headcount</span>
              <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5"><MapPin size={13} className="text-slate-400" /> HQ: {companyData.headquarters}</span>
            </div>
          </div>

          {/* F3 — COMPARE LINK DEEP BUTTON CONNECTOR */}
          <Link
            href={`/compare?c1=${companyData.slug}`}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-sm group self-start lg:self-center"
          >
            <ArrowLeftRight size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Compare Corporate Metrics
          </Link>
        </div>

        {/* F3 — COMPENSATION METRICS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-gradient-to-br from-[#0369A1] to-sky-900 text-white p-5 rounded-2xl shadow-sm border border-sky-950 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-sky-200 uppercase tracking-widest block">Median Total Comp</span>
              <h2 className="text-3xl font-black mt-1 font-mono">{formatMoney(medianTotal)}</h2>
            </div>
            <p className="text-[11px] text-sky-100/70 mt-4 font-medium">True geometric median calculation derived across all stored profile arrays.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Spread Boundary Range</span>
              <div className="text-lg font-black text-slate-800 mt-2 font-mono flex flex-col">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Min: <strong className="text-slate-700 text-sm">{formatMoney(minTotal)}</strong></span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-0.5">Max: <strong className="text-slate-900 text-base">{formatMoney(maxTotal)}</strong></span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 font-medium">The absolute lowest and highest total gross compensation vectors reported.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Data Footprint</span>
              <h2 className="text-3xl font-black mt-1 font-mono text-slate-800">{count} Records</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 font-medium">Total volume of verified internal transaction data logs currently mapped.</p>
          </div>
        </div>

        {/* F3 — HORIZONTAL STACKED LEVEL DISTRIBUTION BAR CHART */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase">Stacked Talent Distribution Node Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">Horizontal breakdown of headcount percentage by tier cluster level allocation.</p>
          </div>

          {/* THE STACKED TRACK CONTAINER ROW */}
          <div className="w-full bg-slate-100 h-6 rounded-xl overflow-hidden border border-slate-200/60 flex shadow-inner">
            {presentLevels.map((lvl) => {
              const val = distributionMap[lvl];
              const pct = (val / count) * 100;
              return (
                <div
                  key={lvl}
                  className={`${getLevelColorHex(lvl)} h-full transition-all duration-500 border-r border-white/20 last:border-0 relative group cursor-help`}
                  style={{ width: `${pct}%` }}
                  title={`${lvl}: ${val} entries (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>

          {/* DYNAMIC COMPONENT CHART LEGEND */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 border-t border-slate-100">
            {presentLevels.map((lvl) => {
              const val = distributionMap[lvl];
              const pct = (val / count) * 100;
              return (
                <div key={lvl} className="flex items-center gap-2 text-xs font-medium text-slate-600 select-none">
                  <span className={`w-3 h-3 rounded-md ${getLevelColorHex(lvl)}`} />
                  <span className="font-bold text-slate-800 uppercase">{lvl.replace('_', ' ')}</span>
                  <span className="font-mono text-slate-400">({Math.round(pct)}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* F3 — COMPANY SPECIFIC SALARY LEDGER FILTERED LIST TABLE */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-5">
          <div>
            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase">Isolated Corporate Role Ledger Nodes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Displaying verified historical metrics entries mapping strictly onto this organization profile.</p>
          </div>

          <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
            <table className="w-full text-left border-collapse table-auto text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[11px] font-bold tracking-wider uppercase select-none">
                  <th className="px-5 py-4 font-bold text-slate-500">Role</th>
                  <th className="px-5 py-4 font-bold text-slate-500">Level</th>
                  <th className="px-5 py-4 font-bold text-slate-500">Location</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-center">Experience</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-right">Base Salary</th>
                  <th className="px-5 py-4 font-bold text-slate-500 text-right">Stock Equity</th>
                  <th className="px-5 py-4 text-right font-black text-[#0369A1] bg-sky-50/20 border-l border-slate-200">Total Comp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {salaries.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-all">
                    {/* Role Title */}
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {s.role}
                    </td>
                    {/* Level Badges Matching F2 Colors Exactly */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-wide border uppercase ${getLevelBadgeStyles(s.level)}`}>
                        {s.level.replace('_', ' ')}
                      </span>
                    </td>
                    {/* Geographic Market */}
                    <td className="px-5 py-4 text-slate-500 capitalize whitespace-nowrap">
                      {s.location}
                    </td>
                    {/* Experience Metrics */}
                    <td className="px-5 py-4 text-center text-slate-600 font-mono whitespace-nowrap">
                      {s.experienceYears} yrs
                    </td>
                    {/* Component Scales Breakdown */}
                    <td className="px-5 py-4 text-right font-mono text-slate-600 whitespace-nowrap">
                      {formatMoney(Number(s.baseSalary), s.currency as Currency)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-slate-400 whitespace-nowrap">
                      {s.stock && Number(s.stock) > 0 ? formatMoney(Number(s.stock), s.currency as Currency) : '—'}
                    </td>
                    {/* Dominant Total Comp Column Cell (#0369A1) */}
                    <td className="px-5 py-4 text-right font-mono text-base font-black text-[#0369A1] whitespace-nowrap bg-sky-50/30 border-l border-slate-100">
                      {formatMoney(Number(s.totalCompensation), s.currency as Currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}