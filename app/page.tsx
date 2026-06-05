// app/page.tsx
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  Star, 
  Users, 
  Building, 
  Gift,
  ArrowRight,
  ShieldCheck,
  Globe,
  Award
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-sky-50 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              Explore. Compare. Grow.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600">
              Explore salaries, read real reviews, prepare for interviews, and find the right opportunities — all in one place.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl border border-slate-200">
              <div className="flex-1 flex items-center px-4 py-2 bg-slate-50 rounded-xl md:rounded-l-xl">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by job title, skill or company"
                  className="w-full ml-2 bg-transparent border-0 focus:outline-none text-slate-700 placeholder-slate-400"
                />
              </div>
              <div className="flex-1 flex items-center px-4 py-2 bg-slate-50 rounded-xl">
                <MapPin className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Location (e.g. New York, Remote)"
                  className="w-full ml-2 bg-transparent border-0 focus:outline-none text-slate-700 placeholder-slate-400"
                />
              </div>
              <div className="flex-1 flex items-center px-4 py-2 bg-slate-50 rounded-xl">
                <Briefcase className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Experience (e.g. 0–2 years)"
                  className="w-full ml-2 bg-transparent border-0 focus:outline-none text-slate-700 placeholder-slate-400"
                />
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-md">
                Search
              </button>
            </div>
          </div>

          {/* Trending Searches */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 mb-3">Trending searches:</p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {['Software Engineer', 'Data Scientist', 'Product Manager', 'Marketing Manager', 'Remote Jobs'].map((term) => (
                <span key={term} className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 text-slate-700 hover:border-indigo-300 cursor-pointer transition-colors">
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-indigo-500" />
              <div className="mt-2 text-2xl font-bold text-slate-900">10M+</div>
              <div className="text-sm text-slate-500">Users across the globe</div>
            </div>
            <div className="flex flex-col items-center">
              <Building className="h-8 w-8 text-indigo-500" />
              <div className="mt-2 text-2xl font-bold text-slate-900">500K+</div>
              <div className="text-sm text-slate-500">Companies researched & reviewed</div>
            </div>
            <div className="flex flex-col items-center">
              <Gift className="h-8 w-8 text-indigo-500" />
              <div className="mt-2 text-2xl font-bold text-slate-900">100% Free</div>
              <div className="text-sm text-slate-500">No hidden charges</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main CTA Cards */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Salaries Card */}
            <Link href="/salaries" className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 hover:border-indigo-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Salaries</h3>
              <p className="mt-2 text-slate-600 text-sm">Compare pay by role, company, city and experience.</p>
              <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm">
                Explore salaries <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Reviews Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Reviews</h3>
              <p className="mt-2 text-slate-600 text-sm">Discover work culture, pros, cons and ratings from real employees.</p>
              <div className="mt-4 flex items-center text-amber-600 font-medium text-sm">
                Explore reviews <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>

            {/* Interviews Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Interviews</h3>
              <p className="mt-2 text-slate-600 text-sm">Practice with real questions and interview experiences.</p>
              <div className="mt-4 flex items-center text-emerald-600 font-medium text-sm">
                Explore interviews <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Cards Row */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Jobs Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Jobs</h3>
              <p className="mt-2 text-slate-600 text-sm">Find the right opportunities, remote or on-site.</p>
              <div className="mt-4 flex items-center text-slate-700 font-medium text-sm">
                Explore jobs <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>

            {/* Offers Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Offers</h3>
              <p className="mt-2 text-slate-600 text-sm">Compare offers, salary, bonus, equity and more.</p>
              <div className="mt-4 flex items-center text-slate-700 font-medium text-sm">
                Explore offers <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </div>

            {/* Compare Companies Card */}
            <Link href="/compare?c1=microsoft" className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 transition group">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition">
                <ShieldCheck className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Compare Companies</h3>
              <p className="mt-2 text-slate-600 text-sm">Side-by-side comparison of salary, culture, and benefits.</p>
              <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm">
                Start comparing <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Community Discussion Section */}
      <section className="py-16 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Community Discussions</h2>
            <p className="mt-2 text-slate-600">Join conversations, ask questions and get advice from the community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">“Are AI engineers now overpaid?”</h4>
                  <p className="text-sm text-slate-500 mt-1">2.4K replies · 12h ago</p>
                </div>
                <div className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">Trending</div>
              </div>
              <div className="mt-4 flex gap-2 text-xs text-slate-500">
                <span className="px-2 py-1 bg-slate-100 rounded">Layoffs 2025</span>
                <span className="px-2 py-1 bg-slate-100 rounded">Career Switch</span>
                <span className="px-2 py-1 bg-slate-100 rounded">Remote Jobs</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Negotiation Strategies that work</h4>
                  <p className="text-sm text-slate-500 mt-1">1.1K replies · 2d ago</p>
                </div>
                <div className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Hot</div>
              </div>
              <div className="mt-4 flex gap-2 text-xs text-slate-500">
                <span className="px-2 py-1 bg-slate-100 rounded">Offers</span>
                <span className="px-2 py-1 bg-slate-100 rounded">Salary</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <button className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
              Explore discussions <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer / Trust Badges */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link href="/salaries" className="hover:text-indigo-600">Salaries</Link>
            <Link href="/reviews" className="hover:text-indigo-600">Reviews</Link>
            <Link href="/interviews" className="hover:text-indigo-600">Interviews</Link>
            <Link href="/jobs" className="hover:text-indigo-600">Jobs</Link>
            <Link href="/forum" className="hover:text-indigo-600">Forum</Link>
            <Link href="/offers" className="hover:text-indigo-600">Offers</Link>
          </div>
          <div className="flex justify-center gap-4">
            <Globe className="h-4 w-4" />
            <span>© 2026 TalentDash — Real data. Real people.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}