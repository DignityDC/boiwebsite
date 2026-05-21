'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, Loader2, Paperclip } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function formatTs(ms) {
  return new Date(ms).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function MessageEmbed({ embed }) {
  if (!embed.title && !embed.description && !(embed.fields?.length)) return null;
  const borderColor = embed.color ?? '#4f545c';
  return (
    <div
      className="mt-1 rounded-r-md pl-3 py-2 pr-3 max-w-lg text-sm"
      style={{ borderLeft: `4px solid ${borderColor}`, background: 'rgba(255,255,255,0.04)' }}
    >
      {embed.title && <p className="font-semibold text-white mb-1">{embed.title}</p>}
      {embed.description && (
        <p className="text-boi-muted text-xs whitespace-pre-wrap leading-relaxed">{embed.description}</p>
      )}
      {embed.fields?.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
          {embed.fields.map((f, i) => (
            <div key={i} className={f.inline ? '' : 'col-span-2'}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-boi-muted">{f.name}</p>
              <p className="text-xs text-white/80">{f.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChatMessage({ msg, prevMsg }) {
  const sameAuthor = prevMsg && prevMsg.authorId === msg.authorId &&
    msg.timestamp - prevMsg.timestamp < 5 * 60 * 1000;

  const isBot = !msg.authorId || msg.authorId === '0';
  const accentColor = isBot ? '#c9a228' : '#ffffff';

  return (
    <div className={`flex gap-3 px-4 group hover:bg-white/[0.02] ${sameAuthor ? 'py-0.5' : 'pt-3 pb-0.5'}`}>
      {/* Avatar column */}
      <div className="w-9 flex-shrink-0">
        {!sameAuthor && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={msg.authorAvatar || `https://cdn.discordapp.com/embed/avatars/0.png`}
            alt=""
            className="w-9 h-9 rounded-full mt-0.5"
            onError={e => { e.currentTarget.src = 'https://cdn.discordapp.com/embed/avatars/0.png'; }}
          />
        )}
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        {!sameAuthor && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-semibold text-sm" style={{ color: accentColor }}>
              {msg.authorName}
            </span>
            <span className="text-[10px] text-boi-muted/60">{formatTs(msg.timestamp)}</span>
          </div>
        )}
        {msg.content && (
          <p className="text-sm text-white/85 whitespace-pre-wrap break-words leading-relaxed">
            {msg.content}
          </p>
        )}
        {msg.embeds?.map((e, i) => <MessageEmbed key={i} embed={e} />)}
        {msg.attachments?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {msg.attachments.map((a, i) => (
              /\.(png|jpe?g|gif|webp)$/i.test(a.name)
                ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={a.url} alt={a.name} className="max-w-xs max-h-60 rounded-md border border-white/10" />
                )
                : (
                  <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-boi-gold hover:underline bg-white/5 border border-boi-border rounded px-2 py-1"
                  >
                    <Paperclip size={11} /> {a.name}
                  </a>
                )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TranscriptPage() {
  const { id, userId }          = useParams();
  const [data, setData]         = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/transcripts/${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) setError(json.error);
        else setData(json);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load transcript.'); setLoading(false); });
  }, [id]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-boi-bg grid-bg pt-28 pb-20 px-4 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            <p className="font-mono text-[10px] tracking-[0.3em] text-boi-gold uppercase mb-4 text-center">
              // TICKET TRANSCRIPT
            </p>

            {loading && (
              <div className="clip-corner border border-boi-border bg-boi-bg-2 p-12 flex flex-col items-center gap-4">
                <Loader2 size={26} className="animate-spin text-boi-gold" />
                <span className="font-mono text-xs text-boi-muted tracking-widest uppercase">Loading...</span>
              </div>
            )}

            {!loading && error && (
              <div className="clip-corner border border-red-400/30 bg-red-400/5 p-10 text-center">
                <AlertCircle size={34} className="text-red-400 mx-auto mb-4" />
                <h2 className="font-serif text-xl text-white mb-2">Not Found</h2>
                <p className="text-boi-muted text-sm">{error}</p>
              </div>
            )}

            {!loading && data && (
              <>
                {/* Header */}
                <div className="clip-corner border border-boi-border bg-boi-bg-2 p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-boi-gold/10 border border-boi-gold/30 flex items-center justify-center">
                      <FileText size={18} className="text-boi-gold" />
                    </div>
                    <div>
                      <h1 className="font-serif text-xl text-white">#{data.channelName}</h1>
                      <p className="font-mono text-[10px] text-boi-muted uppercase tracking-widest">
                        Ticket Transcript
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div>
                      <p className="text-boi-muted uppercase tracking-widest text-[9px] mb-0.5">Transcript ID</p>
                      <p className="text-white">{data.transcriptId}</p>
                    </div>
                    {data.reportedUserId && (
                      <div>
                        <p className="text-boi-muted uppercase tracking-widest text-[9px] mb-0.5">Reported Agent</p>
                        <p className="text-white">{data.reportedUserId}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-boi-muted uppercase tracking-widest text-[9px] mb-0.5">Closed By</p>
                      <p className="text-white">{data.closedBy}</p>
                    </div>
                    <div>
                      <p className="text-boi-muted uppercase tracking-widest text-[9px] mb-0.5">Closed At</p>
                      <p className="text-white">{formatTs(data.closedAt)}</p>
                    </div>
                    <div>
                      <p className="text-boi-muted uppercase tracking-widest text-[9px] mb-0.5">Messages</p>
                      <p className="text-white">{data.messages.length}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="clip-corner border border-boi-border bg-boi-bg-2 py-3 overflow-hidden">
                  {data.messages.length === 0 && (
                    <p className="text-center text-boi-muted text-sm py-10">No messages in this ticket.</p>
                  )}
                  {data.messages.map((msg, i) => (
                    <ChatMessage key={msg.id} msg={msg} prevMsg={i > 0 ? data.messages[i - 1] : null} />
                  ))}
                  <div className="h-3" />
                </div>

                <p className="font-mono text-[9px] tracking-widest text-boi-muted/40 uppercase text-center mt-5">
                  // BUREAU OF OPERATIONAL INTEGRITY — TRANSCRIPT EXPIRES AFTER 90 DAYS
                </p>
              </>
            )}

          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
