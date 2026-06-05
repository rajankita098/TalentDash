// app/salaries/page.tsx
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';
import { Level, Currency, SalaryRecord } from '@/types';
import { CURRENCY_CONFIG } from '@/lib/currency-config';

// -------------------------------------------------------------------
// Client Component that fetches data from /api/salaries
// -------------------------------------------------------------------
function SalariesDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Filter state (synced with URL) ---
  const [search, setSearch] = useState(searchParams.get('company') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'ALL');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || 'ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    (searchParams.get('currency') as Currency) || 'INR'
  );
  const [selectedLevels, setSelectedLevels] = useState<Level[]>(() => {
    const levels = searchParams.get('level');
    return levels ? (levels.split(',') as Level[]) : [];
  });
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    (searchParams.get('direction') as 'asc' | 'desc') || 'desc'
  );
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const rowsPerPage = 25;

  // --- Data state from API ---
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded options (you can also fetch them from the API if needed)
  const availableRoles = [
    'Software Engineer',
    'Backend Developer',
    'Frontend Architect',
    'Data Scientist',
    'DevOps Engineer',
  ];
  const availableLocations = [
    'Bengaluru',
    'Mumbai',
    'Hyderabad',
    'Pune',
    'Delhi',
    'San Francisco',
    'London',
  ];
  const availableLevels: Level[] = [
    'L3',
    'SDE_I',
    'L4',
    'SDE_II',
    'L5',
    'SDE_III',
    'L6',
    'STAFF',
    'PRINCIPAL',
  ];

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch data whenever filters change
  useEffect(() => {
    async function fetchSalaries() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch.trim()) params.set('company', debouncedSearch.trim());
        if (selectedRole !== 'ALL') params.set('role', selectedRole);
        if (selectedLocation !== 'ALL') params.set('location', selectedLocation.toLowerCase());
        if (selectedLevels.length) params.set('level', selectedLevels.join(','));
        params.set('currency', selectedCurrency);
        params.set('direction', sortDirection);
        params.set('page', currentPage.toString());
        params.set('limit', rowsPerPage.toString());

        const res = await fetch(`/api/salaries?${params.toString()}`);
        const json = await res.json();

        if (json.data) {
          setRecords(json.data);
          setTotalRecords(json.meta?.total || 0);
        } else {
          setRecords([]);
          setTotalRecords(0);
        }
      } catch (error) {
        console.error('Failed to fetch salaries:', error);
        setRecords([]);
        setTotalRecords(0);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSalaries();
  }, [debouncedSearch, selectedRole, selectedLocation, selectedLevels, selectedCurrency, sortDirection, currentPage]);

  // Sync URL with current filter state (without causing a re‑fetch)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('company', debouncedSearch);
    if (selectedRole !== 'ALL') params.set('role', selectedRole);
    if (selectedLocation !== 'ALL') params.set('location', selectedLocation);
    params.set('currency', selectedCurrency);
    if (selectedLevels.length) params.set('level', selectedLevels.join(','));
    params.set('direction', sortDirection);
    params.set('page', currentPage.toString());
    router.replace(`/salaries?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, selectedRole, selectedLocation, selectedCurrency, selectedLevels, sortDirection, currentPage, router]);

  // Reset page when filters change (except page itself)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedRole, selectedLocation, selectedLevels, selectedCurrency]);

  // Client‑side currency conversion (optional – API already returns in selected currency, but we keep for safety)
  const processedRecords = useMemo(() => {
    return records.map((record) => {
      if (record.currency === selectedCurrency) {
        return {
          ...record,
          baseSalary: Number(record.baseSalary),
          stock: Number(record.stock || 0),
          totalCompensation: Number(record.totalCompensation),
        };
      }
      const rate = selectedCurrency === 'USD' ? CURRENCY_CONFIG.INR_TO_USD : CURRENCY_CONFIG.USD_TO_INR;
      return {
        ...record,
        currency: selectedCurrency,
        baseSalary: Math.round(Number(record.baseSalary) * rate),
        stock: Math.round(Number(record.stock || 0) * rate),
        totalCompensation: Math.round(Number(record.totalCompensation) * rate),
      };
    });
  }, [records, selectedCurrency]);

  // Pagination calculations (client‑side because we already have all records for current page)
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;

  // Helper UI functions
  const getLevelBadgeStyles = (level: string) => {
    const tier = level.toUpperCase();
    if (tier === 'L3' || tier === 'SDE_I') return 'bg-slate-100 text-slate-800 border-slate-200';
    if (tier === 'L4' || tier === 'SDE_II') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (tier === 'L5' || tier === 'SDE_III') return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (tier === 'L6' || tier === 'STAFF') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-amber-950 text-amber-100 border-amber-900';
  };

  const formatMoney = (val: number, currency: Currency) => {
    if (isNaN(val)) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedRole('ALL');
    setSelectedLocation('ALL');
    setSelectedLevels([]);
    setSelectedCurrency('INR');
    setSortDirection('desc');
  };

  const toggleLevel = (level: Level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  // Render
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 selection:bg-sky-500/20">
      {/* SEO Schema (optional) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Dataset',
            name: 'Global Tech Talent Salaries Ledger',
            description: 'Real‑time compensation data for software engineers worldwide.',
          }),
        }}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Global Tech Talent Ledger
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live compensation data – refreshed on every filter change.
            </p>
          </div>
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300 shadow-sm">
            <button
              onClick={() => setSelectedCurrency('INR')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedCurrency === 'INR' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setSelectedCurrency('USD')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedCurrency === 'USD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-2">
            <SlidersHorizontal size={14} /> Filter Control Array
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by company name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="ALL">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="ALL">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-2">Levels:</span>
            <div className="flex flex-wrap gap-2">
              {availableLevels.map((level) => {
                const isSelected = selectedLevels.includes(level);
                return (
                  <label
                    key={level}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer select-none transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-300 text-sky-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleLevel(level)}
                      className="sr-only"
                    />
                    {level.replace('_', ' ')}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data Table or Loading / Empty State */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-24 text-center animate-pulse text-xs text-slate-400">
            Loading live data...
          </div>
        ) : totalRecords === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <SlidersHorizontal size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Query Matches Located</h3>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              <RotateCcw size={13} /> Clear Active Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
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
                      <th
                        className="px-5 py-4 text-right cursor-pointer text-sky-700 font-black border-l border-slate-200"
                        onClick={() => setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                      >
                        Total Comp {sortDirection === 'desc' ? '▼' : '▲'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                    {processedRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                          <Link
                            href={`/companies/${record.company?.slug}`}
                            className="hover:text-sky-600 transition-colors"
                          >
                            {record.company?.name || '—'}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{record.role}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-md text-[10px] font-black tracking-wide border uppercase ${getLevelBadgeStyles(
                              record.level
                            )}`}
                          >
                            {record.level.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 capitalize whitespace-nowrap">
                          {record.location}
                        </td>
                        <td className="px-5 py-4 text-center text-slate-600 font-mono whitespace-nowrap">
                          {record.experienceYears} yrs
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-slate-600 whitespace-nowrap">
                          {formatMoney(record.baseSalary, selectedCurrency)}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-slate-400 whitespace-nowrap">
                          {record.stock > 0 ? formatMoney(record.stock, selectedCurrency) : '—'}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-base font-black text-[#0369A1] whitespace-nowrap bg-sky-50/30 border-l border-slate-100">
                          {formatMoney(record.totalCompensation, selectedCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm select-none">
              <span className="text-xs text-slate-500 font-medium">
                Showing{' '}
                <strong className="text-slate-800 font-bold">
                  {startIndex + 1}–{Math.min(startIndex + rowsPerPage, totalRecords)}
                </strong>{' '}
                of <strong className="text-slate-800 font-bold">{totalRecords}</strong> records
              </span>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-slate-600 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap with Suspense because useSearchParams requires it
export default function SalariesDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs">Loading...</div>}>
      <SalariesDashboardContent />
    </Suspense>
  );
}