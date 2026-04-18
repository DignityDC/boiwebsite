'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronRight, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

/* ─── Password Gate ─────────────────────────────────────────── */
function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/quiz/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Incorrect password.');
      } else {
        onUnlock(password, data.questions);
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md"
    >
      <div className="clip-corner border border-boi-border bg-boi-bg-2 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 border border-boi-gold/30 bg-boi-gold/10 flex items-center justify-center clip-corner-sm">
            <Lock size={16} className="text-boi-gold" />
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-widest text-boi-gold uppercase">Restricted</div>
            <div className="font-serif font-bold text-white text-lg leading-none mt-0.5">Access Required</div>
          </div>
        </div>

        <p className="text-boi-muted text-sm leading-relaxed mb-8">
          This quiz is for Bureau personnel only. Enter the access code provided by your training officer to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono text-[9px] tracking-widest text-boi-muted uppercase block mb-2">
              Access Code
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-boi-bg border border-boi-border focus:border-boi-gold/50 text-white font-mono text-sm px-4 py-3 outline-none transition-colors duration-200 placeholder:text-boi-muted/40"
              placeholder="Enter code..."
              autoComplete="off"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full clip-corner bg-boi-gold text-boi-bg font-mono text-xs font-bold tracking-widest px-6 py-3.5 uppercase hover:bg-boi-gold-lt transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <>Unlock Quiz <ChevronRight size={14} /></>}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

/* ─── Question Renderer ─────────────────────────────────────── */
function Question({ q, index, value, onChange }) {
  if (q.type === 'paragraph') {
    return (
      <div>
        <label className="font-mono text-[9px] tracking-widest text-boi-gold uppercase block mb-2">
          Q{index + 1}
        </label>
        <p className="text-white font-sans text-sm font-medium mb-3">{q.question}</p>
        <textarea
          rows={4}
          value={value || ''}
          onChange={(e) => onChange(q.id, e.target.value)}
          className="w-full bg-boi-bg border border-boi-border focus:border-boi-gold/50 text-white text-sm px-4 py-3 outline-none transition-colors duration-200 resize-none placeholder:text-boi-muted/40 font-sans"
          placeholder="Type your answer here..."
        />
      </div>
    );
  }

  if (q.type === 'yesno') {
    return (
      <div>
        <label className="font-mono text-[9px] tracking-widest text-boi-gold uppercase block mb-2">
          Q{index + 1}
        </label>
        <p className="text-white font-sans text-sm font-medium mb-4">{q.question}</p>
        <div className="flex gap-3">
          {['Yes', 'No'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(q.id, opt)}
              className={`clip-corner-sm flex-1 border font-mono text-xs tracking-widest uppercase px-5 py-3 transition-all duration-200 ${
                value === opt
                  ? 'border-boi-gold bg-boi-gold/20 text-boi-gold'
                  : 'border-boi-border bg-boi-bg text-boi-muted hover:border-boi-gold/40 hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (q.type === 'multiple') {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (opt) => {
      if (selected.includes(opt)) {
        onChange(q.id, selected.filter((o) => o !== opt));
      } else {
        onChange(q.id, [...selected, opt]);
      }
    };
    return (
      <div>
        <label className="font-mono text-[9px] tracking-widest text-boi-gold uppercase block mb-2">
          Q{index + 1}
        </label>
        <p className="text-white font-sans text-sm font-medium mb-1">{q.question}</p>
        <p className="font-mono text-[9px] text-boi-muted mb-4">Select all that apply</p>
        <div className="space-y-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`w-full clip-corner-sm border text-left font-sans text-sm px-4 py-3 transition-all duration-200 flex items-center gap-3 ${
                selected.includes(opt)
                  ? 'border-boi-gold bg-boi-gold/10 text-white'
                  : 'border-boi-border bg-boi-bg text-boi-muted hover:border-boi-gold/30 hover:text-white'
              }`}
            >
              <span className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${selected.includes(opt) ? 'border-boi-gold bg-boi-gold' : 'border-boi-border'}`}>
                {selected.includes(opt) && <span className="text-boi-bg text-[10px] font-bold">✓</span>}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/* ─── Quiz Form ─────────────────────────────────────────────── */
function QuizForm({ questions, password }) {
  const [answers, setAnswers]   = useState({});
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');

  const setAnswer = (id, val) => setAnswers((prev) => ({ ...prev, [id]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/quiz/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password, answers, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Submission failed. Please try again.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="clip-corner border border-boi-gold/30 bg-boi-bg-2 p-12 text-center">
          <div className="w-16 h-16 border border-boi-gold/30 bg-boi-gold/10 flex items-center justify-center clip-corner-sm mx-auto mb-6">
            <CheckCircle size={28} className="text-boi-gold" />
          </div>
          <h2 className="font-serif font-bold text-white text-3xl mb-3">Submission Received</h2>
          <p className="text-boi-muted font-mono text-xs tracking-widest uppercase mb-6">Bureau of Operational Integrity</p>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-boi-gold/40 to-transparent mx-auto mb-6" />
          <p className="text-boi-muted leading-relaxed max-w-sm mx-auto">
            Your quiz has been submitted to your instructors for review.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="clip-corner border border-boi-border bg-boi-bg-2 p-8 mb-4">
          <p className="font-mono text-[9px] tracking-widest text-boi-gold uppercase mb-2">Your Name</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-boi-bg border border-boi-border focus:border-boi-gold/50 text-white font-mono text-sm px-4 py-3 outline-none transition-colors duration-200 placeholder:text-boi-muted/40"
            placeholder="Enter your name exactly as it is in the BOI discord..."
            required
          />
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="clip-corner border border-boi-border bg-boi-bg-2 p-8"
            >
              <Question q={q} index={i} value={answers[q.id]} onChange={setAnswer} />
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-xs font-mono">
            <AlertCircle size={12} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full clip-corner bg-boi-gold text-boi-bg font-mono text-xs font-bold tracking-widest px-6 py-4 uppercase hover:bg-boi-gold-lt transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Submitting...</>
            : <><Send size={14} /> Submit Quiz</>
          }
        </button>
      </form>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function QuizPage() {
  const [unlocked, setUnlocked]   = useState(false);
  const [password, setPassword]   = useState('');
  const [questions, setQuestions] = useState([]);

  const handleUnlock = (pw, qs) => {
    setPassword(pw);
    setQuestions(qs);
    setUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-boi-bg flex flex-col">
      {/* Header */}
      <div className="border-b border-boi-border bg-boi-bg/95 backdrop-blur-md px-6 py-4 flex items-center gap-3">
        <Image src="/boi-seal.png" alt="BOI Seal" width={32} height={32} className="object-contain" style={{ mixBlendMode: 'multiply' }} />
        <div>
          <div className="font-serif font-bold text-sm leading-none text-boi-gold tracking-wide">B.O.I.</div>
          <div className="font-mono text-[7px] tracking-[0.18em] text-boi-muted uppercase">Bureau Quiz System</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl mb-10 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-3">
            // Internal Assessment
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Bureau Quiz
          </h1>
          <div className="divider w-24 mx-auto" />
        </div>

        <AnimatePresence mode="wait">
          {!unlocked ? (
            <PasswordGate key="gate" onUnlock={handleUnlock} />
          ) : (
            <QuizForm key="quiz" questions={questions} password={password} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
