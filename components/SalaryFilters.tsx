'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Search } from 'lucide-react';
import { Level } from '@/types';

interface SalaryFiltersProps {
  availableRoles: string[];
  availableLocations: string[];
  availableLevels: Level[];
  currentCompany: string;
  currentRole: string;
  currentLocation: string;
  currentLevels: string[];
}

export default function SalaryFilters({
  availableRoles,
  availableLocations,
  availableLevels,
  currentCompany,
  currentRole,
  currentLocation,
  currentLevels,
}: SalaryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Update URL Search Parameters smoothly to trigger Next.js Server Re-rendering
  const updateQueryParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset pagination on filter trigger
    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/salaries?${params.toString()}`);
  };

  const toggleLevelCheckbox = (lvl: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let active = params.get('level') ? params.get('level')!.split(',') : [];
    
    if (active.includes(lvl)) {
      active = active.filter((x) => x !== lvl);
    } else {
      active.push(lvl);
    }

    if (active.length > 0) {
      params.set('level', active.join(','));
    } else {
      params.delete('level');
    }
    params.set('page', '1');
    router.push(`/salaries?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 pb-2">
        <SlidersHorizontal size={14} /> Filter Control Array
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Company Name Input Node */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by corporate company name..."
            defaultValue={currentCompany}
            onChange={(e) => updateQueryParams('company', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900"
          />
        </div>

        {/* Roles Select Box */}
        <select
          value={currentRole}
          onChange={(e) => updateQueryParams('role', e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900"
        >
          <option value="ALL">All Roles & Fields</option>
          {availableRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Locations Select Box */}
        <select
          value={currentLocation}
          onChange={(e) => updateQueryParams('location', e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900"
        >
          <option value="ALL">All Locations Markets</option>
          {availableLocations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Checkbox Matrix Group */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500 block mb-2">Corporate Career Tiers Matrix:</span>
        <div className="flex flex-wrap gap-2">
          {availableLevels.map((lvl) => {
            const isChecked = currentLevels.includes(lvl);
            return (
              <label
                key={lvl}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer select-none transition-all ${
                  isChecked
                    ? 'bg-sky-50 border-sky-300 text-sky-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleLevelCheckbox(lvl)}
                  className="sr-only"
                />
                {lvl.replace('_', ' ')}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}