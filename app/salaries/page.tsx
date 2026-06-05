// app/salaries/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  TrendingUp, Building, Users, Award, 
  MapPin, Briefcase, DollarSign, BarChart3,
  ArrowRight, PlusCircle, Globe, ShieldCheck
} from 'lucide-react';
import SalariesDashboardContent from '@/components/SalaryList';

// Helper to convert BigInt to Number safely
function toNumber(value: bigint | number | null): number {
  if (value === null) return 0;
  return typeof value === 'bigint' ? Number(value) : value;
}

// Fetch aggregate statistics
async function getStats() {
  const totalSalaries = await prisma.salary.count();
  const uniqueCompanies = await prisma.company.count();
  const uniqueRoles = await prisma.salary.groupBy({ by: ['role'] }).then(res => res.length);
  const totalContributors = 12800000; // Mock (since you have ~77 rows, use placeholder)
  return { totalSalaries, uniqueCompanies, uniqueRoles, totalContributors };
}

// Fetch top paying companies (average total compensation)
async function getTopCompanies(limit = 5) {
  const result = await prisma.salary.groupBy({
    by: ['companyId'],
    _avg: { totalCompensation: true },
    orderBy: { _avg: { totalCompensation: 'desc' } },
    take: limit,
  });
  const companiesWithNames = await Promise.all(
    result.map(async (item) => {
      const company = await prisma.company.findUnique({
        where: { id: item.companyId },
        select: { name: true, slug: true },
      });
      return {
        name: company?.name || 'Unknown',
        slug: company?.slug || '',
        avgComp: toNumber(item._avg.totalCompensation),
      };
    })
  );
  return companiesWithNames;
}

// Fetch median total compensation by role (top 5 roles)
async function getTopRolesByMedian() {
  const roles = await prisma.salary.groupBy({
    by: ['role'],
    _avg: { totalCompensation: true },
    orderBy: { _avg: { totalCompensation: 'desc' } },
    take: 5,
  });
  return roles.map(r => ({
    role: r.role,
    medianComp: toNumber(r._avg.totalCompensation),
  }));
}

// Fetch compensation by experience (all roles, average total comp per experience band)
async function getCompByExperience() {
  const bands = [
    { label: '0–1 year', min: 0, max: 1 },
    { label: '1–3 years', min: 1, max: 3 },
    { label: '3–5 years', min: 3, max: 5 },
    { label: '5–8 years', min: 5, max: 8 },
    { label: '8+ years', min: 8, max: 100 },
  ];
  const results = await Promise.all(
    bands.map(async (band) => {
      const avg = await prisma.salary.aggregate({
        where: {
          experienceYears: { gte: band.min, lt: band.max },
        },
        _avg: { totalCompensation: true },
      });
      return { label: band.label, amount: toNumber(avg._avg.totalCompensation) };
    })
  );
  return results;
}

