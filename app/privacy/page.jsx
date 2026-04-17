'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <div className="divider w-24 mb-10" />

        <div className="space-y-8 text-boi-muted text-sm leading-relaxed">
          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Analytics & Data Collection</h2>
            <p>This website uses Vercel Web Analytics to collect anonymous, aggregated data about site traffic. The information collected may include: page views, general geographic region (country-level only), browser type, operating system, device type, and referral source. This data is entirely non-personal — it cannot be used to identify any individual visitor. No names, IP addresses, or personally identifiable information are stored or associated with this data.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Cookies & Tracking</h2>
            <p>This website does not use cookies or persistent tracking scripts. Vercel Analytics operates without cookies and does not build profiles on individual users.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Application Submissions</h2>
            <p>When you submit a recruitment application through this site, the information you provide is transmitted directly to a private Bureau Discord channel via webhook. It is not stored on any server operated by this website. The information is used solely for the purpose of evaluating your application.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Third-Party Services</h2>
            <p>This site uses Vercel as its hosting and analytics provider. Vercel's data practices are governed by their own privacy policy. No data is shared with or sold to any advertising platforms or other external parties.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Contact</h2>
            <p>Questions regarding this policy may be directed to Bureau leadership through official Discord channels.</p>
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
