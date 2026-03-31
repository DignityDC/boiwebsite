'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const eligible = [
  { text: 'Must hold the rank of Supervisor or above within JDO.' },
  { text: 'Must be consistently active within the department.' },
  { text: 'Must have no punishments within the last month.' },
  { text: 'Must be professional at all times, in all environments.' },
  { text: 'Must be 15 years of age or older.' },
  { text: 'Must be well-regarded within the JDO community.' },
  { text: 'Department heads must agree you meet the standard to join BOI.' },
];

const disqualifying = [
  { text: 'Any active or recent punishment within the past month.' },
  { text: 'Rank below Supervisor within JDO.' },
  { text: 'Under 15 years of age.' },
  { text: 'History of powertriping or abusive conduct toward officers.' },
  { text: 'Lack of support from existing department heads.' },
];

const preferred = [
  'Prior experience in training or oversight roles within JDO',
  'Strong understanding of proper roleplay scene procedure',
  'Demonstrated ability to mentor and guide rather than punish',
  'Reputation for fairness and professionalism among peers',
];

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] } },
});

export default function Requirements() {
  return (
    <section id="requirements" className="relative bg-boi-bg py-28 px-6 hex-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-boi-bg-2 via-transparent to-boi-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ── Header ── */}
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
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-5">
            Eligibility Requirements
          </h2>
          <div className="divider w-24 mb-4" />
          <p className="text-boi-muted max-w-xl leading-relaxed">
            The requirements below are firm. Meeting them all does not guarantee acceptance,
            department heads have final say. If you are unsure whether you qualify, apply anyway
            and let leadership decide.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Eligible column ── */}
          <motion.div
            variants={fadeUp(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="clip-corner border border-boi-border bg-boi-bg-2 h-full p-7">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle size={18} className="text-green-400" />
                <span className="font-mono text-[10px] tracking-widest text-green-400 uppercase">
                  Qualifying Criteria
                </span>
              </div>
              <ul className="space-y-4">
                {eligible.map((e, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 border border-green-400/40 bg-green-400/10 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    </span>
                    <span className="text-boi-muted text-sm leading-relaxed">{e.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* ── Disqualifying + preferred columns ── */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Disqualifying */}
            <motion.div
              variants={fadeUp(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="clip-corner border border-boi-border bg-boi-bg-2 p-7">
                <div className="flex items-center gap-3 mb-6">
                  <XCircle size={18} className="text-red-400" />
                  <span className="font-mono text-[10px] tracking-widest text-red-400 uppercase">
                    Automatic Disqualifiers
                  </span>
                </div>
                <ul className="space-y-3">
                  {disqualifying.map((d, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 flex-shrink-0 w-3 h-3 border border-red-400/40 bg-red-400/10" />
                      <span className="text-boi-muted text-sm leading-relaxed">{d.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Preferred qualifications */}
            <motion.div
              variants={fadeUp(0.2)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="clip-corner border border-boi-gold/25 bg-boi-gold/5 p-7">
                <div className="flex items-center gap-3 mb-5">
                  <AlertTriangle size={16} className="text-boi-gold" />
                  <span className="font-mono text-[10px] tracking-widest text-boi-gold uppercase">
                    Preferred Qualifications (Not Required)
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {preferred.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 border border-boi-border bg-boi-bg p-3"
                    >
                      <span className="font-mono text-boi-gold text-xs mt-0.5">+</span>
                      <span className="text-boi-muted text-xs leading-relaxed">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Note */}
            <motion.div
              variants={fadeUp(0.3)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="clip-corner-sm border-l-2 border-boi-border bg-boi-bg-2 p-5"
            >
              <p className="font-mono text-[9px] tracking-widest text-boi-muted uppercase mb-2">
                NOTE ON EXPERIENCE
              </p>
              <p className="text-boi-muted text-sm leading-relaxed">
                BOI is about teaching, not punishing. We are looking for people who correct
                others by guiding them the right way, not those who reach for punishment
                first. That mindset is a requirement, not a preference.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
