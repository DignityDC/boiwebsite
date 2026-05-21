'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function timeAgo(ms) {
  const secs = Math.floor((Date.now() - ms) / 1000);
  if (secs < 60)   return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function formatDate(ms) {
  return new Date(ms).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_CONFIG = {
  pending: {
    icon:        <Clock size={40} className="text-boi-gold" />,
    label:       'Under Review',
    color:       'border-boi-gold/30 bg-boi-gold/5',
    iconBg:      'bg-boi-gold/10 border-boi-gold/30',
    labelColor:  'text-boi-gold',
    description: 'Your application has been received and is awaiting review by Bureau leadership.',
  },
  accepted: {
    icon:        <CheckCircle size={40} className="text-green-400" />,
    label:       'Accepted',
    color:       'border-green-400/30 bg-green-400/5',
    iconBg:      'bg-green-400/10 border-green-400/30',
    labelColor:  'text-green-400',
    description: 'Congratulations — your application has been accepted. You should have received a DM with next steps.',
  },
  denied: {
    icon:        <XCircle size={40} className="text-red-400" />,
    label:       'Denied',
    color:       'border-red-400/30 bg-red-400/5',
    iconBg:      'bg-red-400/10 border-red-400/30',
    labelColor:  'text-red-400',
    description: 'After review, Bureau leadership has decided not to move forward with this application at this time.',
  },
};

export default function ApplicationStatusPage() {
  const { id }                      = useParams();
  const [data, setData]             = useState(null);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [, setTick]                 = useState(0); // force re-render for live "time ago"

  useEffect(() => {
    if (!id) return;
    fetch(`/api/applications/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) { setError(json.error); }
        else { setData(json); }
        setLoading(false);
      })
      .catch(() => { setError('Failed to load application status.'); setLoading(false); });
  }, [id]);

  // Re-render every 30 s so "time ago" stays fresh
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const cfg = data ? STATUS_CONFIG[data.status] ?? STATUS_CONFIG.pending : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-boi-bg grid-bg pt-32 pb-20 px-6 flex items-start justify-center">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Top label */}
            <p className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-6 text-center">
              // APPLICATION STATUS
            </p>

            {loading && (
              <div className="clip-corner border border-boi-border bg-boi-bg-2 p-12 flex flex-col items-center gap-4">
                <Loader2 size={28} className="animate-spin text-boi-gold" />
                <span className="font-mono text-xs text-boi-muted tracking-widest uppercase">Loading...</span>
              </div>
            )}

            {!loading && error && (
              <div className="clip-corner border border-red-400/30 bg-red-400/5 p-10 text-center">
                <AlertCircle size={36} className="text-red-400 mx-auto mb-4" />
                <h2 className="font-serif text-xl text-white mb-2">Not Found</h2>
                <p className="text-boi-muted text-sm">{error}</p>
              </div>
            )}

            {!loading && data && cfg && (
              <div className={`clip-corner border p-8 ${cfg.color}`}>
                {/* Icon + status */}
                <div className="flex flex-col items-center text-center mb-8">
                  <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 ${cfg.iconBg}`}>
                    {cfg.icon}
                  </div>
                  <h2 className={`font-serif text-3xl font-bold mb-1 ${cfg.labelColor}`}>
                    {cfg.label}
                  </h2>
                  <p className="text-boi-muted text-sm max-w-xs leading-relaxed">
                    {cfg.description}
                  </p>
                </div>

                {/* Detail rows */}
                <div className="border-t border-white/10 pt-6 space-y-4 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-boi-muted uppercase tracking-widest">Application ID</span>
                    <span className="text-white">{data.appId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-boi-muted uppercase tracking-widest">Submitted</span>
                    <span className="text-white" title={formatDate(data.submittedAt)}>
                      {timeAgo(data.submittedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-boi-muted uppercase tracking-widest">Status</span>
                    <span className={`uppercase font-bold ${cfg.labelColor}`}>{data.status}</span>
                  </div>
                  {data.reviewedAt && (
                    <div className="flex justify-between">
                      <span className="text-boi-muted uppercase tracking-widest">Reviewed</span>
                      <span className="text-white" title={formatDate(data.reviewedAt)}>
                        {timeAgo(data.reviewedAt)}
                      </span>
                    </div>
                  )}
                </div>

                <p className="font-mono text-[9px] tracking-widest text-boi-muted/40 uppercase text-center mt-6">
                  // BUREAU OF OPERATIONAL INTEGRITY
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
