'use client';

import React from 'react';

interface UserAvatarProps {
  name?: string | null;
  username?: string | null;
  size?: number;
  className?: string;
  showBorder?: boolean;
}

const GRADIENT_PALETTES = [
  ['#7c3aed', '#06b6d4'], // violet to cyan
  ['#ec4899', '#8b5cf6'], // pink to purple
  ['#3b82f6', '#10b981'], // blue to emerald
  ['#f59e0b', '#ef4444'], // amber to red
  ['#8b5cf6', '#06b6d4'], // purple to cyan
  ['#6366f1', '#d946ef'], // indigo to fuchsia
  ['#14b8a6', '#3b82f6'], // teal to blue
];

export function getInitials(name?: string | null, username?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/[\s-_]+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    if (parts[0]) {
      return parts[0].slice(0, 2).toUpperCase();
    }
  }
  if (username && username.trim()) {
    const clean = username.replace(/[^a-zA-Z0-9]/g, ' ').trim().split(/\s+/);
    if (clean.length >= 2 && clean[0] && clean[1]) {
      return (clean[0][0] + clean[1][0]).toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  }
  return 'HF';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  username,
  size = 32,
  className = '',
  showBorder = true,
}) => {
  const initials = getInitials(name, username);
  const seed = (name || username || 'HF').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = GRADIENT_PALETTES[seed % GRADIENT_PALETTES.length];

  const fontSize = Math.max(10, Math.round(size * 0.38));
  const borderRadius = Math.max(6, Math.round(size * 0.28));

  return (
    <div
      className={`relative select-none flex items-center justify-center shrink-0 font-black text-white tracking-wider ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: `${borderRadius}px`,
        background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
        fontSize: `${fontSize}px`,
        boxShadow: showBorder
          ? `0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 0 rgba(255,255,255,0.2)`
          : undefined,
      }}
    >
      <span className="leading-none drop-shadow-sm">{initials}</span>
    </div>
  );
};
