import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BarChart3, ArrowRight, Layers, Building2, CheckCircle2 } from 'lucide-react';

// Force dynamic execution to grab the absolute latest counts from your Neon Database
export const dynamic = 'force-dynamic';

export default async function HomePage() {
    // 1. Gather live system database counts to showcase real metrics
    let salaryCount = 500;
    let companyCount = 50;

    try {
        const [salaries, companies] = await Promise.all([
            prisma.salary.count(),
            prisma.company.count(),
        ]);
        if (salaries > 0) salaryCount = salaries;
        if (companies > 0) companyCount = companies;
    } catch (e) {
        console.error("Fallback metrics applied due to database sync latency.", e);
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-rose-500 selection:text-white">

            {/* 🚀 HERO SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-slate-50/50 pt-20 pb-16 md:pt-32 md:pb-24 border-b border-slate-200/60">
                {/* Subtle background mesh grid decoration */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

                <div className="relative max-w-5xl mx-auto px-6 text-center space-y-6 md:space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full shadow-sm">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Live India Compensation Matrix 2026</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 max-w-3xl mx-auto leading-[1.1]">
                        Demystify tech compensation. <br />
                        <span className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 bg-clip-text text-transparent">
                            No guessing required.
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        TalentDash provides machine-readable, level-mapped aggregates from verified engineers, product leads, and data specialists across top tiers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <Link
                            href="/salaries"
                            className="w-full sm:w-auto px-8 py-4 bg-slate-950 text-white rounded-xl font-bold shadow-xl shadow-slate-950/10 hover:bg-slate-900 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                        >
                            Explore Salary Ledger
                            <ArrowRight className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/compare?c1=${companyData.slug}"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all text-center"
                        >
                            Compare your Salary
                        </Link>
                    </div>

                    {/* Quick Corporate Badges Strip */}
                    <div className="pt-8 md:pt-12 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Data pipelines mapped across</p>
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-bold text-slate-400">
                            <span className="hover:text-slate-600 transition-colors">Google</span>
                            <span className="hover:text-slate-600 transition-colors">Amazon</span>
                            <span className="hover:text-slate-600 transition-colors">Microsoft</span>
                            <span className="hover:text-slate-600 transition-colors">Meta</span>
                            <span className="hover:text-slate-600 transition-colors">Flipkart</span>
                            <span className="hover:text-slate-600 transition-colors">NVIDIA</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 📊 REAL-TIME COUNTERS MATRIX */}
            <section className="max-w-5xl mx-auto px-6 -translate-y-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/40 divide-x divide-y md:divide-y-0 divide-slate-100 overflow-hidden">
                    <div className="p-6 text-center">
                        <p className="text-3xl md:text-4xl font-black text-slate-950">{salaryCount}+</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Salary Profiles</p>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-3xl md:text-4xl font-black text-slate-950">{companyCount}+</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Tech Corporate Hubs</p>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-3xl md:text-4xl font-black text-slate-950">₹42L</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Median Compensation</p>
                    </div>
                    <div className="p-6 text-center">
                        <p className="text-3xl md:text-4xl font-black text-slate-950">100%</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Anonymized Data</p>
                    </div>
                </div>
            </section>

            {/* 🛠️ CORE PRODUCT OFFERING CARDS */}
            <section className="max-w-5xl mx-auto px-6 py-12 space-y-12">
                <div className="text-center space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-widest text-rose-600">Platform Blueprint</h2>
                    <p className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Structured intelligence, zero estimation noise.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Salary Explorer</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Filter the dataset seamlessly by company names, roles, technical levels, and geographies. Sort by component tracks instantly.
                            </p>
                        </div>
                        <Link href="/salaries" className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 pt-6 hover:text-rose-700">
                            Launch Dashboard <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                <Layers className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Side-by-Side Compare</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Select distinct roles or tiers to run a micro-component delta view contrasting base pay, stock vesting schedules, and variable benchmarks.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 pt-6">
                            Features In-built
                        </span>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Company Profiles</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Dive deep into clear analytical hub maps outlining overall tier weight distributions, headcount bands, and regional compensation ratios.
                            </p>
                        </div>
                        <Link href="/companies/tcs" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 pt-6 hover:text-rose-600">
                            View Sample Profile <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 🎯 OFFER EVALUATION BANNER */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Decorative faint orb glow */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="space-y-4 max-w-lg text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">Holding an offer package? See if it matches the current market pace.</h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                            Cross-verify any incoming package options against precise data aggregates filtered right from the team networks working on site.
                        </p>
                    </div>

                    <Link
                        href="/salaries"
                        className="w-full md:w-auto shrink-0 px-8 py-4 bg-white text-slate-950 font-bold rounded-xl shadow-lg hover:bg-slate-100 hover:scale-[1.02] active:scale-[1] transition-all text-center"
                    >
                        Check Offer Calibration
                    </Link>
                </div>
            </section>

        </div>
    );
}