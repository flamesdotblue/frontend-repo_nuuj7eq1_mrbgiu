import React, { useState } from 'react';
import { Lightbulb, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function ChallengeCard({ challenge, attempted, passed }) {
  const [showHint, setShowHint] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-orange-700">
            <span className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200">Level {challenge.level}</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">Challenge {challenge.number}</span>
          </div>
          {passed && (
            <div className="inline-flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </div>
          )}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">{challenge.title}</h3>
        <p className="mt-2 text-slate-700 text-sm sm:text-base">{challenge.description}</p>

        <div className="mt-4">
          <h4 className="font-semibold text-slate-900 text-sm">Success criteria</h4>
          <ul className="mt-2 grid gap-2 list-disc pl-5 text-sm text-slate-700">
            {challenge.criteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.99] transition"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
          <button
            type="button"
            onClick={() => setShowExamples((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.99] transition"
          >
            <HelpCircle className="w-4 h-4 text-blue-500" />
            {showExamples ? 'Hide example' : 'Show example'}
          </button>
        </div>

        {showHint && (
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900 text-sm">
            {challenge.hint}
          </div>
        )}

        {showExamples && (
          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3 text-blue-900 text-sm">
            <div className="font-semibold mb-1">Example prompt</div>
            <pre className="whitespace-pre-wrap text-sm">{challenge.example}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
