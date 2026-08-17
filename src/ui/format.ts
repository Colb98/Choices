import type { ChoicePreview, TrustTrend } from '../engine/types';

export const FONT =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif";

export function formatMoney(v: number): string {
  return `$${Math.round(v).toLocaleString('en-US')}`;
}

export function formatCompactMoney(v: number): string {
  if (v >= 10_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 10_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(v).toLocaleString('en-US')}`;
}

export function formatSignedMoney(v: number): string {
  if (v === 0) return '$0';
  return `${v > 0 ? '+' : '−'}${formatCompactMoney(Math.abs(v))}`;
}

export function trendArrows(n: number): string {
  if (n === 0) return '—';
  const ch = n > 0 ? '↑' : '↓';
  return ch.repeat(Math.min(3, Math.abs(n)));
}

export function trustTrendLabel(t: TrustTrend): string {
  switch (t) {
    case 'unknown': return '?';
    case 'up': return '↑';
    case 'down': return '↓';
    case 'strong_up': return '↑↑';
    case 'strong_down': return '↓↓';
    case 'up_uncertain': return '↑?';
    case 'down_uncertain': return '↓?';
    case 'strong_up_uncertain': return '↑↑?';
    case 'strong_down_uncertain': return '↓↓?';
  }
}

export interface PreviewLine {
  icon: string;
  arrows: string;
}

export function previewLines(p: ChoicePreview | undefined): PreviewLine[] {
  if (!p) return [];
  const lines: PreviewLine[] = [];
  if (p.money !== undefined && p.money !== 0) lines.push({ icon: '$', arrows: trendArrows(p.money) });
  if (p.standing !== undefined && p.standing !== 0) lines.push({ icon: '◆', arrows: trendArrows(p.standing) });
  if (p.power !== undefined && p.power !== 0) lines.push({ icon: '⬢', arrows: trendArrows(p.power) });
  if (p.publicTrust !== undefined && p.publicTrust !== 'unknown')
    lines.push({ icon: '♥', arrows: trustTrendLabel(p.publicTrust) });
  return lines;
}

export const COLORS = {
  bg: 0x0f0c10,
  bgPanel: 0x191419,
  card: 0x591923,
  cardBorder: 0x493640,
  text: '#fff5e8',
  textDim: '#b9aab2',
  accent: '#f0b84b',
  danger: '#d95362',
  standing: 0x87a6d8,
  power: 0xdda548,
  trust: 0xd66d84,
  barBg: 0x312730,
};
