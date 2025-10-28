import React, { useEffect, useMemo, useState } from 'react';
import HeroSection from './components/HeroSection';
import ChallengeCard from './components/ChallengeCard';
import PromptInput from './components/PromptInput';
import ProgressPanel from './components/ProgressPanel';
import { Sparkles } from 'lucide-react';

const STORAGE_KEY = 'promptquest_progress_v1';
const GEMINI_MODEL = 'gemini-2.5-flash-lite';

// Minimal MVP data: 5 challenges across 2 levels
const CHALLENGES = [
  {
    id: 'l1c1',
    level: 1,
    number: 1,
    title: 'Explain photosynthesis to a 10‑year‑old',
    description:
      'Write a clear prompt asking an AI to explain photosynthesis to a 10‑year‑old pupil. Mention the topic and the audience.',
    criteria: [
      'Mentions the topic (photosynthesis)',
      'Specifies the audience (10‑year‑old)',
      'Uses clear, simple language',
      'Requests an explanation',
    ],
    hint: 'State the topic, define the audience, and ask for a simple explanation. You can also set the tone (friendly, engaging).',
    example:
      'You are a science tutor. Explain photosynthesis to a 10‑year‑old in simple, friendly language. Use a short paragraph and an everyday example.',
    tags: ['clarity', 'specificity'],
  },
  {
    id: 'l1c2',
    level: 1,
    number: 2,
    title: 'Summarise a news article',
    description:
      'Ask the AI to summarise a news article in 3 bullet points for a general audience. Include the desired length and format.',
    criteria: [
      'Requests a summary',
      'Specifies 3 bullet points',
      'Mentions general audience or similar',
      'Asks for neutrality/clear tone',
    ],
    hint: 'Include the format (“3 bullet points”), audience, and tone (“neutral” or “clear”).',
    example:
      'Summarise the following news article in exactly 3 concise bullet points for a general audience. Use neutral language and avoid opinion. Article: [paste text] ',
    tags: ['format', 'clarity'],
  },
  {
    id: 'l2c1',
    level: 2,
    number: 1,
    title: 'Role and context: maths explainer',
    description:
      'Set a role and provide context. Ask the AI, acting as a maths teacher, to explain ratios to Year 8 pupils, including one worked example.',
    criteria: [
      'Defines the AI role (e.g., maths teacher)',
      'Adds context (Year 8 pupils)',
      'Requests 1 worked example',
      'Keeps language student‑friendly',
    ],
    hint: 'Start with “You are a…” and state the audience and what to include (e.g., “one worked example”).',
    example:
      'You are a secondary school maths teacher. Explain ratios to Year 8 pupils in friendly language and include one worked example with step‑by‑step reasoning.',
    tags: ['context', 'role'],
  },
  {
    id: 'l2c2',
    level: 2,
    number: 2,
    title: 'Formatting instructions',
    description:
      'Ask the AI to provide revision tips formatted as a checklist with tick boxes. Include 5 items and a one‑line explanation for each.',
    criteria: [
      'Requests checklist format',
      'Specifies 5 items',
      'Includes one‑line explanation per item',
      'Clear, actionable tone',
    ],
    hint: 'State the exact format (“checklist with tick boxes”), length, and what to include for each item.',
    example:
      'Create a revision checklist with tick boxes containing 5 items. For each item, add a one‑line explanation. Topic: GCSE biology cells.',
    tags: ['structure', 'format'],
  },
  {
    id: 'l2c3',
    level: 2,
    number: 3,
    title: 'Few‑shot guidance',
    description:
      'Give one short example of a good riddle followed by a request for a new riddle of the same style. Ask for a 2‑line answer.',
    criteria: [
      'Provides a single example (few‑shot)',
      'Requests similar style output',
      'Limits the answer length (2 lines)',
      'Clear instruction wording',
    ],
    hint: 'Show one example, then say “Write a new one like this…”. Set a length limit.',
    example:
      'Example: “I speak without a mouth and hear without ears. What am I? – An echo.” Now write a new original riddle in the same style. Limit your answer to 2 lines.',
    tags: ['few-shot', 'style'],
  },
];

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

