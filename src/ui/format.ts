import type { ChoicePreview, TrustTrend } from '../engine/types';

export const FONT =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans SC', 'Helvetica Neue', Arial, sans-serif";

export function formatMoney(v: number): string {
  if (v >= 10_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(v).toLocaleString('en-US')}`;
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
  bg: 0x14141a,
  bgPanel: 0x1e1e26,
  card: 0x262630,
  cardBorder: 0x3a3a48,
  text: '#e8e6df',
  textDim: '#8a8896',
  accent: '#c9a227',
  danger: '#b23a3a',
  standing: 0x7a86b8,
  power: 0xb88a3c,
  trust: 0xb85c6e,
  barBg: 0x2a2a34,
};
