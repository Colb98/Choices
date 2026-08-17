import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../ui/dimensions';
import { content, engine, saves, session } from '../services';
import { getLanguage, hasKey, t } from '../engine/i18n';
import type { LockState } from '../engine/engine';
import type { CardDefinition, ChoicePreview, GameState, TrustTrend } from '../engine/types';
import { COLORS, FONT, formatMoney } from '../ui/format';

// Layout (Lapse-like): HUD row on top, one panel containing the narrative
// (scrollable when long) directly above a large draggable artwork card.
const ICON_Y = 84;
const ICON_XS = { standing: 175, power: 270, trust: 365 } as const;
const ICON_SIZE = 46;
const PANEL = { x: 30, y: 132, w: GAME_WIDTH - 60, h: 772 };
const SPEAKER_Y = 152;
// Narrative viewport: masked, drag/wheel-scrollable when the text overflows.
const NARR = { x: 44, y: 186, w: GAME_WIDTH - 88, h: 214 };
const NARR_LINE_H = 28;
const CARD_W = 440;
const CARD_H = 470;
const CARD_X = GAME_WIDTH / 2;
const CARD_Y = 651;
const COMMIT_DIST = 120;
const ARROW_DIST = 80;
const MAX_ANGLE = 14;
/** Choices are nearly invisible until you drag toward them; opaque at commit threshold. */
const CHOICE_BASE_ALPHA = 0.02;
const ARROW_UP = '▲';
const ARROW_DOWN = '▼';

type IconKey = keyof typeof ICON_XS;
const ICON_GLYPHS: Record<IconKey, string> = { standing: '◆', power: '⬢', trust: '♥' };
const ICON_COLORS: Record<IconKey, string> = { standing: '#7a86b8', power: '#b88a3c', trust: '#b85c6e' };

interface StatIcon {
  fill: Phaser.GameObjects.Text;
  maskG: Phaser.GameObjects.Graphics;
  shown: number; // 0..100, currently displayed fill
  up: Phaser.GameObjects.Text;
  down: Phaser.GameObjects.Text;
}

export class GameScene extends Phaser.Scene {
  private state!: GameState;

  // HUD
  private hud!: Phaser.GameObjects.Container;
  private moneyText!: Phaser.GameObjects.Text;
  private moneyUp!: Phaser.GameObjects.Text;
  private moneyDown!: Phaser.GameObjects.Text;
  private icons: Partial<Record<IconKey, StatIcon>> = {};

  // Narrative panel (static; body scrolls when long)
  private speakerText!: Phaser.GameObjects.Text;
  private narrContent!: Phaser.GameObjects.Container;
  private narrScroll = 0;
  private narrMaxScroll = 0;
  private measureNormal!: Phaser.GameObjects.Text;
  private measureBold!: Phaser.GameObjects.Text;
  private highlightTerms: string[] = [];

  // Card (draggable, artwork only)
  private cardC!: Phaser.GameObjects.Container;
  private artImage!: Phaser.GameObjects.Image;
  private lockIcon!: Phaser.GameObjects.Text;

  // Choices
  private leftLabel!: Phaser.GameObjects.Text;
  private rightLabel!: Phaser.GameObjects.Text;

  private dragging = false;
  private dragStart = { x: 0, y: 0 };
  private dragOffset = { x: 0, y: 0 };
  private busy = false;
  private debugEl?: HTMLElement;
  private tooltip!: Phaser.GameObjects.Container;
  private tooltipText!: Phaser.GameObjects.Text;

  constructor() {
    super('Game');
  }

