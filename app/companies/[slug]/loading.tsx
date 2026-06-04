import React from 'react';

export default function LoadingCompanyProfile() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back navigation placeholder */}
        <div className="h-4 w-36 bg-slate-200 rounded-lg" />

        {/* Header Card Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 rounded-lg" />
              <div className="h-4 w-24 bg-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="h-10 w-44 bg-slate-200 rounded-xl self-start lg:self-center" />
        </div>

        {/* Metrics Blocks Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>

        {/* Chart Container Skeleton */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 h-32" />

        {/* Table Ledger Container Skeleton */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 h-64" />
      </div>
    </div>
  );
}