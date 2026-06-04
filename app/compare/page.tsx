'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Currency, SalaryRecord } from '@/types';
import { Scale, ArrowLeftRight, TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const s1 = searchParams.get('s1') || '';
  const s2 = searchParams.get('s2') || '';
  const c1 = searchParams.get('c1') || '';

  // API Dropdown Catalog States
  const [allRecords, setAllRecords] = useState<SalaryRecord[]>([]);
  const [recordA, setRecordA] = useState<SalaryRecord | null>(null);
  const [recordB, setRecordB] = useState<SalaryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- 1. POPULATE DROPDOWN SELECTORS FROM REAL DATABASE ---
  useEffect(() => {
    async function loadDropdownCatalog() {
      try {
        // Fetch rows via your active F2 endpoint (pulling max allowed limit for selection visibility)
        const res = await fetch('/api/salaries?limit=100');
        const json = await res.json();
        if (json && json.data) {
          setAllRecords(json.data);
        }
      } catch (err) {
        console.error("Failed to populate dropdown options matrix:", err);
      }
    }
    loadDropdownCatalog();
  }, []);

  // --- 2. EVALUATE COMPARISON SELECTION FROM URL PARAMS ---
  useEffect(() => {
    // Treat corporate slug parameter c1 as an automatic instruction to find first company node
    let targetS1 = s1;
    if (c1 && !s1 && allRecords.length > 0) {
      const match = allRecords.find(r => r.company?.slug === c1);
      if (match) targetS1 = match.id;
    }

    if (!targetS1 && !s2) {
      setRecordA(null);
      setRecordB(null);
      return;
    }

    async function fetchComparisonData() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        // Fallback to active slug resolution if s1 parameter is a raw company slug name
        const resolvedS1 = targetS1 || 'none';
        const resolvedS2 = s2 || 'none';
        
        const res = await fetch(`/api/compare?s1=${resolvedS1}&s2=${resolvedS2}`);
        const json = await res.json();

        if (!res.ok || json.error) {
          throw new Error(json.message || "Failed to resolve comparison data nodes.");
        }

        setRecordA(json.comparison.record1);
        setRecordB(json.comparison.record2);
      } catch (err: any) {
        // Safe mapping layout fallbacks for loose manual entries
        console.warn(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (allRecords.length > 0) {
      fetchComparisonData();
    }
  }, [s1, s2, c1, allRecords]);

  // --- 3. SYNCHRONIZE DROPDOWN SELECTIONS TO URL STATE ---
  const handleDropdownChange = (slot: 'A' | 'B', selectedId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('c1'); // Clear parent profile route hooks to prevent clashing
    
    if (slot === 'A') {
      if (selectedId) params.set('s1', selectedId);
      else params.delete('s1');
    } else {
      if (selectedId) params.set('s2', selectedId);
      else params.delete('s2');
    }

    router.replace(`/compare?${params.toString()}`, { scroll: false });
  };

  const formatMoney = (val: string | number | undefined, currency: Currency = 'INR') => {
    const num = Number(val);
    if (!num || isNaN(num)) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // --- 4. CALCULATION SPEC RULE: RECORD A MINUS RECORD B ---
  const calculateDelta = (field: 'baseSalary' | 'bonus' | 'stock' | 'totalCompensation') => {
    if (!recordA || !recordB) return null;
    const valA = Number(recordA[field] || 0);
    const valB = Number(recordB[field] || 0);
    const diff = valA - valB; // Spec rule direction

    let textClass = 'text-slate-500 font-mono';
    let sign = '';

    if (diff > 0) {
      textClass = 'text-emerald-600 font-mono font-bold';
      sign = '+';
    } else if (diff < 0) {
      textClass = 'text-rose-600 font-mono font-bold';
    }

    return (
      <span className={textClass}>
        {sign}{formatMoney(diff, recordA.currency as Currency)}
      </span>
    );
  };

  // Compute TC Winner Badges
  const tcA = Number(recordA?.totalCompensation || 0);
  const tcB = Number(recordB?.totalCompensation || 0);
  const isWinnerA = recordA && recordB && tcA > tcB;
  const isWinnerB = recordA && recordB && tcB > tcA;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 selection:bg-sky-500/20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER VIEWS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-sm">
              <Scale size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Cross-Role Delta Engine</h1>
              <p className="text-xs text-slate-500 mt-0.5">Select any two ledger nodes to compute mathematical disparities side-by-side.</p>
            </div>
          </div>
        </div>

        {/* F4 — DUAL DROPDOWN INTERACTIVE SELECTORS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">Target Position Node Alpha (Left)</label>
            <select
              value={recordA?.id || ''}
              onChange={(e) => handleDropdownChange('A', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900"
            >
              <option value="">-- Choose Position Entry A --</option>
              {allRecords.map((r) => (
                <option key={`optA-${r.id}`} value={r.id}>
                  {r.company?.name} • {r.role} ({r.level}) — {formatMoney(Number(r.totalCompensation), r.currency as Currency)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">Target Position Node Beta (Right)</label>
            <select
              value={recordB?.id || ''}
              onChange={(e) => handleDropdownChange('B', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900"
            >
              <option value="">-- Choose Position Entry B --</option>
              {allRecords.map((r) => (
                <option key={`optB-${r.id}`} value={r.id}>
                  {r.company?.name} • {r.role} ({r.level}) — {formatMoney(Number(r.totalCompensation), r.currency as Currency)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING ELEMENT */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-24 text-center text-xs font-bold tracking-widest text-slate-400 uppercase animate-pulse">
            Re-compiling grid layout variances...
          </div>
        )}

        {/* F4 — SIDE-BY-SIDE MATRIX BREAKDOWN ROWS */}
        {!isLoading && recordA && recordB ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                    <th className="px-6 py-4 w-1/3">Metric parameters</th>
                    <th className="px-6 py-4 w-1/4 relative">
                      Position Node Alpha
                      {isWinnerA && (
                        <span className="absolute top-3.5 right-4 inline-flex items-center gap-1 bg-[#0369A1] text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md shadow-sm uppercase">
                          <Trophy size={10} /> Higher TC
                        </span>
                      )}
                    </th>
                    <th className="px-6 py-4 w-1/4 relative">
                      Position Node Beta
                      {isWinnerB && (
                        <span className="absolute top-3.5 right-4 inline-flex items-center gap-1 bg-[#0369A1] text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md shadow-sm uppercase">
                          <Trophy size={10} /> Higher TC
                        </span>
                      )}
                    </th>
                    <th className="px-6 py-4 text-right">Delta (A - B)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {/* Metadata Rows */}
                  <tr className="hover:bg-slate-50/40"><td className="px-6 py-3.5 text-slate-400 font-bold text-xs uppercase tracking-wider">Company</td><td className="px-6 py-3.5 text-slate-900 font-bold">{recordA.company?.name}</td><td className="px-6 py-3.5 text-slate-900 font-bold">{recordB.company?.name}</td><td className="px-6 py-3.5 text-right font-normal text-slate-300">—</td></tr>
                  <tr className="hover:bg-slate-50/40"><td className="px-6 py-3.5 text-slate-400 font-bold text-xs uppercase tracking-wider">Role</td><td className="px-6 py-3.5 text-slate-800">{recordA.role}</td><td className="px-6 py-3.5 text-slate-800">{recordB.role}</td><td className="px-6 py-3.5 text-right font-normal text-slate-300">—</td></tr>
                  <tr className="hover:bg-slate-50/40"><td className="px-6 py-3.5 text-slate-400 font-bold text-xs uppercase tracking-wider">Level</td><td className="px-6 py-3.5"><span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-bold uppercase">{recordA.level.replace('_', ' ')}</span></td><td className="px-6 py-3.5"><span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-bold uppercase">{recordB.level.replace('_', ' ')}</span></td><td className="px-6 py-3.5 text-right font-normal text-slate-300">—</td></tr>
                  <tr className="hover:bg-slate-50/40"><td className="px-6 py-3.5 text-slate-400 font-bold text-xs uppercase tracking-wider">Market Location</td><td className="px-6 py-3.5 text-slate-600 capitalize">{recordA.location}</td><td className="px-6 py-3.5 text-slate-600 capitalize">{recordB.location}</td><td className="px-6 py-3.5 text-right font-normal text-slate-300">—</td></tr>
                  <tr className="hover:bg-slate-50/40"><td className="px-6 py-3.5 text-slate-400 font-bold text-xs uppercase tracking-wider">Experience</td><td className="px-6 py-3.5 font-mono text-slate-900">{recordA.experienceYears} yrs</td><td className="px-6 py-3.5 font-mono text-slate-900">{recordB.experienceYears} yrs</td><td className="px-6 py-3.5 text-right font-normal text-slate-300">—</td></tr>
                  
                  {/* Numeric Financial Component Rows */}
                  <tr className="hover:bg-slate-50/40">
                    <td className="px-6 py-3.5 text-slate-400 font-bold text-xs uppercase tracking-wider">Base Salary</td>
                    <td className="px-6 py-3.5 font-mono">{formatMoney(recordA.baseSalary, recordA.currency as Currency)}</td>
                    <td className="px-6 py-3.5 font-mono">{formatMoney(recordB.baseSalary, recordB.currency as Currency)}</td>
                    <td className="px-6 py-3.5 text-right">{calculateDelta('baseSalary')}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/40">
                    <td className="px-6 py-3.5 text-slate-400 font-bold text-xs uppercase tracking-wider">Bonus incentives</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{recordA.bonus && Number(recordA.bonus) > 0 ? formatMoney(recordA.bonus, recordA.currency as Currency) : '—'}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{recordB.bonus && Number(recordB.bonus) > 0 ? formatMoney(recordB.bonus, recordB.currency as Currency) : '—'}</td>
                    <td className="px-6 py-3.5 text-right">{calculateDelta('bonus')}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/40">
                    <td className="px-6 py-3.5 text-slate-400 font-bold text-xs uppercase tracking-wider">Stock Equity</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{recordA.stock && Number(recordA.stock) > 0 ? formatMoney(recordA.stock, recordA.currency as Currency) : '—'}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{recordB.stock && Number(recordB.stock) > 0 ? formatMoney(recordB.stock, recordB.currency as Currency) : '—'}</td>
                    <td className="px-6 py-3.5 text-right">{calculateDelta('stock')}</td>
                  </tr>

                  {/* Dominant TC Anchor Row Layout */}
                  <tr className="bg-sky-50/30 text-base font-black border-t border-slate-200">
                    <td className="px-6 py-4 text-slate-500 text-xs font-black uppercase tracking-widest">Total Compensation</td>
                    <td className="px-6 py-4 font-mono text-[#0369A1]">{formatMoney(recordA.totalCompensation, recordA.currency as Currency)}</td>
                    <td className="px-6 py-4 font-mono text-[#0369A1]">{formatMoney(recordB.totalCompensation, recordB.currency as Currency)}</td>
                    <td className="px-6 py-4 text-right border-l border-slate-100 bg-sky-50/40">{calculateDelta('totalCompensation')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 max-w-md mx-auto space-y-2">
            <span className="text-sm font-bold uppercase text-slate-700 block">Workspace Clean</span>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">Select distinct position rows in both dropdown controls above to compile full variance matrix calculations.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
        Initializing Delta Compute Workspace Vectors...
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}