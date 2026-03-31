'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Shield, Users, Radio, Crosshair, BadgeCheck, AlertTriangle, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const sops = [
  {
    id: 'general-conduct',
    icon: BadgeCheck,
    number: 'SOP-001',
    title: 'General Conduct & Standards',
    color: 'text-boi-gold',
    border: 'border-boi-gold/30',
    sections: [
      {
        heading: '1.1, How You Should Act',
        body: `All Bureau personnel are expected to act professionally, stay fair, and maintain integrity at all times. This applies in-game, in Bureau environments, and anywhere you represent the Bureau. Your actions directly reflect on the department.`,
      },
      {
        heading: '1.2, Following Command',
        body: `Personnel must follow the chain of command at all times. Orders from leadership are to be followed unless they break Bureau policy or server rules. Any issues with orders must be handled through proper channels, not ignored or argued publicly.`,
      },
      {
        heading: '1.3, Communication Rules',
        body: `All official communication must be done through Bureau-approved channels. Keep communication professional, avoid guessing or discussing active cases, and do not share information with anyone who is not authorized.`,
      },
      {
        heading: '1.4, Conflicts of Interest',
        body: `If you are involved in a situation where you have bias or personal involvement, you must report it to a Head immediately. Failing to do so may result in disciplinary action or removal.`,
      },
      {
        heading: '1.5, Identity & Representation',
        body: `When acting as Bureau personnel, you must present yourself properly. Impersonation, misuse of Bureau identity, or falsely claiming rank or authority will result in immediate action.`,
      },
    ],
  },
  {
    id: 'investigations',
    icon: Shield,
    number: 'SOP-002',
    title: 'Investigations & Case Handling',
    color: 'text-orange-400',
    border: 'border-orange-400/30',
    sections: [
      {
        heading: '2.1, Starting a Case',
        body: `Cases can be started through reports, Every case must be logged before any investigation begins. No off-record investigations are allowed.`,
      },
      {
        heading: '2.2, Evidence Rules',
        body: `All evidence must be properly recorded with where it came from and when it was taken. Any evidence obtained unfairly or through rule-breaking is not allowed and may lead to disciplinary action.`,
      },
      {
        heading: '2.3, Rights of the Subject',
        body: `Anyone being investigated must be informed of what they are accused of and given a chance to respond before a final decision is made. Exceptions require approval from a Head`,
      },
      {
        heading: '2.4, Closing a Case',
        body: `Every case must have a written summary. No case can be closed without documentation.`,
      },
    ],
  },
  {
    id: 'operational-security',
    icon: Radio,
    number: 'SOP-003',
    title: 'Classification & Security',
    color: 'text-blue-400',
    border: 'border-blue-400/30',
    sections: [
      {
        heading: '3.1, Who Can See Information',
        body: `Information is shared strictly on a need-to-know basis. Do not access or look for information that is not part of your assigned duties.`,
      },
      {
        heading: '3.2, Sharing Information',
        body: `Do not share any Bureau information, cases, or internal matters outside of approved channels or with unauthorized people. All outside communication must be approved by a Division Lead.`,
      },
      {
        heading: '3.3, Handling Files',
        body: `All files, clips, or records created during Bureau work belong to the Bureau. They must not be kept, shared, or used outside of their intended purpose.`,
      },

    ],
  },
  {
    id: 'disciplinary',
    icon: FileText,
    number: 'SOP-004',
    title: 'Disciplinary Procedures',
    color: 'text-red-400',
    border: 'border-red-400/30',
    sections: [
      {
        heading: '4.1, What Gets You Disciplined',
        body: `Disciplinary action may happen for breaking rules, insubordination, misconduct, leaking information, misuse of authority, or behavior that harms the Bureau or server.`,
      },
      {
        heading: '4.2, How Discipline Works',
        body: `When action is taken, the individual will be notified and given at least 48 hours to respond. A review will be conducted by command members who are not involved in the case ensuring no bias.`,
      },
      {
        heading: '4.3, Punishments',
        body: `Punishments can range from warnings, to strikes, to full removal from the Bureau. These actions may also affect rank and position in the chain of command.`,
      },
      {
        heading: '4.4, Immediate Action',
        body: `If someone is posing a risk to the Bureau or its operations, leadership can temporarily remove them from duties without prior notice while the situation is reviewed.`,
      },
    ],
  },
  {
    id: 'special-operations',
    icon: Crosshair,
    number: 'SOP-005',
    title: 'Special Operations Protocols',
    color: 'text-rose-400',
    border: 'border-rose-400/30',
    sections: [
      {
        heading: '5.1, Approval for Operations',
        body: `All new operations must be approved by a Division Lead or higher before they begin. Running operations without approval is a violation.`,
      },
      {
        heading: '5.2, Staying Within Limits',
        body: `Personnel must stay within the approved scope of an operation. Anything outside of that scope must be approved before being carried out.`,
      },
      {
        heading: '5.3, Reporting After Operations',
        body: `All operations must have a report completed after they finish. This includes what was planned, what happened, who was involved, and any follow-up needed.`,
      },

    ],
  },
  {
    id: 'onboarding',
    icon: Users,
    number: 'SOP-006',
    title: 'Recruitment & Onboarding',
    color: 'text-green-400',
    border: 'border-green-400/30',
    sections: [
      {
        heading: '6.1, Recruitment Rules',
        body: `All recruitment must go through the official process. No one is allowed to offer positions outside of it.`,
      },
      {
        heading: '6.2, Reviewing Applications',
        body: `Applications must be reviewed by at least two members. Anyone with a personal connection to the applicant must step away from the review.`,
      },
      {
        heading: '6.3, Probation Period',
        body: `New members will go through a probation period where they are monitored and have limited access. They can be removed during this period if needed.`,
      },
      {
        heading: '6.4, Getting Started',
        body: `All new members must complete onboarding before starting duties. This includes learning structure, rules, and expectations.`,
      },
      {
        heading: '6.5, Leaving the Bureau',
        body: `When someone leaves, they must type a resignation letter in https://discord.com/channels/1488518595125444710/1488530141687840910. Those who leave in good standing may be allowed to return later.`,
      },
    ],
  },
  {
    id: 'command-structure',
    icon: BookOpen,
    number: 'SOP-007',
    title: 'Command Structure & Authority',
    color: 'text-purple-400',
    border: 'border-purple-400/30',
    sections: [
      {
        heading: '7.1, Who’s in Charge',
        body: `The Bureau is led by the Director of Operations, followed by Deputy director and this is explained more in https://discord.com/channels/1488518595125444710/1488519700651577405`,
      },
      {
        heading: '7.2, Authority',
        body: `Division Leads control their divisions and may assign responsibilities, but they are still accountable for outcomes.`,
      },
      {
        heading: '7.3, Acting Leadership',
        body: `If a Division Lead is unavailable, they must assign someone to act in their place.`,
      },
      {
        heading: '7.4, Cross-Division Orders',
        body: `No division has authority over another unless approved. Conflicts must be escalated to the Director.`,
      },
      {
        heading: '7.5, Disputes',
        body: `Any disputes are handled by the Director of Operational Integrity or Deputy Director.`,
      },
    ],
  },
];

