'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-boi-bg">
      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-boi-bg/95 backdrop-blur-md border-b border-boi-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/boi-seal.png" alt="BOI Seal" width={36} height={36} className="object-contain" style={{ mixBlendMode: 'multiply' }} />
            <div className="text-left">
              <div className="font-serif font-bold text-base leading-none text-boi-gold tracking-wide">B.O.I.</div>
              <div className="font-mono text-[8px] tracking-[0.18em] text-boi-muted uppercase">Bureau of Operational Integrity</div>
            </div>
          </Link>
          <Link href="/" className="font-mono text-xs tracking-widest text-boi-muted hover:text-boi-gold uppercase transition-colors duration-200">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-24">
        <p className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-3">
          // LEGAL
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
          Accessibility
        </h1>
        <div className="divider w-24 mb-10" />

        <div className="space-y-8 text-boi-muted text-sm leading-relaxed">
          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Our Commitment</h2>
            <p>The Bureau of Operational Integrity is committed to ensuring this website is accessible to all users. We aim to maintain a clear, readable, and navigable experience across all devices and screen sizes.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Design Standards</h2>
            <p>This site uses high-contrast color combinations, semantic HTML structure, and descriptive alt text on all images to support users of assistive technologies including screen readers.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Keyboard Navigation</h2>
            <p>All interactive elements on this site are accessible via keyboard navigation. Forms, links, and buttons are fully operable without a mouse.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Reporting an Issue</h2>
            <p>If you encounter any accessibility barrier on this site, please report it to Bureau leadership through official Discord channels. We will address it as promptly as possible.</p>
          </div>

          <div className="border-t border-boi-border pt-6">
            <p className="font-mono text-[9px] tracking-widest text-boi-muted uppercase">
              Last updated: MMXXVI. Bureau of Operational Integrity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
