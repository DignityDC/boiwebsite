'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function TermsPage() {
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
          Terms of Use
        </h1>
        <div className="divider w-24 mb-10" />

        <div className="space-y-8 text-boi-muted text-sm leading-relaxed">
          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Acceptance</h2>
            <p>By accessing and using this website, you agree to these terms. If you do not agree, you should not use this site. These terms apply to all visitors and applicants.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Purpose</h2>
            <p>This website exists solely to inform the public about the Bureau of Operational Integrity and to facilitate the recruitment application process. It is not to be used for any purpose outside of that scope.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Application Submissions</h2>
            <p>All information submitted through the recruitment form must be accurate and truthful. Falsified, misleading, or incomplete submissions are grounds for permanent disqualification from Bureau membership. Submission of an application does not guarantee any response or outcome.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Intellectual Property</h2>
            <p>All branding, content, and assets on this site belong to the Bureau of Operational Integrity. Reproduction, redistribution, or misuse of Bureau materials without authorization is prohibited.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Limitation of Liability</h2>
            <p>This site is provided as-is. The Bureau makes no warranties regarding availability or accuracy and accepts no liability for any issues arising from its use.</p>
          </div>

          <div>
            <h2 className="font-mono text-xs tracking-widest text-boi-gold uppercase mb-3">Changes</h2>
            <p>These terms may be updated at any time without prior notice. Continued use of the site constitutes acceptance of any revised terms.</p>
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
