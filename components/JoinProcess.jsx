'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Search, MessageSquare, BadgeCheck } from 'lucide-react';

const steps = [
  {
    num:   '01',
    icon:  ClipboardList,
    title: 'Submit Your Application',
    body:  'Fill out the official application form at the bottom of this page. Be thorough and accurate, all fields are reviewed. Incomplete submissions will not be considered.',
    sub:   'Takes approx. 10 minutes',
  },
  {
    num:   '02',
    icon:  Search,
    title: 'Background Assessment',
    body:  'Bureau reviewers assess your submission against eligibility criteria and conduct a background check on your operational history. This phase typically takes 24–72 hours.',
    sub:   '24–72 hour review window',
  },
  {
    num:   '03',
    icon:  MessageSquare,
    title: 'Directed Interview',
    body:  'Qualified applicants are contacted for a formal interview with Bureau leadership. This is a direct conversation, no scripts, no formalities that do not serve a purpose.',
    sub:   'Conducted via Discord',
  },
  {
    num:   '04',
    icon:  BadgeCheck,
    title: 'Onboarding & Placement',
    body:  'Accepted personnel receive a full Bureau onboarding brief and clearance assignment. You will be integrated into the Bureau immediately. We do not leave personnel waiting.',
    sub:   'Onboarded at intake',
  },
];

export default function JoinProcess() {
  return (
    <section id="process" className="relative bg-boi-bg-2 py-28 px-6 overflow-hidden">
      {/* Accent blurs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-boi-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-3">
            // SECTION 05
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            How to Join
          </h2>
          <div className="divider w-24" />
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[28px] top-10 bottom-10 w-px bg-gradient-to-b from-boi-gold/40 via-boi-gold/20 to-transparent hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-6 group"
              >
                {/* Circle marker */}
                <div className="flex-shrink-0 w-14 h-14 border border-boi-gold/40 bg-boi-gold/10 flex items-center justify-center clip-corner-sm group-hover:border-boi-gold group-hover:bg-boi-gold/20 transition-all duration-300">
                  <step.icon size={20} className="text-boi-gold" />
                </div>

                {/* Content */}
                <div className="clip-corner border border-boi-border bg-boi-bg p-6 flex-1 group-hover:border-boi-gold/30 transition-colors duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[10px] tracking-widest text-boi-gold">{step.num}</span>
                    <span className="w-6 h-px bg-boi-border" />
                    <span className="font-mono text-[9px] tracking-widest text-boi-muted uppercase">{step.sub}</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-white mb-2 group-hover:text-boi-gold transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-boi-muted text-sm leading-relaxed">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <button
            onClick={() => document.querySelector('#apply')?.scrollIntoView({ behavior: 'smooth' })}
            className="clip-corner bg-boi-gold text-boi-bg font-mono text-sm font-bold tracking-widest px-10 py-4 uppercase hover:bg-boi-gold-lt transition-colors duration-200"
          >
            Begin Application
          </button>
        </motion.div>
      </div>
    </section>
  );
}
