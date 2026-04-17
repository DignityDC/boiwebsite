'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, GraduationCap, Briefcase, ChevronRight } from 'lucide-react';

const featured = {
  icon: GraduationCap,
  tag: 'BTA Exclusive',
  tagColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  num: '01',
  title: 'Automatic FTO Supervisor',
  body: 'Upon joining the Bureau Training Academy, you are automatically granted FTO Supervisor status. No additional application or waiting period required — it comes with the role.',
};

const rest = [
  {
    icon: Users,
    num: '02',
    title: 'Department Coordination',
    body: 'BOI service directly counts toward securing a Department Coordination spot, placing you in a cross-department leadership role.',
    tag: 'Career Progression',
    tagColor: 'text-green-400 border-green-400/30 bg-green-400/10',
  },
  {
    icon: Briefcase,
    num: '03',
    title: 'Pre-Command & Department Head Pipeline',
    body: 'BOI membership strengthens your candidacy for pre-command and department head positions — a direct pathway into upper leadership.',
    tag: 'Leadership Track',
    tagColor: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  },
  {
    icon: TrendingUp,
    num: '04',
    title: 'Executive-Level Experience',
    body: 'Operate at a pre-command, department head, and coordination level before formally holding those positions.',
    tag: 'Experience',
    tagColor: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="relative bg-boi-bg-2 py-28 px-6 overflow-hidden">
      {/* BG accents */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-boi-gold/4 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-boi-gold/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-3">
            // SECTION 03
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Why Join BOI
          </h2>
          <div className="divider w-24" />
        </motion.div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">

          {/* ── Featured card (left) ── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="clip-corner relative border border-boi-gold/30 bg-boi-bg p-10 flex flex-col justify-between overflow-hidden group"
          >
            {/* Large number watermark */}
            <div className="absolute -bottom-4 -right-2 font-serif font-bold text-[9rem] leading-none text-boi-gold/5 select-none pointer-events-none">
              {featured.num}
            </div>

            <div>
              {/* Tag */}
              <span className={`inline-flex items-center border px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase mb-8 ${featured.tagColor}`}>
                {featured.tag}
              </span>

              {/* Icon */}
              <div className="w-14 h-14 border border-boi-gold/30 bg-boi-gold/10 flex items-center justify-center clip-corner-sm mb-8">
                <featured.icon size={22} className="text-boi-gold" />
              </div>

              {/* Title */}
              <h3 className="font-serif font-bold text-white text-3xl md:text-4xl mb-5 leading-tight group-hover:text-boi-gold transition-colors duration-300">
                {featured.title}
              </h3>

              {/* Body */}
              <p className="text-boi-muted leading-relaxed max-w-md">
                {featured.body}
              </p>
            </div>

            {/* Bottom accent line */}
            <div className="mt-10 h-px w-full bg-gradient-to-r from-boi-gold/40 to-transparent" />
          </motion.div>

          {/* ── Stacked rows (right) ── */}
          <div className="flex flex-col gap-4">
            {rest.map((b, i) => (
              <motion.div
                key={b.num}
                initial={{ opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="clip-corner border border-boi-border bg-boi-bg p-6 flex gap-5 group hover:border-boi-gold/30 transition-colors duration-300"
              >
                {/* Number */}
                <div className="flex-shrink-0 font-serif font-bold text-4xl text-boi-gold/20 leading-none w-10 group-hover:text-boi-gold/40 transition-colors duration-300 select-none">
                  {b.num}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <b.icon size={14} className="text-boi-gold flex-shrink-0" />
                    <h3 className="font-serif font-bold text-white text-base leading-snug group-hover:text-boi-gold transition-colors duration-200">
                      {b.title}
                    </h3>
                  </div>
                  <p className="text-boi-muted text-sm leading-relaxed">
                    {b.body}
                  </p>
                </div>

                <ChevronRight size={14} className="text-boi-gold/20 group-hover:text-boi-gold/50 flex-shrink-0 self-center transition-colors duration-200" />
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
