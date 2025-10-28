import React, { useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';

export default function PromptInput({ onSubmit, loading }) {
  const [value, setValue] = useState('');
  const maxChars = 600;
  const remaining = maxChars - value.length;

  useEffect(() => {
    // Clear input when submission finishes
    if (!loading) return;
  }, [loading]);

  const counterColour = useMemo(() => {
    if (remaining < 0) return 'text-red-600';
    if (remaining < 50) return 'text-amber-600';
    return 'text-slate-500';
  }, [remaining]);

  return (
    <form
      className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur p-4 sm:p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim().length === 0 || remaining < 0) return;
        onSubmit(value.trim());
      }}
    >
      <label className="block text-sm font-semibold text-slate-900 mb-2">Write your prompt</label>
      <textarea
        className="w-full h-36 sm:h-40 resize-none rounded-lg border border-slate-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none p-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 bg-white/90"
        placeholder="Craft a clear, specific prompt…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={maxChars + 200} // allow some buffer but penalise if exceeded
      />
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs sm:text-sm ${counterColour}`}>{remaining} characters left</span>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Evaluating…' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
