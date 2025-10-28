import React from 'react';
import { Star, Flame, Award } from 'lucide-react';
import LevelAvatar from './LevelAvatar';

export default function ProgressPanel({ points, streak, stars, level }) {
  const starIcons = [0, 1, 2].map((i) => (
    <Star
      key={i}
      className={`w-5 h-5 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
    />
  ));

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white/80 backdrop-blur p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-slate-900">Your progress</div>
        <div className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
          <Award className="w-4 h-4" /> Level {level}
        </div>
      </div>

      <div className="mb-4">
        <LevelAvatar level={level} size="md" />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
          <div className="text-xs text-slate-500">Points</div>
          <div className="text-xl font-extrabold text-slate-900">{points}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
          <div className="text-xs text-slate-500">Streak</div>
          <div className="inline-flex items-center justify-center gap-1 text-xl font-extrabold text-slate-900">
            <Flame className="w-5 h-5 text-orange-600" /> {streak}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
          <div className="text-xs text-slate-500">Stars</div>
          <div className="inline-flex items-center justify-center gap-1">{starIcons}</div>
        </div>
      </div>
    </div>
  );
}
