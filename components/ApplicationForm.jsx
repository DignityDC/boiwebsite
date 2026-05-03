'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import Image from 'next/image';

const EMPTY = {
  age: '', rank: '', experience: '', reason: '', additional: '',
};

export default function ApplicationForm() {
  const [discordUser, setDiscordUser]     = useState(null);
  const [authChecked, setAuthChecked]     = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(true);
  const [statusChecked, setStatusChecked] = useState(false);
  const [form, setForm]                   = useState(EMPTY);
  const [errors, setErrors]               = useState({});
  const [submitted, setSubmitted]         = useState(false);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    fetch('/api/applications/status')
      .then((r) => r.json())
      .then(({ open }) => { setApplicationsOpen(open); setStatusChecked(true); })
      .catch(() => setStatusChecked(true));

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(({ user }) => { setDiscordUser(user); setAuthChecked(true); })
      .catch(() => setAuthChecked(true));
  }, []);

  const handleDisconnect = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' });
    setDiscordUser(null);
  };

  const update = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.age.trim())        errs.age        = 'Age is required';
    if (!form.experience.trim()) errs.experience = 'Experience is required';
    if (!form.reason.trim())     errs.reason     = 'This field is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/apply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (res.status === 401) throw new Error('auth');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw Object.assign(new Error('server'), { serverMsg: data.error });
      }
      setSubmitted(true);
    } catch (err) {
      if (err.message === 'auth') {
        setErrors({ _global: 'Your Discord session expired. Please reconnect and try again.' });
        setDiscordUser(null);
      } else {
        setErrors({ _global: err.serverMsg || 'Submission failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="apply" className="relative bg-boi-bg py-28 px-6 grid-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-boi-bg-2 to-transparent h-24 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <Image src="/boi-seal.png" alt="BOI Seal" width={80} height={80} className="mx-auto mb-6 object-contain" />
          <p className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-3">
            // SECTION 05, INTAKE FORM
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Submit Application
          </h2>
          <div className="divider w-24 mx-auto mb-5" />
          <p className="text-boi-muted max-w-lg mx-auto text-sm leading-relaxed">
            Your application will be reviewed directly by Bureau leadership. Ensure all information
            is accurate. Falsified submissions are grounds for permanent disqualification.
          </p>
        </motion.div>

        {/* Success state */}
        {!statusChecked ? null : !applicationsOpen ? (
          /* Applications closed */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="clip-corner border border-boi-border bg-boi-bg-2 p-10 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-boi-gold/10 border border-boi-gold/30 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={24} className="text-boi-gold" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">Applications Closed</h3>
            <p className="text-boi-muted text-sm leading-relaxed max-w-xs mx-auto">
              Bureau recruitment is not currently accepting applications. Please check back later.
            </p>
            <p className="font-mono text-[10px] tracking-widest text-boi-gold uppercase mt-6">
              // RECRUITMENT SUSPENDED
            </p>
          </motion.div>

        ) : submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="clip-corner border border-green-400/30 bg-green-400/5 p-10 text-center"
          >
            <CheckCircle size={42} className="text-green-400 mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-white mb-2">Application Received</h3>
            <p className="text-boi-muted text-sm leading-relaxed max-w-sm mx-auto">
              Your submission has been logged. Bureau leadership will review your file.
              You will be contacted via Discord if selected for interview.
              YOUR DISCORD DMS MUST BE ENABLED, IF THEY ARE NOT YOU WILL NOT RECEIVE A RESPONSE.
            </p>
            <p className="font-mono text-[10px] tracking-widest text-boi-gold uppercase mt-6">
              // STAND BY FOR CONTACT
            </p>
          </motion.div>

        ) : !authChecked ? null : !discordUser ? (
          /* Discord OAuth gate */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="clip-corner border border-boi-border bg-boi-bg-2 p-10 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#5865f2]/20 border border-[#5865f2]/40 flex items-center justify-center mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#5865f2">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">Connect with Discord</h3>
            <p className="text-boi-muted text-sm leading-relaxed max-w-xs mx-auto mb-8">
              Authorize your Discord account to continue. We only read your username and ID, nothing else.
            </p>
            <a
              href="/api/auth/discord"
              className="inline-flex items-center gap-2 clip-corner bg-[#5865f2] hover:bg-[#4752c4] text-white font-mono text-xs font-bold tracking-widest px-8 py-3.5 uppercase transition-colors duration-200"
            >
              Authorize with Discord
            </a>
          </motion.div>

        ) : (
          /* Application form */
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Discord user badge */}
            <div className="clip-corner-br bg-[#5865f2]/10 border border-[#5865f2]/30 px-5 py-3 flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#5865f2">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                <span className="font-mono text-[10px] text-[#5865f2] tracking-widest">
                  Authenticated as <span className="text-white">{discordUser.global_name || discordUser.username}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleDisconnect}
                className="font-mono text-[9px] text-boi-muted hover:text-white tracking-widest flex items-center gap-1 transition-colors"
              >
                <LogOut size={10} /> Disconnect
              </button>
            </div>

            {/* Form header bar */}
            <div className="bg-boi-gold/10 border border-boi-gold/30 border-t-0 px-5 py-3 flex items-center justify-between mb-0.5">
              <span className="font-mono text-[10px] tracking-[0.2em] text-boi-gold uppercase">
                BOI, OFFICIAL RECRUITMENT APPLICATION
              </span>
              <span className="font-mono text-[10px] text-boi-muted">FORM-001</span>
            </div>

            <div className="clip-corner border border-boi-border bg-boi-bg-2 p-8 space-y-6">
              {/* Row 1 */}
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Age *" name="age" placeholder="Your age" type="number" value={form.age} onChange={update} error={errors.age} />
                <Field label="Current Rank / Role" name="rank" placeholder="If applicable" value={form.rank} onChange={update} error={errors.rank} />
              </div>

              {/* Experience */}
              <Textarea label="Operational Experience *" name="experience" placeholder="Describe any relevant experience, organizations, roles, responsibilities. Be direct and honest." value={form.experience} onChange={update} error={errors.experience} rows={4} maxLen={600} />

              {/* Reason */}
              <Textarea label="Why do you want to join the Bureau? *" name="reason" placeholder="Tell us why you are applying and what you expect to contribute." value={form.reason} onChange={update} error={errors.reason} rows={4} maxLen={600} />

              {/* Additional */}
              <Textarea label="Additional Information" name="additional" placeholder="Anything else leadership should know." value={form.additional} onChange={update} error={errors.additional} rows={3} maxLen={400} />

              {/* Notice */}
              <div className="flex items-start gap-3 border border-boi-border bg-boi-bg p-4">
                <AlertCircle size={14} className="text-boi-gold mt-0.5 flex-shrink-0" />
                <p className="font-mono text-[10px] leading-relaxed text-boi-muted">
                  By submitting this form you confirm that all information provided is accurate
                  and that you have read the eligibility requirements. Misrepresentation constitutes
                  grounds for immediate disqualification and potential ban from future applications.
                </p>
              </div>

              {errors._global && (
                <p className="font-mono text-[10px] text-red-400 text-center">{errors._global}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="clip-corner w-full bg-boi-gold text-boi-bg font-mono text-sm font-bold tracking-widest py-4 uppercase hover:bg-boi-gold-lt transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="animate-pulse">PROCESSING…</span>
                ) : (
                  <><Send size={14} /> Submit Application</>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
}

/* Field helpers */
function Field({ label, name, placeholder, type = 'text', value, onChange, error }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input ${error ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/20' : ''}`}
      />
      {error && <FieldError msg={error} />}
    </div>
  );
}

function Textarea({ label, name, placeholder, value, onChange, error, rows = 4, maxLen }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="form-label mb-0">{label}</label>
        {maxLen && (
          <span className="font-mono text-[9px] text-boi-muted">
            {value.length} / {maxLen}
          </span>
        )}
      </div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLen}
        className={`form-input resize-none ${error ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/20' : ''}`}
      />
      {error && <FieldError msg={error} />}
    </div>
  );
}

function FieldError({ msg }) {
  return (
    <p className="font-mono text-[10px] text-red-400 mt-1.5 tracking-wide">âš  {msg}</p>
  );
}

