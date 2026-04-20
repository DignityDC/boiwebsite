import { NextResponse } from 'next/server';

export async function POST(req) {
  const { password } = await req.json();

  if (!password || password !== process.env.QUIZ_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  let questions = [];
  try {
    questions = JSON.parse(process.env.QUIZ_QUESTIONS || '[]');
  } catch {
    return NextResponse.json({ error: 'Quiz configuration error.' }, { status: 500 });
  }

  // Strip correct answers before sending to client
  const clientQuestions = questions.map(({ correct, ...q }) => q);

  return NextResponse.json({ questions: clientQuestions });
}
