// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Search, User, LogIn, UserPlus, Briefcase } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const navLinks = [
    { name: 'Companies', href: '/companies', hasDropdown: true, dropdownItems: [
      { name: 'All Companies', href: '/companies' },
      { name: 'Top Rated', href: '/companies/top-rated' },
      { name: 'By Industry', href: '/companies/industries' },
    ] },
    { name: 'Salaries', href: '/salaries', hasDropdown: false },
    { name: 'Reviews', href: '/reviews', hasDropdown: false },
    { name: 'Interviews', href: '/interviews', hasDropdown: false },
    { name: 'Jobs', href: '/jobs', hasDropdown: false },
    { name: 'Forum', href: '/forum', hasDropdown: false },
    { name: 'Offers', href: '/offers', hasDropdown: false },
    { name: 'Tools', href: '#', hasDropdown: true, dropdownItems: [
      { name: 'Salary Calculator', href: '/tools/salary-calculator' },
      { name: 'Resume Builder', href: '/tools/resume-builder' },
      { name: 'Interview Prep', href: '/tools/interview-prep' },
    ] },
    { name: 'Brands', href: '#', hasDropdown: true, dropdownItems: [
      { name: 'For Employers', href: '/brands/employers' },
      { name: 'Partner With Us', href: '/brands/partners' },
      { name: 'Advertise', href: '/brands/advertise' },
    ] },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              TalentDash
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.hasDropdown ? (
                  <button
                    onClick={() => toggleDropdown(link.name)}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 rounded-lg transition-colors"
                  >
                    {link.name}
                    <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === link.name ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      pathname === link.href
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
                {/* Dropdown menu */}
                {link.hasDropdown && openDropdown === link.name && (
                  <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    {link.dropdownItems?.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Right Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/compare" className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
              <Briefcase className="h-4 w-4" />
              Compare
            </Link>
            <Link href="/salaries" className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm">
              <Search className="h-4 w-4" />
              Explore Salary
            </Link>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <Link href="/contribute" className="px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition">Contribute</Link>
            <Link href="/employer" className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition">Employer</Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-700 hover:text-indigo-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 py-2 px-4">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.hasDropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(link.name)}
                      className="flex justify-between items-center w-full px-3 py-2 text-base font-medium text-slate-700 rounded-lg"
                    >
                      {link.name}
                      <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === link.name ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === link.name && (
                      <div className="pl-4 space-y-1">
                        {link.dropdownItems?.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-indigo-50"
                            onClick={() => {
                              setOpenDropdown(null);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className="block px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-indigo-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-4 pb-2 border-t border-slate-200">
              <div className="flex flex-wrap gap-2">
                <Link href="/compare" className="w-full text-center px-3 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg">Compare</Link>
                <Link href="/salaries" className="w-full text-center px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg">Explore Salary</Link>
                <Link href="/contribute" className="w-full text-center px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg">Contribute</Link>
                <Link href="/employer" className="w-full text-center px-3 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg">Employer</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;