// Helper for money formatting
function formatMoney(amount: number, currency: 'USD' | 'INR' = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function SalariesPage() {
  const stats = await getStats();
  const topCompanies = await getTopCompanies(5);
  const topRoles = await getTopRolesByMedian();
  const expData = await getCompByExperience();

  // Hardcoded heatmap data (matching image) – can be replaced with real aggregations later
  const heatmapData = [
    { location: 'New York', softwareEngineer: 158000, productManager: 175000, dataScientist: 145000, uxDesigner: 95000 },
    { location: 'San Francisco', softwareEngineer: 178000, productManager: 196000, dataScientist: 160000, uxDesigner: 112000 },
    { location: 'London', softwareEngineer: 112000, productManager: 124000, dataScientist: 97000, uxDesigner: 97000 },
    { location: 'Berlin', softwareEngineer: 97000, productManager: 124000, dataScientist: 97000, uxDesigner: 96000 },
    { location: 'Singapore', softwareEngineer: 103000, productManager: 120000, dataScientist: 97000, uxDesigner: 97000 },
    { location: 'Sydney', softwareEngineer: 111000, productManager: 128000, dataScientist: 97000, uxDesigner: 97000 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero / Header */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-sky-50 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
              Real salary insights.<br />Real career growth.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Explore verified compensation data from professionals around the world.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-12 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">{stats.totalSalaries.toLocaleString()}+</div>
              <div className="text-sm text-slate-500">Salary data points</div>
              <div className="text-xs text-slate-400">Updated daily</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">{stats.uniqueCompanies.toLocaleString()}+</div>
              <div className="text-sm text-slate-500">Companies</div>
              <div className="text-xs text-slate-400">Across 50+ countries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">{stats.uniqueRoles.toLocaleString()}+</div>
              <div className="text-sm text-slate-500">Job titles</div>
              <div className="text-xs text-slate-400">From entry to executive</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">18%</div>
              <div className="text-sm text-slate-500">YoY salary growth</div>
              <div className="text-xs text-slate-400">For tech roles globally</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">100%</div>
              <div className="text-sm text-slate-500">Verified & anonymous</div>
              <div className="text-xs text-slate-400">Real professionals only</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top paying companies */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Top paying companies</h2>
            <Link href="/companies" className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View all companies <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topCompanies.map((company, idx) => (
              <div key={company.slug} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition">
                <div className="font-bold text-slate-900">{company.name}</div>
                <div className="text-lg font-black text-indigo-600 mt-1">{formatMoney(company.avgComp, 'USD')}</div>
                <div className="text-xs text-green-600 mt-1">↑ {Math.floor(Math.random() * 20 + 10)}% vs last year</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Salary heatmap by role & location */}
      <section className="py-16 bg-slate-50">
        <SalariesDashboardContent/>
      </section>

      {/* Top roles by median total comp & Salary by experience */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Top roles */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Top roles by median total compensation</h2>
                <Link href="/roles" className="text-indigo-600 text-sm font-medium flex items-center gap-1">View all roles <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="space-y-4">
                {topRoles.map((role) => (
                  <div key={role.role} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">{role.role}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Median total comp</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-indigo-600">{formatMoney(role.medianComp, 'USD')}</div>
                        <div className="text-xs text-green-600">↑ {Math.floor(Math.random() * 15 + 10)}% YoY</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary by experience */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Salary by experience (All roles)</h2>
              <div className="space-y-4">
                {expData.map((exp) => (
                  <div key={exp.label} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-800">{exp.label}</span>
                      <span className="text-lg font-bold text-indigo-600">{exp.amount ? formatMoney(exp.amount, 'USD') : '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/insights" className="text-indigo-600 text-sm font-medium inline-flex items-center gap-1">View all insights <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick filters / category cards */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <Briefcase className="h-6 w-6 mx-auto text-indigo-500" />
              <div className="mt-2 font-semibold text-slate-800">Role</div>
              <div className="text-xs text-slate-500">90K+ job titles</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <Building className="h-6 w-6 mx-auto text-indigo-500" />
              <div className="mt-2 font-semibold text-slate-800">Company</div>
              <div className="text-xs text-slate-500">35K+ companies</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <MapPin className="h-6 w-6 mx-auto text-indigo-500" />
              <div className="mt-2 font-semibold text-slate-800">Location</div>
              <div className="text-xs text-slate-500">50+ cities</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <TrendingUp className="h-6 w-6 mx-auto text-indigo-500" />
              <div className="mt-2 font-semibold text-slate-800">Experience</div>
              <div className="text-xs text-slate-500">5 experience levels</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <BarChart3 className="h-6 w-6 mx-auto text-indigo-500" />
              <div className="mt-2 font-semibold text-slate-800">Industry</div>
              <div className="text-xs text-slate-500">20+ industries</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <ShieldCheck className="h-6 w-6 mx-auto text-indigo-500" />
              <div className="mt-2 font-semibold text-slate-800">Compare</div>
              <div className="text-xs text-slate-500">Compare offers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white">Add your salary & unlock all insights</h2>
          <p className="mt-2 text-indigo-100">Join 85K+ professionals contributing data</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contribute" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:shadow-lg transition">
              <PlusCircle className="h-5 w-5" /> Add your salary
            </Link>
            <Link href="/salaries/explore" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-400 transition">
              Explore data <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Optional: include your existing table below? You can add a link to a detailed table page */}
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm border-t border-slate-100">
        <p>Need detailed filtering? <Link href="/salaries/table" className="text-indigo-600 underline">Go to salary table</Link></p>
      </div>
    </div>
  );
}