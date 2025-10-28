import React from 'react';
import Spline from '@splinetool/react-spline';
import { Rocket } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative w-full h-[420px] sm:h-[520px] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 border border-orange-200 shadow-inner">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/95Gu7tsx2K-0F3oi/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col items-start justify-center p-6 sm:p-10 gap-3 sm:gap-4 bg-gradient-to-t from-white/70 via-white/30 to-transparent pointer-events-none">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs sm:text-sm font-medium text-orange-700 shadow">
          <Rocket className="w-4 h-4" />
          Learn prompt engineering the playful way
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Prompt Quest
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-slate-700 font-medium">
          Tackle bite‑sized challenges, craft better AI prompts, and level up with instant feedback.
        </p>
      </div>
    </section>
  );
}
