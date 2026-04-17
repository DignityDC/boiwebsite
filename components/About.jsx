'use client';

import { motion } from 'framer-motion';
import { Shield, Eye, Target, FileText } from 'lucide-react';

const cards = [
  {
    icon: Shield,
    num:  '01',
    title: 'Review Appeals',
    body:  'We review appeals officers have made post-punishment, ensuring every decision is fair. Where punishments are unjust, we lower or remove them, no exceptions.',
  },
  {
    icon: Eye,
    num:  '02',
    title: 'Handle Reports',
    body:  'We handle officer reports to ensure they are being processed fairly and without bias. Accountability applies to the process, not just the outcome.',
  },
  {
    icon: Target,
    num:  '03',
    title: 'Monitor Training',
    body:  'We oversee training sessions to ensure they are being run professionally and that instructors are covering all required training materials completely.',
  },
  {
    icon: FileText,
    num:  '04',
    title: 'Field Oversight',
    body:  'Our department’s Field Division operates in-game, actively monitoring all scenes to ensure our officers uphold the highest standards of professionalism, integrity, and proper conduct at all times.',
  },
];

const inView = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function About() {
  return (
    <section id="about" className="relative bg-boi-bg grid-bg py-28 px-6">
      {/* Faint top fade */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-boi-bg to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-3">
            // SECTION 01
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-5">
            About the Bureau
          </h2>
          <div className="divider w-24" />
        </motion.div>

        {/* ── Two-column intro ── */}
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-boi-muted leading-relaxed text-base mb-6">
              The <span className="text-boi-gold font-semibold">Bureau of Operational Integrity</span> is
              a sub-department of JDO that ensures officers are acting professionally and that their
              work is integral. We exist to improve roleplay and the LEO experience as a whole.
            </p>
            <p className="text-boi-muted leading-relaxed text-base mb-6">
              We are <span className="text-white font-medium">not a punishment department.</span> That
              will always be the last resort. We are a teaching department, here to help officers
              become better, not to penalise them. We guide, we correct, and we develop.
            </p>
            <p className="text-boi-muted leading-relaxed text-base">
              We create better roleplay scenes that other officers take part in, building a richer
              environment where LEO can learn, grow, and reach a higher standard together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Mission block */}
            <div className="clip-corner border border-boi-border bg-boi-bg-2 p-6">
              <p className="font-mono text-[9px] tracking-[0.3em] text-boi-gold uppercase mb-3">
                MISSION STATEMENT
              </p>
              <p className="text-white font-serif text-xl leading-relaxed italic">
                &ldquo;To ensure accountability, enforce ethical standards, and protect trust
                through transparent oversight and integrity-driven operations.&rdquo;
              </p>
            </div>

          </motion.div>
        </div>

        {/* ── What we do cards ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-8"
        >
          // WHAT WE DO
        </motion.p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <motion.div
              key={c.num}
              custom={i}
              variants={inView}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="clip-corner border border-boi-border bg-boi-bg-2 p-6 group hover:border-boi-gold/40 transition-colors duration-300 border-glow"
            >
              <div className="flex items-start justify-between mb-4">
                <c.icon size={22} className="text-boi-gold" />
                <span className="font-mono text-[10px] text-boi-muted">{c.num}</span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-white mb-2 group-hover:text-boi-gold transition-colors">
                {c.title}
              </h3>
              <p className="text-boi-muted text-sm leading-relaxed">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
