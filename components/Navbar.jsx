'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const links = [
  { href: '#about',        label: 'About',       scroll: true  },
  { href: '#divisions',    label: 'Divisions',   scroll: true  },
  { href: '#requirements', label: 'Requirements', scroll: true },
  { href: '#process',      label: 'Join Process', scroll: true },
  { href: '/sop',          label: 'SOPs',        scroll: false },
  { href: '#apply',        label: 'Apply',       scroll: true  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-boi-bg/95 backdrop-blur-md border-b border-boi-border shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
            : 'bg-transparent'
        }`}
      >
        {/* ── Main nav bar ── */}
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group"
          >
            <Image src="/boi-seal.png" alt="BOI Seal" width={44} height={44} className="object-contain" />
            <div className="text-left">
              <div className="font-serif font-bold text-lg leading-none text-boi-gold text-glow-sm tracking-wide">
                B.O.I.
              </div>
              <div className="font-mono text-[9px] tracking-[0.18em] text-boi-muted uppercase">
                Bureau of Operational Integrity
              </div>
            </div>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              l.scroll ? (
                <button
                  key={l.href}
                  onClick={() => handleNav(l.href)}
                  className="font-mono text-xs tracking-widest text-boi-muted hover:text-boi-gold uppercase transition-colors duration-200 relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-boi-gold group-hover:w-full transition-all duration-300" />
                </button>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-mono text-xs tracking-widest text-boi-muted hover:text-boi-gold uppercase transition-colors duration-200 relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-boi-gold group-hover:w-full transition-all duration-300" />
                </Link>
              )
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => handleNav('#apply')}
              className="clip-corner-sm bg-boi-gold text-boi-bg font-mono text-xs font-bold tracking-widest px-5 py-2.5 uppercase hover:bg-boi-gold-lt transition-colors duration-200"
            >
              Apply Now
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-boi-gold"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {open && (
          <div className="md:hidden bg-boi-bg-2 border-t border-boi-border px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              l.scroll ? (
                <button
                  key={l.href}
                  onClick={() => handleNav(l.href)}
                  className="font-mono text-xs tracking-widest text-boi-muted hover:text-boi-gold uppercase text-left transition-colors"
                >
                  {l.label}
                </button>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className="font-mono text-xs tracking-widest text-boi-muted hover:text-boi-gold uppercase text-left transition-colors"
                >
                  {l.label}
                </Link>
              )
            ))}
            <button
              onClick={() => handleNav('#apply')}
              className="clip-corner-sm bg-boi-gold text-boi-bg font-mono text-xs font-bold tracking-widest px-5 py-2.5 uppercase w-max"
            >
              Apply Now
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
