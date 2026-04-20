import Image from 'next/image';
import Link from 'next/link';

const navLinks = [
  { href: '#about',        label: 'About'        },
  { href: '#divisions',    label: 'Divisions'    },
  { href: '#requirements', label: 'Requirements' },
  { href: '#process',      label: 'Join Process' },
  { href: '/sop',          label: 'SOPs'         },
  { href: '#apply',        label: 'Apply'        },
];

const divLinks = [
  'Appeals Team (AT)',
  'Office of Internal Affairs (OIA)',
  'Bureau Training Academy (BTA)',
  'Field Integrity Division (FID)',
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy'      },
  { label: 'Terms of Use',   href: '/terms'         },
  { label: 'Accessibility',  href: '/accessibility' },
];

export default function Footer() {
  return (
    <footer className="relative bg-boi-dark border-t border-boi-border overflow-hidden">
      {/* Subtle top divider gradient */}
      <div className="divider" />

      {/* BG accent */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-boi-gold/3 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Main footer grid ── */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 grid md:grid-cols-4 gap-12 relative z-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-5">
            <Image src="/boi-seal.png" alt="BOI Seal" width={48} height={48} className="object-contain" />
            <div>
              <div className="font-serif font-bold text-boi-gold text-lg tracking-wide">B.O.I.</div>
              <div className="font-mono text-[9px] tracking-widest text-boi-muted uppercase">
                Bureau of Operational<br />Integrity
              </div>
            </div>
          </div>
          <p className="text-boi-muted text-xs leading-relaxed mb-5">
            Defending order. Ensuring trust. Upholding the standards that hold institutions
            together, from the inside out.
          </p>
          <div className="font-mono text-[9px] tracking-widest text-boi-gold/50 uppercase border border-boi-border px-3 py-2 inline-block">
            EST. MMXXVI
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.3em] text-boi-gold uppercase mb-5">
            Navigation
          </h4>
          <ul className="space-y-3">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-boi-muted text-xs hover:text-boi-gold transition-colors duration-200 font-mono tracking-wide"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Divisions */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.3em] text-boi-gold uppercase mb-5">
            Divisions
          </h4>
          <ul className="space-y-2.5">
            {divLinks.map((d) => (
              <li key={d}>
                <span className="text-boi-muted text-[11px] leading-snug hover:text-boi-gold transition-colors duration-200 cursor-default">
                  {d}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal & Contact */}
        <div>
          <h4 className="font-mono text-[9px] tracking-[0.3em] text-boi-gold uppercase mb-5">
            Legal
          </h4>
          <ul className="space-y-3 mb-8">
            {legalLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-boi-muted text-xs hover:text-boi-gold transition-colors duration-200 font-mono tracking-wide"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <h4 className="font-mono text-[9px] tracking-[0.3em] text-boi-gold uppercase mb-3">
            Contact
          </h4>
          <p className="font-mono text-[10px] text-boi-muted leading-relaxed">
            All official communication is handled through Bureau-designated
            Discord channels. Do not contact leadership through unofficial means.
          </p>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-boi-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="font-mono text-[9px] tracking-widest text-boi-muted uppercase">
            © {new Date().getFullYear()} Bureau of Operational Integrity. All rights reserved.
          </span>
          <span className="font-mono text-[9px] tracking-widest text-boi-gold/40 uppercase">
            BUREAU OF OPERATIONAL INTEGRITY
          </span>
        </div>
      </div>
    </footer>
  );
}
