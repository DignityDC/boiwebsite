'use client';

import { motion } from 'framer-motion';
import { Scale, Shield, GraduationCap, Eye } from 'lucide-react';
import Image from 'next/image';

const divisions = [
  {
    abbr:  'AT',
    name:  'Appeals Team',
    req:   'BOI Supervisor+',
    seal:  '/appeals-seal.png',
    color: 'text-boi-gold border-boi-gold/30 bg-boi-gold/10',
    glow:  'hover:border-boi-gold/50',
    icon:  Scale,
    desc:  'Inside the department hub we review appeals that officers have made post-punishment. We ensure every decision was fair, and where it wasn\'t, we lower or remove the punishment accordingly.',
  },
  {
    abbr:  'BTA',
    name:  'Bureau Training Academy',
    req:   'BOI Supervisor+',
    seal:  '/bta-seal.png',
    color: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    glow:  'hover:border-amber-400/50',
    icon:  GraduationCap,
    desc:  'We oversee training sessions to ensure they are being run professionally and that all required material is covered in full. We also train and onboard new BOI agents, setting the standard from day one.',
  },
  {
    abbr:  'OIA',
    name:  'Office of Internal Affairs',
    req:   'BOI Member',
    seal:  '/ia-seal.png',
    color: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
    glow:  'hover:border-yellow-500/50',
    icon:  Shield,
    desc:  'We handle incoming reports and overview existing ones to ensure they are being processed fairly and without bias. Every case is reviewed with impartiality and consistency.',
  },
  {
    abbr:  'FID',
    name:  'Field Integrity Division',
    req:   'BOI Member',
    seal:  '/fid-seal.png',
    color: 'text-zinc-300 border-zinc-300/30 bg-zinc-300/10',
    glow:  'hover:border-zinc-300/50',
    icon:  Eye,
    desc:  'The in-game integrity arm of the Bureau. FID oversees all active scenes in the field to ensure officers are conducting themselves with professionalism and proper procedure.',
  },
];

const cardVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Subdivisions() {
  return (
    <section id="divisions" className="relative bg-boi-bg-2 py-28 px-6 overflow-hidden">
      {/* BG accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-boi-gold/4 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-boi-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-3">
              // SECTION 02
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Operational Divisions
            </h2>
            <div className="divider w-24" />
          </div>
          <p className="text-boi-muted font-mono text-xs max-w-sm text-right leading-relaxed">
            BOI operates four specialized divisions under the JDO umbrella, each handling
            a distinct area of oversight, accountability, and officer development.
          </p>
        </motion.div>

        {/* ── Cards grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {divisions.map((div, i) => (
            <motion.div
              key={div.abbr}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`clip-corner border border-boi-border bg-boi-bg p-6 group transition-colors duration-300 ${div.glow} cursor-default`}
            >
              {/* Icon / Seal */}
              <div className="flex items-start justify-end mb-5">
                {div.seal ? (
                  <Image src={div.seal} alt={`${div.name} seal`} width={48} height={48} className="object-contain" style={{ mixBlendMode: 'screen' }} />
                ) : (
                  <div className="p-2 border border-boi-border bg-boi-bg-2 rounded-sm">
                    <div.icon size={14} className="text-boi-gold" />
                  </div>
                )}
              </div>

              {/* Abbreviation */}
              <div className="font-serif text-3xl font-bold text-boi-gold text-glow-sm mb-1 tracking-widest">
                {div.abbr}
              </div>

              {/* Name */}
              <h3 className="font-sans font-semibold text-sm text-white mb-2 leading-snug group-hover:text-boi-gold transition-colors duration-200">
                {div.name}
              </h3>

              {/* Req badge */}
              <div className={`inline-flex items-center border px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase mb-3 ${div.color}`}>
                {div.req}
              </div>

              {/* Divider */}
              <div className="divider mb-3" />

              {/* Description */}
              <p className="text-boi-muted text-xs leading-relaxed">
                {div.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Org chart note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 border border-boi-border bg-boi-bg clip-corner p-5 flex items-start gap-4"
        >
          <div className="w-1 self-stretch bg-boi-gold/50 rounded-full" />
          <div>
            <p className="font-mono text-[9px] tracking-widest text-boi-gold uppercase mb-1">
              ORGANIZATIONAL NOTE
            </p>
            <p className="text-boi-muted text-sm leading-relaxed">
              All divisions report directly to BOI leadership. Every division is rooted in the
              same core principle, we are here to <span className="text-white">teach and improve</span>,
              not to punish. Punishment is always the last resort.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
