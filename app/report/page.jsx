'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FIELD = 'w-full bg-boi-bg border border-boi-border focus:border-boi-gold/50 text-white font-mono text-sm px-4 py-3 outline-none transition-colors duration-200 placeholder:text-boi-muted/40 resize-none';

export default function ReportPage() {
  const [form, setForm] = useState({
    reporterName: '',
    reportedId:   '',
    reason:       '',
    evidence:     '',
    additional:   '',
  });
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-boi-bg pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border border-boi-gold/30 bg-boi-gold/10 flex items-center justify-center clip-corner-sm">
                <AlertTriangle size={16} className="text-boi-gold" />
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-widest text-boi-gold uppercase">Internal Affairs</div>
                <div className="font-serif font-bold text-white text-2xl leading-none mt-0.5">Report a BOI Agent</div>
              </div>
            </div>

            {/* Important notice */}
            <div className="border border-amber-500/40 bg-amber-500/5 p-4 clip-corner-sm">
              <p className="font-mono text-xs text-amber-400 leading-relaxed">
                <span className="font-bold">IMPORTANT:</span> This form is exclusively for reporting agents of the{' '}
                <span className="text-white font-bold">Bureau of Operational Integrity</span>. If you need to report a
                regular officer, please do so through the <span className="text-white font-bold">JDO Discord</span>.
              </p>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="clip-corner border border-boi-border bg-boi-bg-2 p-10 text-center"
              >
                <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
                <h2 className="font-serif font-bold text-white text-xl mb-2">Report Submitted</h2>
                <p className="text-boi-muted text-sm leading-relaxed">
                  Your report has been received by BOI Internal Affairs. A staff member will review it shortly.
                </p>
                <p className="text-boi-muted/60 text-xs font-mono mt-3">
                  Note: You will not receive updates or be informed of the outcome. All reports are handled internally and kept confidential.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                onSubmit={handleSubmit}
                className="clip-corner border border-boi-border bg-boi-bg-2 p-8 space-y-6"
              >
                {/* Reporter name (optional) */}
                <div>
                  <label className="font-mono text-[9px] tracking-widest text-boi-muted uppercase block mb-2">
                    Your Name <span className="text-boi-muted/50">(Optional — leave blank to report anonymously)</span>
                  </label>
                  <input
                    type="text"
                    value={form.reporterName}
                    onChange={set('reporterName')}
                    className={FIELD}
                    placeholder="Your name or callsign..."
                    maxLength={80}
                  />
                </div>

                {/* Reported agent Discord ID */}
                <div>
                  <label className="font-mono text-[9px] tracking-widest text-boi-muted uppercase block mb-2">
                    Reported Agent's Discord ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.reportedId}
                    onChange={set('reportedId')}
                    className={FIELD}
                    placeholder="e.g. 123456789012345678"
                    pattern="^\d{17,19}$"
                    title="Must be a valid Discord user ID (17–19 digits)"
                    required
                    maxLength={20}
                  />
                  <p className="font-mono text-[9px] text-boi-muted/60 mt-1.5">
                    Right-click the user in Discord → Copy User ID (Developer Mode must be enabled)
                  </p>
                </div>

                {/* Reason */}
                <div>
                  <label className="font-mono text-[9px] tracking-widest text-boi-muted uppercase block mb-2">
                    Reason for Report <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.reason}
                    onChange={set('reason')}
                    className={FIELD}
                    rows={4}
                    placeholder="Describe the conduct or violation being reported..."
                    required
                    maxLength={1000}
                  />
                </div>

                {/* Evidence */}
                <div>
                  <label className="font-mono text-[9px] tracking-widest text-boi-muted uppercase block mb-2">
                    Evidence <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.evidence}
                    onChange={set('evidence')}
                    className={FIELD}
                    rows={3}
                    placeholder="Paste links to screenshots, videos, or other evidence (one per line)..."
                    required
                    maxLength={1000}
                  />
                  <p className="font-mono text-[9px] text-boi-muted/60 mt-1.5">
                    Provide Imgur, YouTube, Streamable, or any direct links. One link per line is recommended.
                  </p>
                </div>

                {/* Additional info */}
                <div>
                  <label className="font-mono text-[9px] tracking-widest text-boi-muted uppercase block mb-2">
                    Additional Information <span className="text-boi-muted/50">(Optional)</span>
                  </label>
                  <textarea
                    value={form.additional}
                    onChange={set('additional')}
                    className={FIELD}
                    rows={3}
                    placeholder="Any other context or information relevant to this report..."
                    maxLength={600}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-400 text-xs font-mono border border-red-400/20 bg-red-400/5 p-3">
                    <AlertCircle size={13} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="clip-corner-sm w-full bg-boi-gold text-boi-bg font-mono text-xs font-bold tracking-widest px-6 py-3 uppercase hover:bg-boi-gold-lt transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                  ) : (
                    <><Send size={14} /> Submit Report</>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}