function deriveStars(score) {
  if (score >= 85) return 3;
  if (score >= 70) return 2;
  if (score >= 55) return 1;
  return 0;
}

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState({}); // id -> {score, feedback}
  const [loading, setLoading] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);

  // hydrate from localStorage
  useEffect(() => {
    const data = loadProgress();
    if (data) {
      setCurrentIndex(data.currentIndex ?? 0);
      setPoints(data.points ?? 0);
      setStreak(data.streak ?? 0);
      setCompleted(data.completed ?? {});
    }
  }, []);

  // persist
  useEffect(() => {
    saveProgress({ currentIndex, points, streak, completed });
  }, [currentIndex, points, streak, completed]);

  const current = CHALLENGES[currentIndex];
  const starsForCurrent = useMemo(() => {
    const record = completed[current?.id];
    return record ? deriveStars(record.score) : 0;
  }, [completed, current]);

  const levelNumber = useMemo(() => current?.level ?? 1, [current]);

  async function evaluateWithGemini(userPrompt, challenge) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing API key');

    const instruction = `You are evaluating a student's prompt for a prompt‑engineering lesson. Score from 0 to 100 using these criteria with British English:
- Clarity: clear and unambiguous
- Specificity: includes necessary detail
- Context: relevant background and role if applicable
- Structure: well organised; format instructions if required
- Effectiveness: likely to produce the desired output

Return a strict JSON object with keys: score (0-100 integer), feedback (short paragraph), suggestions (array of concise improvement tips).`;

    const evalRequest = `Challenge: ${challenge.title}\nDescription: ${challenge.description}\nCriteria: ${challenge.criteria.join(
      '; '
    )}\n\nStudent prompt:\n${userPrompt}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: instruction }] },
            { role: 'user', parts: [{ text: evalRequest }] },
          ],
          generationConfig: { temperature: 0.2 },
        }),
      }
    );

    if (!res.ok) {
      throw new Error('Gemini request failed');
    }
    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.text || '';

    // Try to parse JSON from the model response
    const jsonText = (() => {
      try {
        // If the model wrapped JSON in markdown code fences
        const match = text.match(/\{[\s\S]*\}/);
        return match ? match[0] : text;
      } catch {
        return text;
      }
    })();

    const parsed = JSON.parse(jsonText);
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 0))),
      feedback: String(parsed.feedback ?? ''),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      source: 'gemini',
    };
  }

  // Heuristic fallback so the app works without an API key
  function evaluateLocally(userPrompt, challenge) {
    const text = userPrompt.toLowerCase();
    let score = 40;

    // simple keyword checks based on criteria
    const checks = [
      /explain|describe|define/.test(text),
      /10\s?-?year|year\s?8|pupil|student|general audience|audience/.test(text),
      /bullet|list|checklist|points|format/.test(text),
      /example|worked example|riddle/.test(text),
      /you are a|act as|role/.test(text),
    ];

    score += checks.filter(Boolean).length * 10;

    // penalise over length
    if (userPrompt.length > 600) score -= 10;

    // bonus if mentions key topic term when present
    if (challenge.title.toLowerCase().includes('photosynthesis') && text.includes('photosynthesis')) {
      score += 10;
    }

    score = Math.max(0, Math.min(100, score));

    const tips = [];
    if (!/you are a|act as|role/.test(text) && challenge.tags.includes('context')) {
      tips.push('Define a role for the AI to follow (e.g., “You are a maths teacher”).');
    }
    if (!/bullet|list|checklist/.test(text) && challenge.tags.includes('format')) {
      tips.push('Specify the exact format you want (e.g., “3 bullet points”).');
    }
    if (userPrompt.length > 600) tips.push('Keep it concise; trim any unnecessary detail.');
    if (!/explain|describe|define/.test(text)) tips.push('Use a clear verb such as “Explain” or “Describe”.');

    return {
      score,
      feedback:
        'Local evaluation used. Your prompt shows promise. Consider tightening clarity, adding concrete constraints, and specifying audience, role, and format where helpful.',
      suggestions: tips.slice(0, 4),
      source: 'local',
    };
  }

  async function handleSubmitPrompt(userPrompt) {
    setLoading(true);
    setLastFeedback(null);
    try {
      let result;
      try {
        result = await evaluateWithGemini(userPrompt, current);
      } catch {
        result = evaluateLocally(userPrompt, current);
      }

      setLastFeedback({ ...result, prompt: userPrompt });

      // update points/streak and mark completed if best score improves
      setCompleted((prev) => {
        const prevBest = prev[current.id]?.score ?? 0;
        const improved = result.score > prevBest;
        const next = { ...prev };
        if (improved) next[current.id] = { score: result.score, feedback: result.feedback };
        return next;
      });

      setPoints((p) => p + Math.round(result.score));
      if (result.score >= 60) {
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
    } finally {
      setLoading(false);
    }
  }

  function goNext() {
    setCurrentIndex((i) => Math.min(CHALLENGES.length - 1, i + 1));
  }
  function goPrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <HeroSection />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <ChallengeCard
              challenge={current}
              attempted={Boolean(completed[current?.id])}
              passed={(completed[current?.id]?.score ?? 0) >= 60}
            />

            <PromptInput onSubmit={handleSubmitPrompt} loading={loading} />

            {lastFeedback && (
              <div className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    Feedback
                  </div>
                  <div className="text-xs text-slate-500">Source: {lastFeedback.source}</div>
                </div>
                <div className="text-sm text-slate-800 whitespace-pre-wrap">{lastFeedback.feedback}</div>
                {Array.isArray(lastFeedback.suggestions) && lastFeedback.suggestions.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-semibold text-slate-900 mb-1">Suggestions</div>
                    <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                      {lastFeedback.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">Score: {lastFeedback.score}/100</span>
                  <span className="px-2 py-1 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">Stars: {deriveStars(lastFeedback.score)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={goPrev}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              <div className="text-sm text-slate-600">Challenge {current.number} of {CHALLENGES.length}</div>
              <button
                onClick={goNext}
                className="rounded-lg bg-orange-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-700 disabled:opacity-50"
                disabled={currentIndex === CHALLENGES.length - 1}
              >
                Next
              </button>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <ProgressPanel
              points={points}
              streak={streak}
              stars={starsForCurrent}
              level={levelNumber}
            />

            <div className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur p-4 sm:p-6 shadow-sm">
              <div className="font-bold text-slate-900 mb-2">Best practice</div>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                <li>Be clear about the task, audience, and desired format.</li>
                <li>Add relevant context and, if helpful, define a role.</li>
                <li>Constrain length, tone, and structure as needed.</li>
                <li>Iterate: improve based on feedback and examples.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
