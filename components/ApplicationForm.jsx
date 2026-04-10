'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';

const EMPTY = {
  username: '', discordId: '', age: '', rank: '',
  experience: '', reason: '', additional: '',
};

export default function ApplicationForm() {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim())   errs.username   = 'Username is required';
    if (!form.discordId.trim())  errs.discordId  = 'Discord ID is required';
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
    } catch {
      setErrors({ _global: 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="apply" className="relative bg-boi-bg py-28 px-6 grid-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-boi-bg-2 to-transparent h-24 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* ── Header ── */}
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

        {/* ── Success state ── */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="clip-corner border border-green-400/30 bg-green-400/5 p-10 text-center"
          >
            <CheckCircle size={42} className="text-green-400 mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-white mb-2">Application Received</h3>
            <p className="text-boi-muted text-sm leading-relaxed max-w-sm mx-auto">
              Your submission has been logged. Bureau leadership will review your file within
              24–72 hours. You will be contacted via Discord if selected for interview.
            </p>
            <p className="font-mono text-[10px] tracking-widest text-boi-gold uppercase mt-6">
              // STAND BY FOR CONTACT
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Form header bar */}
            <div className="clip-corner-br bg-boi-gold/10 border border-boi-gold/30 px-5 py-3 flex items-center justify-between mb-0.5">
              <span className="font-mono text-[10px] tracking-[0.2em] text-boi-gold uppercase">
                BOI, OFFICIAL RECRUITMENT APPLICATION
              </span>
              <span className="font-mono text-[10px] text-boi-muted">FORM-001</span>
            </div>

            <div className="clip-corner border border-boi-border bg-boi-bg-2 p-8 space-y-6">
              {/* Row 1 */}
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Username *" name="username" placeholder="Your username" value={form.username} onChange={update} error={errors.username} />
                <Field label="Discord ID *" name="discordId" placeholder="e.g. 123456789012" value={form.discordId} onChange={update} error={errors.discordId} />
              </div>

              {/* Row 2 */}
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
                  <>
                    <Send size={14} />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
}

/* ─── Field helpers ────────────────────────────── */
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
    <p className="font-mono text-[10px] text-red-400 mt-1.5 tracking-wide">
      ⚠ {msg}
    </p>
  );
}
