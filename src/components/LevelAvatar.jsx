import React from 'react';
import { Crown, Shield, Star } from 'lucide-react';

/*
  LevelAvatar renders a distinct avatar per level.
  - Level 1: Explorer (Shield), warm orange gradient
  - Level 2: Pathfinder (Star), amber/yellow gradient
  - Level 3+: Champion (Crown), pink/magenta gradient
*/
export default function LevelAvatar({ level = 1, size = 'lg' }) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const styleByLevel = (() => {
    if (level === 1)
      return {
        bg: 'bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 border-orange-200',
        ring: 'ring-orange-100',
        icon: <Shield className="w-7 h-7 text-orange-700" />,
        label: 'Explorer',
      };
    if (level === 2)
      return {
        bg: 'bg-gradient-to-br from-amber-100 via-yellow-100 to-lime-100 border-amber-200',
        ring: 'ring-amber-100',
        icon: <Star className="w-7 h-7 text-amber-700" />,
        label: 'Pathfinder',
      };
    return {
      bg: 'bg-gradient-to-br from-pink-100 via-rose-100 to-fuchsia-100 border-pink-200',
      ring: 'ring-pink-100',
      icon: <Crown className="w-7 h-7 text-pink-700" />,
      label: 'Champion',
    };
  })();

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative ${sizes[size]} rounded-2xl border ${styleByLevel.bg} shadow-sm ring-4 ${styleByLevel.ring} flex items-center justify-center`}
        aria-hidden
      >
        {styleByLevel.icon}
      </div>
      <div className="leading-tight">
        <div className="text-xs text-slate-500">Level {level}</div>
        <div className="text-sm font-semibold text-slate-900">{styleByLevel.label}</div>
      </div>
    </div>
  );
}