  create() {
    if (!session.state) {
      this.scene.start('MainMenu');
      return;
    }
    this.state = session.state;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.buildHud();
    this.buildPanel();
    this.buildCard();
    this.setupInput();
    this.rebuildHighlightTerms();
    this.showCard();

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.debugEl?.remove();
      this.debugEl = undefined;
    });
  }

  // ------------------------------------------------------------------- HUD

  private buildHud() {
    this.hud = this.add.container(0, 0);

    this.moneyText = this.add.text(30, ICON_Y, '', {
      fontFamily: FONT, fontSize: '20px', color: COLORS.text, fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.moneyUp = this.makeArrow(0, ICON_Y - 26);
    this.moneyDown = this.makeArrow(0, ICON_Y + 26);
    this.hud.add([this.moneyText, this.moneyUp, this.moneyDown]);

    const tooltipKeys: Record<IconKey, string> = {
      standing: 'ui.hud.standing',
      power: 'ui.hud.power',
      trust: 'ui.hud.trust',
    };

    for (const key of Object.keys(ICON_XS) as IconKey[]) {
      const x = ICON_XS[key];
      // The icon IS the progress bar: a dim base glyph, and a colored copy
      // clipped from the bottom by a geometry (stencil) mask.
      const base = this.add.text(x, ICON_Y, ICON_GLYPHS[key], {
        fontFamily: FONT, fontSize: `${ICON_SIZE}px`, color: '#33333f',
      }).setOrigin(0.5);
      const fill = this.add.text(x, ICON_Y, ICON_GLYPHS[key], {
        fontFamily: FONT, fontSize: `${ICON_SIZE}px`, color: ICON_COLORS[key],
      }).setOrigin(0.5);
      const maskG = this.make.graphics({}, false);
      fill.setMask(maskG.createGeometryMask());
      const up = this.makeArrow(x, ICON_Y - ICON_SIZE / 2 - 16);
      const down = this.makeArrow(x, ICON_Y + ICON_SIZE / 2 + 16);
      this.hud.add([base, fill, up, down]);
      this.icons[key] = { fill, maskG, shown: -1, up, down };

      // Tooltip: hover on desktop, press-and-hold on touch.
      base.setInteractive({ useHandCursor: true });
      base.on('pointerover', () => this.showTooltip(t(tooltipKeys[key]), x));
      base.on('pointerdown', () => this.showTooltip(t(tooltipKeys[key]), x));
      base.on('pointerout', () => this.hideTooltip());
      base.on('pointerup', () => this.hideTooltip());
    }

    this.tooltipText = this.add.text(0, 0, '', {
      fontFamily: FONT, fontSize: '14px', color: COLORS.text,
      backgroundColor: '#2a2a36', padding: { x: 10, y: 6 },
    }).setOrigin(0.5, 0);
    this.tooltip = this.add.container(0, ICON_Y + ICON_SIZE / 2 + 30, [this.tooltipText])
      .setDepth(40).setAlpha(0);

    this.updateHud(false);
  }

  private showTooltip(label: string, x: number) {
    this.tooltipText.setText(label);
    this.tooltip.x = Phaser.Math.Clamp(x, 60, GAME_WIDTH - 60);
    this.tooltip.setAlpha(1);
  }

  private hideTooltip() {
    this.tooltip.setAlpha(0);
  }

  private makeArrow(x: number, y: number) {
    return this.add.text(x, y, ARROW_UP, {
      fontFamily: FONT, fontSize: '20px', color: COLORS.text,
    }).setOrigin(0.5).setAlpha(0);
  }

  private setIconFill(key: IconKey, value: number, animate: boolean) {
    const icon = this.icons[key]!;
    const target = Phaser.Math.Clamp(value, 0, 100);
    const draw = (v: number) => {
      const h = (v / 100) * ICON_SIZE;
      icon.maskG.clear();
      icon.maskG.fillStyle(0xffffff);
      icon.maskG.fillRect(ICON_XS[key] - ICON_SIZE / 2 - 4, ICON_Y + ICON_SIZE / 2 - h, ICON_SIZE + 8, h);
    };
    if (!animate || icon.shown < 0) {
      icon.shown = target;
      draw(target);
      return;
    }
    const proxy = { v: icon.shown };
    icon.shown = target;
    this.tweens.add({
      targets: proxy, v: target, duration: 350, ease: 'Cubic.out',
      onUpdate: () => draw(proxy.v),
    });
  }

  private updateHud(animate = true) {
    this.moneyText.setText(formatMoney(this.state.stats.money));
    this.setIconFill('standing', this.state.stats.standing, animate);
    this.setIconFill('power', this.state.stats.power, animate);
    // The player sees PERCEIVED trust; reality may differ.
    this.setIconFill('trust', this.state.stats.publicTrustPerceived, animate);
  }

  // -------------------------------------------------- HUD preview arrows

  /** Arrow size encodes magnitude — deliberately not countable like arrow-stacks. */
  private arrowSize(mag: number): number {
    return mag >= 3 ? 34 : mag >= 2 ? 25 : 17;
  }

  private trustTrendParts(tr: TrustTrend): { dir: 1 | -1 | 0; mag: number; uncertain: boolean } {
    switch (tr) {
      case 'up': return { dir: 1, mag: 1, uncertain: false };
      case 'strong_up': return { dir: 1, mag: 2, uncertain: false };
      case 'up_uncertain': return { dir: 1, mag: 1, uncertain: true };
      case 'strong_up_uncertain': return { dir: 1, mag: 2, uncertain: true };
      case 'down': return { dir: -1, mag: 1, uncertain: false };
      case 'strong_down': return { dir: -1, mag: 2, uncertain: false };
      case 'down_uncertain': return { dir: -1, mag: 1, uncertain: true };
      case 'strong_down_uncertain': return { dir: -1, mag: 2, uncertain: true };
      default: return { dir: 0, mag: 0, uncertain: true };
    }
  }

  private showPreviewArrows(side: 'left' | 'right', alpha: number) {
    const card = this.currentCard();
    const choice = engine.resolveChoice(this.state, card, side);
    const lock = engine.getLockState(this.state, card, side);
    this.hidePreviewArrows();

    const trends: Partial<Record<'money' | IconKey, { dir: 1 | -1; mag: number; uncertain?: boolean }>> = {};
    const p: ChoicePreview = choice.preview ?? {};
    const put = (k: 'money' | IconKey, v: number | undefined) => {
      if (v) trends[k] = { dir: v > 0 ? 1 : -1, mag: Math.abs(v) };
    };
    put('money', p.money);
    put('standing', p.standing);
    put('power', p.power);
    if (p.publicTrust) {
      const tp = this.trustTrendParts(p.publicTrust);
      if (tp.dir !== 0) trends.trust = { dir: tp.dir, mag: tp.mag, uncertain: tp.uncertain };
    }
    // A cost-lock's price folds into the same arrows.
    if (lock.kind === 'cost') {
      for (const eff of lock.unlockEffects) {
        if (eff.type === 'stat' && eff.add !== undefined && eff.add !== 0) {
          const mag = Math.abs(eff.add) >= 9 ? 3 : Math.abs(eff.add) >= 4 ? 2 : 1;
          const key: 'money' | IconKey | undefined =
            eff.stat === 'money' ? 'money'
            : eff.stat === 'standing' ? 'standing'
            : eff.stat === 'power' ? 'power'
            : eff.stat === 'publicTrustPerceived' ? 'trust'
            : undefined;
          if (!key) continue;
          const existing = trends[key];
          const dir = eff.add > 0 ? 1 : -1;
          if (!existing || existing.dir === dir) {
            trends[key] = { dir, mag: Math.max(existing?.mag ?? 0, mag) };
          } else {
            trends[key] = { dir, mag };
          }
        }
      }
    }

    for (const [key, tr] of Object.entries(trends)) {
      const target =
        key === 'money'
          ? tr.dir > 0 ? this.moneyUp : this.moneyDown
          : tr.dir > 0 ? this.icons[key as IconKey]!.up : this.icons[key as IconKey]!.down;
      if (key === 'money') {
        const cx = this.moneyText.x + this.moneyText.width / 2;
        this.moneyUp.setX(cx);
        this.moneyDown.setX(cx);
      }
      target.setFontSize(this.arrowSize(tr.mag));
      target.setColor(tr.dir > 0 ? '#9ac48a' : '#d08a8a');
      target.setText((tr.dir > 0 ? ARROW_UP : ARROW_DOWN) + (tr.uncertain ? '?' : ''));
      target.setAlpha(alpha * (tr.uncertain ? 0.6 : 1));
    }
  }

  private hidePreviewArrows() {
    this.moneyUp.setAlpha(0);
    this.moneyDown.setAlpha(0);
    for (const icon of Object.values(this.icons)) {
      icon!.up.setAlpha(0);
      icon!.down.setAlpha(0);
    }
  }

  // ------------------------------------------------------- narrative panel

  private buildPanel() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.bgPanel, 1);
    g.fillRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 14);
    g.lineStyle(1, COLORS.cardBorder, 1);
    g.strokeRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 14);

    this.speakerText = this.add.text(GAME_WIDTH / 2, SPEAKER_Y, '', {
      fontFamily: FONT, fontSize: '17px', color: COLORS.accent, fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Scrollable narrative body: content container clipped to the viewport.
    this.narrContent = this.add.container(0, NARR.y);
    const maskG = this.make.graphics({}, false);
    maskG.fillStyle(0xffffff);
    maskG.fillRect(NARR.x, NARR.y, NARR.w, NARR.h);
    this.narrContent.setMask(maskG.createGeometryMask());

    // Hidden scratch texts used to measure token widths during layout.
    this.measureNormal = this.add.text(0, 0, '', {
      fontFamily: FONT, fontSize: '19px',
    }).setVisible(false);
    this.measureBold = this.add.text(0, 0, '', {
      fontFamily: FONT, fontSize: '19px', fontStyle: 'bold',
    }).setVisible(false);

    // Drag to scroll (only the narrative area; the card handles its own drag).
    const zone = this.add.zone(NARR.x, NARR.y, NARR.w, NARR.h).setOrigin(0, 0);
    zone.setInteractive({ draggable: true });
    let scrollStart = 0;
    zone.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      scrollStart = this.narrScroll + pointer.y;
    });
    zone.on('drag', (pointer: Phaser.Input.Pointer) => {
      this.setNarrScroll(scrollStart - pointer.y);
    });
    this.input.on(
      'wheel',
      (pointer: Phaser.Input.Pointer, _objs: unknown, _dx: number, dy: number) => {
        if (pointer.y > NARR.y - 30 && pointer.y < NARR.y + NARR.h + 30) {
          this.setNarrScroll(this.narrScroll + dy * 0.5);
        }
      },
    );
  }

  private setNarrScroll(v: number) {
    this.narrScroll = Phaser.Math.Clamp(v, 0, this.narrMaxScroll);
    this.narrContent.y = NARR.y - this.narrScroll;
  }

  // ------------------------------------------------------------- rich text

  /**
   * Wraps character names (and any pre-authored **markers**) in the text,
   * then lays it out manually: bold+accent runs, centered lines, CJK-aware
   * wrapping. Returns total content height.
   */
  private renderRichBody(raw: string) {
    this.narrContent.removeAll(true);

    let text = raw;
    // Boundary guard is Latin-only: it stops "Minister" matching inside
    // "Ministerial", while CJK names still match mid-sentence (no spaces there).
    const latin = 'A-Za-z\\u00C0-\\u024F\\u1E00-\\u1EFF';
    for (const term of this.highlightTerms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(
        new RegExp(`(^|[^*${latin}])(${escaped})(?![*${latin}])`, 'giu'),
        (_m, pre, hit) => `${pre}**${hit}**`,
      );
    }

    interface Token { text: string; bold: boolean; space: boolean }
    const tokens: Token[] = [];
    for (const para of text.split('\n')) {
      for (const runMatch of para.split(/(\*\*[^*]+\*\*)/g)) {
        if (!runMatch) continue;
        const bold = runMatch.startsWith('**') && runMatch.endsWith('**');
        const run = bold ? runMatch.slice(2, -2) : runMatch;
        // CJK characters wrap individually; latin words wrap as units.
        for (const m of run.matchAll(/([　-〿㐀-鿿豈-﫿＀-￯])|(\s+)|([^\s　-〿㐀-鿿豈-﫿＀-￯]+)/gu)) {
          tokens.push({ text: m[0], bold, space: !!m[2] });
        }
      }
      tokens.push({ text: '\n', bold: false, space: false });
    }
    tokens.pop();

    const widthOf = (tk: Token) => {
      const scratch = tk.bold ? this.measureBold : this.measureNormal;
      scratch.setText(tk.text === '\n' ? '' : tk.text.replace(/ /g, ' '));
      return scratch.width;
    };

    const lines: Token[][] = [[]];
    let lineW = 0;
    for (const tk of tokens) {
      if (tk.text === '\n') {
        lines.push([]);
        lineW = 0;
        continue;
      }
      const w = widthOf(tk);
      if (lineW + w > NARR.w && lines[lines.length - 1].length > 0 && !tk.space) {
        lines.push([]);
        lineW = 0;
      }
      if (tk.space && lineW === 0) continue;
      lines[lines.length - 1].push(tk);
      lineW += w;
    }

    let y = 0;
    for (const line of lines) {
      while (line.length && line[line.length - 1].space) line.pop();
      if (line.length === 0) {
        y += NARR_LINE_H * 0.6;
        continue;
      }
      // Merge consecutive same-style tokens into segments, then center the line.
      const segments: { text: string; bold: boolean }[] = [];
      for (const tk of line) {
        const last = segments[segments.length - 1];
        if (last && last.bold === tk.bold) last.text += tk.text;
        else segments.push({ text: tk.text, bold: tk.bold });
      }
      const segWidths = segments.map((s) => {
        const scratch = s.bold ? this.measureBold : this.measureNormal;
        scratch.setText(s.text.replace(/ /g, ' '));
        return scratch.width;
      });
      const total = segWidths.reduce((a, b) => a + b, 0);
      let x = GAME_WIDTH / 2 - total / 2;
      segments.forEach((seg, i) => {
        const txt = this.add.text(x, y, seg.text, {
          fontFamily: FONT, fontSize: '19px',
          color: seg.bold ? COLORS.accent : COLORS.text,
          fontStyle: seg.bold ? 'bold' : 'normal',
        }).setOrigin(0, 0);
        this.narrContent.add(txt);
        x += segWidths[i];
      });
      y += NARR_LINE_H;
    }

    this.narrMaxScroll = Math.max(0, y - NARR.h);
    this.setNarrScroll(0);
  }

  private rebuildHighlightTerms() {
    const terms = new Set<string>();
    for (const ch of Object.values(content.characters)) {
      const name = t(ch.nameKey);
      if (!name || name === ch.nameKey) continue;
      terms.add(name);
      // EN-style names carry an article; the bare noun is what appears in prose.
      const bare = name.replace(/^(The|El|La|Los|Las)\s+/i, '');
      if (bare.length >= 4) terms.add(bare);
    }
    // Longest first so "Press Officer" wins over "Officer".
    this.highlightTerms = [...terms].sort((a, b) => b.length - a.length);
  }

  // ------------------------------------------------------------------ card

  private buildCard() {
    this.cardC = this.add.container(CARD_X, CARD_Y);

    const panel = this.add.rectangle(0, 0, CARD_W, CARD_H, COLORS.card).setStrokeStyle(2, COLORS.cardBorder);
    panel.setInteractive({ draggable: true, useHandCursor: true });
    const art = this.add.rectangle(0, 0, CARD_W - 22, CARD_H - 22, COLORS.bgPanel);
    this.artImage = this.add.image(0, 0, '__DEFAULT').setVisible(false);
    this.lockIcon = this.add.text(0, 0, '🔒', { fontSize: '46px' }).setOrigin(0.5).setAlpha(0);

    // Choice labels live on the card's top corners and move/rotate with it —
    // on the OPPOSITE corner of their drag direction, so the corner that stays
    // inside the viewport during the drag is the one you're reading.
    this.leftLabel = this.add.text(CARD_W / 2 - 16, -CARD_H / 2 + 14, '', {
      fontFamily: FONT, fontSize: '17px', color: COLORS.text,
      wordWrap: { width: 168 }, align: 'right',
    }).setOrigin(1, 0).setAlpha(CHOICE_BASE_ALPHA);
    this.rightLabel = this.add.text(-CARD_W / 2 + 16, -CARD_H / 2 + 14, '', {
      fontFamily: FONT, fontSize: '17px', color: COLORS.text,
      wordWrap: { width: 168 }, align: 'left',
    }).setOrigin(0, 0).setAlpha(CHOICE_BASE_ALPHA);

    this.cardC.add([panel, art, this.artImage, this.leftLabel, this.rightLabel, this.lockIcon]);

    panel.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      if (this.busy) return;
      this.dragging = true;
      this.dragStart = { x: pointer.x, y: pointer.y };
    });
    panel.on('drag', (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging || this.busy) return;
      this.onDragMove(pointer.x - this.dragStart.x, pointer.y - this.dragStart.y);
    });
    panel.on('dragend', () => {
      if (!this.dragging || this.busy) return;
      this.dragging = false;
      this.onDragEnd();
    });
  }

  private setupInput() {
    this.input.keyboard?.on('keydown-LEFT', () => this.tryKeyboard('left'));
    this.input.keyboard?.on('keydown-A', () => this.tryKeyboard('left'));
    this.input.keyboard?.on('keydown-RIGHT', () => this.tryKeyboard('right'));
    this.input.keyboard?.on('keydown-D', () => this.tryKeyboard('right'));
    this.input.keyboard?.on('keydown-F1', () => this.toggleDebug());
  }

  private currentCard(): CardDefinition {
    return engine.currentCard(this.state);
  }

  private showCard(fromDirection: 0 | 1 | -1 = 0) {
    const card = this.currentCard();
    const speaker = card.speaker ? t(content.characters[card.speaker]?.nameKey ?? `char.${card.speaker}.name`) : '';
    this.speakerText.setText(speaker);
    this.renderRichBody(t(card.text));
    this.updateCardArt(card);

    const isIncident = card.type === 'incident';
    this.hud.setAlpha(isIncident ? 0 : 1);

    const left = engine.resolveChoice(this.state, card, 'left');
    const right = engine.resolveChoice(this.state, card, 'right');
    this.leftLabel.setText(this.choiceLabel(t(left.textKey), engine.getLockState(this.state, card, 'left')));
    this.rightLabel.setText(this.choiceLabel(t(right.textKey), engine.getLockState(this.state, card, 'right')));
    this.leftLabel.setAlpha(CHOICE_BASE_ALPHA);
    this.rightLabel.setAlpha(CHOICE_BASE_ALPHA);

    this.dragOffset = { x: fromDirection * -GAME_WIDTH, y: 0 };
    this.applyCardTransform();
    this.cardC.alpha = 1;
    this.lockIcon.setAlpha(0);
    this.busy = true;
    const proxy = { v: this.dragOffset.x };
    this.tweens.add({
      targets: proxy, v: 0,
      duration: fromDirection === 0 || this.reducedMotion() ? 0 : 320,
      ease: 'Cubic.out',
      onUpdate: () => {
        this.dragOffset.x = proxy.v;
        this.applyCardTransform();
      },
      onComplete: () => {
        this.dragOffset = { x: 0, y: 0 };
        this.applyCardTransform();
        this.busy = false;
      },
    });
    this.refreshDebug();
  }

  private choiceLabel(text: string, lock: LockState): string {
    if (lock.kind === 'hard') return `${text} 🔒`;
    return text;
  }

  /**
   * Card art rule: a key scene when this moment has one, otherwise the
   * portrait of the man the player is talking to, otherwise a plain card.
   */
  private updateCardArt(card: CardDefinition) {
    const sceneKey = card.illustration ? `scene:${card.illustration.scene}` : undefined;
    const portraitKey = card.speaker ? `portrait:${card.speaker}` : undefined;
    const key =
      sceneKey && this.textures.exists(sceneKey) ? sceneKey
      : portraitKey && this.textures.exists(portraitKey) ? portraitKey
      : undefined;

    if (!key) {
      this.artImage.setVisible(false);
      return;
    }
    const tw = CARD_W - 22;
    const th = CARD_H - 22;
    this.artImage.setTexture(key);
    const src = this.artImage.frame;
    // Cover-fit: scale to fill the card, crop the overflow symmetrically.
    const scale = Math.max(tw / src.width, th / src.height);
    const cw = tw / scale;
    const ch = th / scale;
    this.artImage
      .setCrop((src.width - cw) / 2, (src.height - ch) / 2, cw, ch)
      .setScale(scale)
      .setVisible(true);
  }

  // ------------------------------------------------------------------ drag

  /** Rotation follows the horizontal distance from the center vertical axis. */
  private applyCardTransform() {
    this.cardC.x = CARD_X + this.dragOffset.x;
    this.cardC.y = CARD_Y + this.dragOffset.y;
    this.cardC.angle = Phaser.Math.Clamp((this.dragOffset.x / (GAME_WIDTH / 2)) * MAX_ANGLE, -MAX_ANGLE, MAX_ANGLE);
  }

  private onDragMove(dx: number, dy: number) {
    const side: 'left' | 'right' = dx < 0 ? 'left' : 'right';
    const lock = engine.getLockState(this.state, this.currentCard(), side);

    let shownX = dx;
    if (lock.kind === 'hard') {
      // Resistance: horizontal movement past a short distance is heavily damped.
      const abs = Math.abs(dx);
      const damped = abs <= 50 ? abs : 50 + (abs - 50) * 0.22;
      shownX = Math.sign(dx) * damped;
      this.lockIcon.setAlpha(Math.min(1, Math.abs(shownX) / 60));
    } else {
      this.lockIcon.setAlpha(0);
    }
    // Free drag: the card follows the pointer in both axes.
    this.dragOffset = { x: shownX, y: Phaser.Math.Clamp(dy, -160, 160) };
    this.applyCardTransform();

    const abs = Math.abs(shownX);
    // Nearly invisible at rest, fully opaque exactly at the commit threshold —
    // reading a choice requires committing to the drag.
    const labelA = CHOICE_BASE_ALPHA + Phaser.Math.Clamp(abs / COMMIT_DIST, 0, 1) * (1 - CHOICE_BASE_ALPHA);
    const arrowA = Phaser.Math.Clamp((abs - ARROW_DIST) / 50, 0, 1);
    if (side === 'left') {
      this.leftLabel.setAlpha(labelA);
      this.rightLabel.setAlpha(CHOICE_BASE_ALPHA);
    } else {
      this.rightLabel.setAlpha(labelA);
      this.leftLabel.setAlpha(CHOICE_BASE_ALPHA);
    }
    if (arrowA > 0 && lock.kind !== 'hard') this.showPreviewArrows(side, arrowA);
    else this.hidePreviewArrows();
  }

  private onDragEnd() {
    const dx = this.dragOffset.x;
    const side: 'left' | 'right' = dx < 0 ? 'left' : 'right';
    const lock = engine.getLockState(this.state, this.currentCard(), side);

    if (Math.abs(dx) >= COMMIT_DIST) {
      if (lock.kind === 'hard') {
        this.playFlashbacks(lock);
        return;
      }
      this.commit(side, lock.kind === 'cost');
      return;
    }
    this.returnCard();
  }

  private tryKeyboard(side: 'left' | 'right') {
    if (this.busy) return;
    const lock = engine.getLockState(this.state, this.currentCard(), side);
    if (lock.kind === 'hard') {
      this.playFlashbacks(lock);
      return;
    }
    this.busy = true;
    const dir = side === 'left' ? -1 : 1;
    this.busy = false;
    this.onDragMove(dir * (ARROW_DIST + 40), -20);
    this.busy = true;
    this.time.delayedCall(this.reducedMotion() ? 0 : 420, () => {
      this.busy = false;
      this.commit(side, lock.kind === 'cost');
    });
  }

  private returnCard() {
    this.busy = true;
    const proxy = { x: this.dragOffset.x, y: this.dragOffset.y };
    this.tweens.add({
      targets: proxy, x: 0, y: 0,
      duration: this.reducedMotion() ? 0 : 260,
      ease: 'Back.out',
      onUpdate: () => {
        this.dragOffset = { x: proxy.x, y: proxy.y };
        this.applyCardTransform();
      },
      onComplete: () => {
        this.busy = false;
        this.lockIcon.setAlpha(0);
        this.hidePreviewArrows();
        this.leftLabel.setAlpha(CHOICE_BASE_ALPHA);
        this.rightLabel.setAlpha(CHOICE_BASE_ALPHA);
      },
    });
  }

  // ----------------------------------------------------------------- locks

  private playFlashbacks(lock: Extract<LockState, { kind: 'hard' }>) {
    this.busy = true;
    const card = this.currentCard();
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
      .setDepth(50).setInteractive();
    const flashRect = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0).setDepth(51);
    const memoryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '', {
      fontFamily: FONT, fontSize: '20px', color: COLORS.text,
      wordWrap: { width: 420 }, align: 'center', lineSpacing: 6,
    }).setOrigin(0.5).setDepth(52).setAlpha(0);
    const chosenText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, '', {
      fontFamily: FONT, fontSize: '18px', color: COLORS.accent, align: 'center',
      wordWrap: { width: 420 },
    }).setOrigin(0.5).setDepth(52).setAlpha(0);

    this.tweens.add({ targets: overlay, fillAlpha: 0.88, duration: this.reducedMotion() ? 0 : 200 });

    const items = lock.flashbacks;
    const perMemory = 1050;
    let delay = 250;

    const showMemory = (idx: number) => {
      const item = items[idx];
      this.time.delayedCall(delay, () => {
        if (!this.reducedMotion()) {
          flashRect.fillAlpha = 0.9;
          this.tweens.add({ targets: flashRect, fillAlpha: 0, duration: 180 });
        }
        const body = t(item.cardTextKey);
        memoryText.setText(body.length > 160 ? body.slice(0, 157) + '…' : body);
        chosenText.setText(`${t('ui.flashback.you_chose')}\n${item.choiceTextKey ? t(item.choiceTextKey) : ''}`);
        memoryText.setAlpha(1);
        chosenText.setAlpha(1);
      });
      delay += perMemory;
    };

    if (items.length === 0) {
      delay += 200;
    } else {
      items.forEach((_, i) => showMemory(i));
    }

    this.time.delayedCall(delay, () => {
      memoryText.setAlpha(0);
      chosenText.setAlpha(0);
      const captionKey = hasKey(`card.${card.id}.lock_caption`) ? `card.${card.id}.lock_caption` : 'ui.lock.caption';
      memoryText.setText(t(captionKey));
      memoryText.setAlpha(1);
    });
    this.time.delayedCall(delay + 1400, () => {
      [overlay, flashRect, memoryText, chosenText].forEach((o) => o.destroy());
      this.busy = false;
      this.returnCard();
    });
  }

  // ---------------------------------------------------------------- commit

  private commit(side: 'left' | 'right', payCost: boolean) {
    this.busy = true;
    const dir = side === 'left' ? -1 : 1;
    const actBefore = this.state.run.currentAct;

    let result;
    try {
      result = engine.commitChoice(this.state, side, { payCost });
    } catch (err) {
      console.error(err);
      this.busy = false;
      this.returnCard();
      return;
    }

    const proxy = { x: this.dragOffset.x, y: this.dragOffset.y, a: 1 };
    this.tweens.add({
      targets: proxy,
      x: dir * GAME_WIDTH, y: this.dragOffset.y + 40, a: 0.35,
      duration: this.reducedMotion() ? 0 : 280,
      ease: 'Cubic.in',
      onUpdate: () => {
        this.dragOffset = { x: proxy.x, y: proxy.y };
        this.applyCardTransform();
        this.cardC.alpha = proxy.a;
      },
      onComplete: () => {
        this.hidePreviewArrows();
        this.leftLabel.setAlpha(CHOICE_BASE_ALPHA);
        this.rightLabel.setAlpha(CHOICE_BASE_ALPHA);
        this.updateHud();

        if (result.endingId) {
          const meta = saves.recordCompletion(result.endingId);
          session.meta = meta;
          saves.clearRun();
          this.scene.start('Ending', { endingId: result.endingId });
          return;
        }

        saves.saveRun(this.state, getLanguage());

        if (this.state.run.currentAct !== actBefore) {
          this.showActInterstitial(() => this.showCard(dir as 1 | -1));
        } else {
          this.showCard(dir as 1 | -1);
        }
      },
    });
  }

  private showActInterstitial(done: () => void) {
    const act = content.acts.find((a) => a.id === this.state.run.currentAct);
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a0e, 1).setDepth(60);
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, act?.title ? t(act.title) : '', {
      fontFamily: FONT, fontSize: '30px', color: COLORS.text, letterSpacing: 4,
    }).setOrigin(0.5).setDepth(61).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: this.reducedMotion() ? 0 : 400 });
    this.time.delayedCall(1400, () => {
      this.tweens.add({
        targets: [overlay, title],
        alpha: 0,
        duration: this.reducedMotion() ? 0 : 400,
        onComplete: () => {
          overlay.destroy();
          title.destroy();
          done();
        },
      });
    });
  }

  private reducedMotion(): boolean {
    return session.meta.settings?.reducedMotion ?? false;
  }

  // ----------------------------------------------------------------- debug

  private toggleDebug() {
    if (this.debugEl) {
      this.debugEl.remove();
      this.debugEl = undefined;
      return;
    }
    const el = document.createElement('pre');
    el.style.cssText =
      'position:fixed;top:0;right:0;width:340px;max-height:100vh;overflow:auto;background:rgba(0,0,0,.85);color:#9f9;font-size:11px;padding:8px;z-index:99;margin:0;';
    document.body.appendChild(el);
    this.debugEl = el;
    this.refreshDebug();
  }

  private refreshDebug() {
    if (!this.debugEl) return;
    const s = this.state;
    const pendingEvents = s.scheduledEvents.filter((e) => e.status === 'pending');
    this.debugEl.textContent = JSON.stringify(
      {
        card: s.run.currentCardId,
        act: s.run.currentAct,
        turn: s.run.turn,
        actTurn: s.run.actTurn,
        stats: s.stats,
        flags: s.flags,
        relationships: s.relationships,
        precedents: s.precedents,
        obligations: s.obligations.filter((o) => o.status === 'active').map((o) => `${o.id} (${o.creditor} w${o.weight})`),
        queued: pendingEvents.map((e) => `${e.eventId}@${e.triggerAtTurn ?? e.triggerAct}`),
        beatsDone: s.narrative.completedBeats,
      },
      null,
      1,
    );
  }
}
