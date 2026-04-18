import { NextResponse } from 'next/server';

function gradeAnswer(q, answer) {
  if (!('correct' in q)) return null; // no grading for this question

  if (q.type === 'yesno') {
    return answer === q.correct;
  }

  if (q.type === 'multiple') {
    const correct = Array.isArray(q.correct) ? [...q.correct].sort() : [q.correct];
    const given   = Array.isArray(answer)    ? [...answer].sort()    : [];
    return JSON.stringify(correct) === JSON.stringify(given);
  }

  return null;
}

export async function POST(req) {
  const { password, answers, name } = await req.json();

  if (!password || password !== process.env.QUIZ_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  const webhookUrl = process.env.QUIZ_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  let questions = [];
  try {
    questions = JSON.parse(process.env.QUIZ_QUESTIONS || '[]');
  } catch {
    return NextResponse.json({ error: 'Quiz configuration error.' }, { status: 500 });
  }

  let totalGraded = 0;
  let totalCorrect = 0;

  const fields = questions.map((q) => {
    const answer = answers[q.id];
    let displayAnswer = '*(No answer)*';
    if (Array.isArray(answer) && answer.length > 0) {
      displayAnswer = answer.join(', ');
    } else if (typeof answer === 'string' && answer.trim()) {
      displayAnswer = answer.trim();
    }

    const grade = gradeAnswer(q, answer);
    let prefix = '';
    if (grade === true)  { prefix = '✅ '; totalCorrect++; totalGraded++; }
    if (grade === false) { prefix = '❌ '; totalGraded++; }

    return {
      name:   `${prefix}${q.question}`,
      value:  displayAnswer,
      inline: false,
    };
  });

  const scoreNote = totalGraded > 0
    ? `Score: **${totalCorrect}/${totalGraded}** graded questions correct`
    : null;

  const payload = {
    embeds: [
      {
        title:  '📋 BOI Quiz Submission',
        color:  totalGraded > 0 && totalCorrect === totalGraded ? 0x22c55e : 0xc9a228,
        fields: [
          { name: 'Submitted by', value: name || 'Anonymous', inline: false },
          ...(scoreNote ? [{ name: 'Result', value: scoreNote, inline: false }] : []),
          ...fields,
        ],
        footer:    { text: 'Bureau of Operational Integrity — Quiz System' },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to send submission.' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}

  const { password, answers, name } = await req.json();

  if (!password || password !== process.env.QUIZ_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  const webhookUrl = process.env.QUIZ_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  let questions = [];
  try {
    questions = JSON.parse(process.env.QUIZ_QUESTIONS || '[]');
  } catch {
    return NextResponse.json({ error: 'Quiz configuration error.' }, { status: 500 });
  }