export default function SOPPage() {
  const [open, setOpen] = useState(null);

  const toggle = (id) => setOpen((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-boi-bg">
      {/* ── Nav strip ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-boi-bg/95 backdrop-blur-md border-b border-boi-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/boi-seal.png" alt="BOI Seal" width={36} height={36} className="object-contain" />
            <div className="text-left">
              <div className="font-serif font-bold text-base leading-none text-boi-gold tracking-wide">B.O.I.</div>
              <div className="font-mono text-[8px] tracking-[0.18em] text-boi-muted uppercase">Bureau of Operational Integrity</div>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="font-mono text-xs tracking-widest text-boi-muted hover:text-boi-gold uppercase transition-colors duration-200">
              ← Back to Home
            </Link>
            <Link href="/#apply" className="clip-corner-sm bg-boi-gold text-boi-bg font-mono text-xs font-bold tracking-widest px-5 py-2.5 uppercase hover:bg-boi-gold-lt transition-colors duration-200">
              Apply Now
            </Link>
          </div>
        </div>
      </div>

      {/* ── Hero header ── */}
      <div className="relative pt-32 pb-20 px-6 grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(201,162,40,0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Image src="/boi-seal.png" alt="BOI Seal" width={100} height={100} className="mx-auto mb-6 object-contain drop-shadow-[0_0_20px_rgba(201,162,40,0.3)]" />
            <p className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-3">
              Bureau of Operational Integrity
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
              Standard Operating<br />
              <span className="text-boi-gold">Procedures</span>
            </h1>
            <div className="divider w-24 mx-auto mb-6" />
            <p className="text-boi-muted max-w-2xl mx-auto leading-relaxed">
              This document governs the conduct, processes, and operational standards of all Bureau
              personnel. These procedures are binding, publicly accessible, and subject to revision
              by Bureau leadership. All members are expected to be familiar with their contents.
            </p>
          </motion.div>

          {/* Quick-nav pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            {sops.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  toggle(s.id);
                  setTimeout(() => {
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className={`font-mono text-[10px] tracking-widest uppercase border px-3 py-1.5 transition-colors duration-200 ${s.border} hover:bg-boi-gold/10 text-boi-muted hover:text-white`}
              >
                {s.number}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── SOP Accordion ── */}
      <div className="max-w-4xl mx-auto px-6 pb-28 space-y-3 mt-4">
        {sops.map((sop, idx) => (
          <motion.div
            key={sop.id}
            id={sop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
          >
            {/* Accordion header */}
            <button
              onClick={() => toggle(sop.id)}
              className={`w-full clip-corner border ${open === sop.id ? 'border-boi-gold/40 bg-boi-bg-2' : 'border-boi-border bg-boi-bg-2 hover:border-boi-gold/25'} transition-colors duration-200 px-6 py-5 flex items-center justify-between gap-4 text-left`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 border ${sop.border} bg-boi-bg rounded-sm flex-shrink-0`}>
                  <sop.icon size={16} className={sop.color} />
                </div>
                <div>
                  <div className={`font-mono text-[9px] tracking-[0.25em] uppercase mb-0.5 ${sop.color}`}>
                    {sop.number}
                  </div>
                  <div className="font-serif font-bold text-white text-lg leading-tight">
                    {sop.title}
                  </div>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-boi-muted flex-shrink-0 transition-transform duration-300 ${open === sop.id ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Accordion body */}
            <AnimatePresence initial={false}>
              {open === sop.id && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className={`border-l border-r border-b ${sop.border} bg-boi-bg px-6 py-8 space-y-8`}>
                    {sop.sections.map((sec, i) => (
                      <div key={i} className="flex gap-5">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-1 h-full min-h-[24px] ${sop.color.replace('text-', 'bg-')}/30 rounded-full`} />
                        </div>
                        <div>
                          <h3 className={`font-mono text-[11px] tracking-[0.2em] uppercase font-bold mb-3 ${sop.color}`}>
                            {sec.heading}
                          </h3>
                          <p className="text-boi-muted text-sm leading-relaxed">
                            {sec.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* ── Footer notice ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 border border-boi-border bg-boi-bg-2 clip-corner p-6 flex items-start gap-4"
        >
          <AlertTriangle size={16} className="text-boi-gold mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-mono text-[9px] tracking-widest text-boi-gold uppercase mb-2">
              Notice on Revisions
            </p>
            <p className="text-boi-muted text-sm leading-relaxed">
              These procedures are maintained by Bureau leadership and are subject to amendment
              at any time. Personnel will be notified of significant revisions through official
              communication channels. It is each member's responsibility to remain current on
              standing procedures. Ignorance of policy does not constitute a defense.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
