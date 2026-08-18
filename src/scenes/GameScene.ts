import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../ui/dimensions';
import { content, engine, saves, session } from '../services';
import { runwayRatio } from '../engine/economy';
import { getLanguage, hasKey, t } from '../engine/i18n';
import type { LockState, WitnessItem } from '../engine/engine';
import type { CardDefinition, ChoicePreview, GameState, TrustTrend } from '../engine/types';
import { COLORS, FONT, formatMoney, formatSignedMoney } from '../ui/format';
import { enableHighResolutionText } from '../ui/textQuality';
import { audio } from '../audio';

// Layout (Lapse-like): HUD row on top, one panel containing the narrative
// (scrollable when long) directly above a large draggable artwork card.
const ICON_Y = 84;
const ICON_XS = { standing: 255, power: 350, trust: 445 } as const;
const ICON_SIZE = 46;
const MONEY_TEXT_MAX_W = 166;
const MONEY_ARROW_GAP = 7;
const MONEY_ARROW_MAX_RIGHT = ICON_XS.standing - ICON_SIZE / 2 - 2;
// Triangle glyphs carry more visual weight below their text-box center.
// Lift them slightly so they appear centered beside the money amount.
const MONEY_ARROW_Y_OFFSET = -2;
const MONEY_BAR = { x: 30, y: 121, w: 150, h: 7 };
const PANEL = { x: 30, y: 132, w: GAME_WIDTH - 60, h: 760 };
const SPEAKER_Y = 152;
// Narrative viewport: masked, drag/wheel-scrollable when the text overflows.
const NARR = { x: 44, y: 186, w: GAME_WIDTH - 88, h: 145 };
const NARR_LINE_H = 28;
const CARD_W = 440;
const CARD_H = 470;
const CARD_RADIUS = 26;
const CARD_X = GAME_WIDTH / 2;
// The card and timeline form one bottom-anchored block. Narrative length only
// affects scrolling above it, never the block's vertical position.
const TIMELINE_DAY_Y = PANEL.y + PANEL.h - 34;
const TIMELINE_YEAR_Y = TIMELINE_DAY_Y - 20;
const CARD_Y = TIMELINE_YEAR_Y - 25 - CARD_H / 2;
const COMMIT_DIST = 120;
const ARROW_DIST = 80;
const MAX_ANGLE = 14;
const HUD_CHANGE_MS = 600;
const HUD_GAIN_COLOR = 0x8fd27f;
const HUD_LOSS_COLOR = 0xe36f78;
const MONEY_TEXT_COLOR = 0xfff5e8;
const MONEY_CRITICAL_COLOR = 0xd66a6a;
/** Choices are nearly invisible until you drag toward them; opaque at commit threshold. */
const CHOICE_BASE_ALPHA = 0.00;
/** A continue card's single action is always legible: it is not a commitment to hide behind a drag. */
const CONTINUE_LABEL_ALPHA = 0.85;
/** Continue cards commit on a shorter drag, or a plain tap. */
const CONTINUE_COMMIT_DIST = 60;
const TAP_DIST = 14;
/** The Record's witness hold: no button, no skip. Long enough to read one sentence twice. */
const WITNESS_HOLD_MS = 1600;
const ARROW_UP = '▲';
const ARROW_DOWN = '▼';

type IconKey = keyof typeof ICON_XS;
interface StatIcon {
  fill: Phaser.GameObjects.Image;
  maskG: Phaser.GameObjects.Graphics;
  shown: number; // 0..100, currently displayed fill
  up: Phaser.GameObjects.Text;
  down: Phaser.GameObjects.Text;
}

interface HudSnapshot {
  money: number;
  standing: number;
  power: number;
  trust: number;
}

/** Builds the feedback color early, holds it, then returns it near the end. */
function feedbackColorStrength(progress: number): number {
  if (progress < 0.22) return progress / 0.22;
  if (progress < 0.68) return 1;
  return Math.max(0, (1 - progress) / 0.32);
}

function feedbackBlinkAlpha(progress: number): number {
  const envelope = Math.min(1, progress / 0.08, (1 - progress) / 0.18);
  const blink = Math.sin(progress * Math.PI * 2) ** 2;
  return 1 - 0.42 * blink * Math.max(0, envelope);
}

function mixColor(from: number, to: number, amount: number): number {
  const mix = (shift: number) => Math.round(
    ((from >> shift) & 0xff) + (((to >> shift) & 0xff) - ((from >> shift) & 0xff)) * amount,
  );
  return (mix(16) << 16) | (mix(8) << 8) | mix(0);
}

function colorCss(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

export class GameScene extends Phaser.Scene {
  private state!: GameState;

  // HUD
  private hud!: Phaser.GameObjects.Container;
  private moneyText!: Phaser.GameObjects.Text;
  private moneyBarFill!: Phaser.GameObjects.Rectangle;
  private cashflowText!: Phaser.GameObjects.Text;
  private cashflowInfo!: Phaser.GameObjects.Text;
  private cashflowInfoHit!: Phaser.GameObjects.Rectangle;
  private runwayLabel!: Phaser.GameObjects.Text;
  private moneyUp!: Phaser.GameObjects.Text;
  private moneyDown!: Phaser.GameObjects.Text;
  private icons: Partial<Record<IconKey, StatIcon>> = {};
  private timelineYearText!: Phaser.GameObjects.Text;
  private timelineDayText!: Phaser.GameObjects.Text;
  private cardRestY = CARD_Y;

  // Narrative panel (static; body scrolls when long)
  private speakerText!: Phaser.GameObjects.Text;
  private narrContent!: Phaser.GameObjects.Container;
  private narrScroll = 0;
  private narrMaxScroll = 0;
  private measureNormal!: Phaser.GameObjects.Text;
  private measureBold!: Phaser.GameObjects.Text;
  private measureItalic!: Phaser.GameObjects.Text;
  private measureBoldItalic!: Phaser.GameObjects.Text;
  private highlightTerms: string[] = [];

  // Card (draggable, artwork only)
  private cardC!: Phaser.GameObjects.Container;
  private artImage!: Phaser.GameObjects.Image;
  private cardArtMaskG!: Phaser.GameObjects.Graphics;
  private lockIcon!: Phaser.GameObjects.Text;

  // Choices
  private leftLabel!: Phaser.GameObjects.Text;
  private rightLabel!: Phaser.GameObjects.Text;
  private continueLabel!: Phaser.GameObjects.Text;

  private dragging = false;
  private dragStart = { x: 0, y: 0 };
  private dragOffset = { x: 0, y: 0 };
  private busy = false;
  private debugEl?: HTMLElement;
  private tooltip!: Phaser.GameObjects.Container;
  private tooltipText!: Phaser.GameObjects.Text;
  private tooltipPinned = false;

  constructor() {
    super('Game');
  }

  create() {
    if (!session.state) {
      this.scene.start('MainMenu');
      return;
    }
    enableHighResolutionText(this);
    this.state = session.state;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.buildHud();
    this.buildPanel();
    this.buildCard();
    this.buildTimeline();
    this.setupInput();
    this.rebuildHighlightTerms();
    this.showCard();

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.debugEl?.remove();
      this.debugEl = undefined;
      this.cardArtMaskG?.destroy();
    });
  }

  // ------------------------------------------------------------------- HUD

  private buildHud() {
    this.hud = this.add.container(0, 0);

    this.moneyText = this.add.text(30, 62, '', {
      fontFamily: FONT, fontSize: '26px', color: COLORS.text, fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.cashflowText = this.add.text(30, 87, '', {
      fontFamily: FONT, fontSize: '12px', color: COLORS.textDim,
    }).setOrigin(0, 0.5);
    this.runwayLabel = this.add.text(30, 105, t('ui.hud.runway').toUpperCase(), {
      fontFamily: FONT, fontSize: '9px', color: COLORS.textDim,
    }).setOrigin(0, 0.5);
    const moneyBarBg = this.add.rectangle(
      MONEY_BAR.x, MONEY_BAR.y, MONEY_BAR.w, MONEY_BAR.h, COLORS.barBg,
    ).setOrigin(0, 0.5);
    this.moneyBarFill = this.add.rectangle(
      MONEY_BAR.x, MONEY_BAR.y, MONEY_BAR.w, MONEY_BAR.h, 0x7ca36d,
    ).setOrigin(0, 0.5);
    this.moneyUp = this.makeArrow(MONEY_ARROW_MAX_RIGHT - 12, this.moneyText.y + MONEY_ARROW_Y_OFFSET);
    this.moneyDown = this.makeArrow(MONEY_ARROW_MAX_RIGHT - 12, this.moneyText.y + MONEY_ARROW_Y_OFFSET);
    this.cashflowInfo = this.add.text(0, 87, 'ⓘ', {
      fontFamily: FONT, fontSize: '14px', color: COLORS.textDim,
    }).setOrigin(0.5);
    this.cashflowInfoHit = this.add.rectangle(0, 87, 32, 32, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    this.hud.add([
      this.moneyText, this.cashflowText, this.runwayLabel,
      moneyBarBg, this.moneyBarFill, this.moneyUp, this.moneyDown,
      this.cashflowInfo, this.cashflowInfoHit,
    ]);

    const tooltipKeys: Record<IconKey, string> = {
      standing: 'ui.hud.standing',
      power: 'ui.hud.power',
      trust: 'ui.hud.trust_perceived',
    };

    for (const key of Object.keys(ICON_XS) as IconKey[]) {
      const x = ICON_XS[key];
      // The icon IS the progress bar: a dim base glyph, and a colored copy
      // clipped from the bottom by a geometry (stencil) mask.
      const base = this.add.image(x, ICON_Y, `hud:${key}`)
        .setDisplaySize(ICON_SIZE, ICON_SIZE)
        .setAlpha(0.28);
      const fill = this.add.image(x, ICON_Y, `hud:${key}`)
        .setDisplaySize(ICON_SIZE, ICON_SIZE);
      const maskG = this.make.graphics({}, false);
      fill.setMask(maskG.createGeometryMask());
      const up = this.makeArrow(x, ICON_Y - ICON_SIZE / 2 - 16);
      const down = this.makeArrow(x, ICON_Y + ICON_SIZE / 2 + 16);
      this.hud.add([base, fill, up, down]);
      this.icons[key] = { fill, maskG, shown: -1, up, down };

      // Tooltip: hover on desktop, press-and-hold on touch.
      base.setInteractive({ useHandCursor: true });
      base.on('pointerover', () => this.showTooltip(t(tooltipKeys[key]), x, ICON_Y - ICON_SIZE / 2 - 8));
      base.on('pointerdown', () => this.showTooltip(t(tooltipKeys[key]), x, ICON_Y - ICON_SIZE / 2 - 8));
      base.on('pointerout', () => this.hideTooltip());
      base.on('pointerup', () => this.hideTooltip());
    }

    this.tooltipText = this.add.text(0, 0, '', {
      fontFamily: FONT, fontSize: '14px', color: COLORS.text,
      backgroundColor: '#2b2028', padding: { x: 10, y: 6 },
      wordWrap: { width: 300 }, align: 'left', lineSpacing: 3,
    }).setOrigin(0.5, 1);
    this.tooltip = this.add.container(0, ICON_Y - ICON_SIZE / 2 - 8, [this.tooltipText])
      .setDepth(40).setAlpha(0);

    moneyBarBg.setInteractive({ useHandCursor: true });
    moneyBarBg.on('pointerover', () => this.showTooltip(t('ui.hud.runway'), 105, 142));
    moneyBarBg.on('pointerdown', () => this.showTooltip(t('ui.hud.runway'), 105, 142));
    moneyBarBg.on('pointerout', () => this.hideTooltip());
    moneyBarBg.on('pointerup', () => this.hideTooltip());

    this.cashflowInfoHit.on('pointerover', () => {
      if (!this.tooltipPinned) this.showTooltip(this.economyTooltip(), GAME_WIDTH - 10, 142, false, 250);
    });
    this.cashflowInfoHit.on('pointerout', () => {
      if (!this.tooltipPinned) this.hideTooltip();
    });
    this.cashflowInfoHit.on('pointerdown', () => {
      this.tooltipPinned = !this.tooltipPinned;
      if (this.tooltipPinned) this.showTooltip(this.economyTooltip(), GAME_WIDTH - 10, 142, true, 250);
      else this.hideTooltip(true);
    });

    this.updateHud(false);
  }

  private showTooltip(label: string, x: number, y: number, pinned = false, wrapWidth = 300) {
    if (!pinned) this.tooltipPinned = false;
    this.tooltipText.setWordWrapWidth(wrapWidth).setText(label);
    const halfWidth = this.tooltipText.width / 2;
    this.tooltip.x = Phaser.Math.Clamp(x, halfWidth + 10, GAME_WIDTH - halfWidth - 10);
    this.tooltip.y = y;
    this.tooltip.setAlpha(1);
  }

  private hideTooltip(force = false) {
    if (this.tooltipPinned && !force) return;
    this.tooltip.setAlpha(0);
  }

  private economyTooltip(): string {
    if (!this.state.run.currentCardId) return t('ui.economy.title');
    const flow = engine.getEconomyBreakdown(this.state);
    const pressure = flow.baseTurnCost + flow.precedentExposureCost +
      flow.activeObligationCost + flow.betrayedObligationCost;
    const lines = [
      t('ui.economy.title'),
      `${t('ui.economy.institutional')}  ${formatSignedMoney(flow.institutionalIncome)}`,
      `${t('ui.economy.civic')}  ${formatSignedMoney(flow.civicIncome)}`,
    ];
    if (flow.leverageIncome !== 0) {
      lines.push(`${t('ui.economy.leverage')}  ${formatSignedMoney(flow.leverageIncome)}`);
    }
    if (pressure !== 0) {
      lines.push(`${t('ui.economy.pressure')}  ${formatSignedMoney(-pressure)}`);
    }
    return lines.join('\n');
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
      targets: proxy, v: target, duration: HUD_CHANGE_MS, ease: 'Cubic.out',
      onUpdate: () => draw(proxy.v),
    });
  }

  private moneyTextColor(value: number): number {
    return runwayRatio(value, content.balance) <= content.balance.economy.criticalThreshold
      ? MONEY_CRITICAL_COLOR
      : MONEY_TEXT_COLOR;
  }

  private renderMoney(value: number, textColor?: string) {
    const ratio = runwayRatio(value, content.balance);
    const { lowThreshold, criticalThreshold } = content.balance.economy;
    const barColor = ratio <= criticalThreshold
      ? 0xb23a3a
      : ratio <= lowThreshold
        ? 0xc18a42
        : 0x7ca36d;
    this.moneyText.setScale(1).setText(formatMoney(value));
    this.moneyText.setScale(Math.min(1, MONEY_TEXT_MAX_W / this.moneyText.width));
    this.moneyText.setColor(textColor ?? colorCss(this.moneyTextColor(value)));
    this.moneyBarFill
      .setFillStyle(barColor)
      .setDisplaySize(Math.max(2, MONEY_BAR.w * ratio), MONEY_BAR.h)
      .setAlpha(value <= 0 ? 0.25 : 1);
  }

  private hudSnapshot(): HudSnapshot {
    return {
      money: this.state.stats.money,
      standing: this.state.stats.standing,
      power: this.state.stats.power,
      trust: this.state.stats.publicTrustPerceived,
    };
  }

  private updateHud(animate = true, from?: HudSnapshot) {
    const targetMoney = this.state.stats.money;
    if (animate && from && from.money !== targetMoney && !this.reducedMotion()) {
      const signalColor = targetMoney > from.money ? HUD_GAIN_COLOR : HUD_LOSS_COLOR;
      const proxy = { progress: 0 };
      this.tweens.add({
        targets: proxy,
        progress: 1,
        duration: HUD_CHANGE_MS,
        onUpdate: () => {
          const eased = Phaser.Math.Easing.Cubic.Out(proxy.progress);
          const value = Phaser.Math.Linear(from.money, targetMoney, eased);
          const baseColor = this.moneyTextColor(value);
          this.renderMoney(value, colorCss(mixColor(baseColor, signalColor, feedbackColorStrength(proxy.progress))));
          this.moneyText.setAlpha(feedbackBlinkAlpha(proxy.progress));
        },
        onComplete: () => {
          this.moneyText.setAlpha(1);
          this.renderMoney(targetMoney);
        },
      });
    } else {
      this.renderMoney(targetMoney);
      if (from && from.money !== targetMoney) {
        const signalColor = targetMoney > from.money ? HUD_GAIN_COLOR : HUD_LOSS_COLOR;
        this.moneyText.setColor(colorCss(signalColor));
        this.time.delayedCall(240, () => this.renderMoney(targetMoney));
      }
    }
    const currentCard = this.state.run.currentCardId ? engine.currentCard(this.state) : undefined;
    const flow = currentCard ? engine.getEconomyBreakdown(this.state, currentCard).total : 0;
    this.cashflowText
      .setText(`${formatSignedMoney(flow)} ${t('ui.hud.per_turn')}`)
      .setColor(flow < 0 ? '#d08a8a' : flow > 0 ? '#9ac48a' : COLORS.textDim);
    const infoX = Math.min(218, this.cashflowText.x + this.cashflowText.width + 12);
    this.cashflowInfo.setX(infoX);
    this.cashflowInfoHit.setX(infoX);
    this.setIconFill('standing', this.state.stats.standing, animate);
    this.setIconFill('power', this.state.stats.power, animate);
    // The player sees PERCEIVED trust; reality may differ.
    this.setIconFill('trust', this.state.stats.publicTrustPerceived, animate);
    if (from) this.pulseHudChanges(from, animate);
  }

  private pulseHudChanges(from: HudSnapshot, animate: boolean) {
    const pulseImage = (image: Phaser.GameObjects.Image, delta: number) => {
      if (delta === 0) return;
      const tint = delta > 0 ? HUD_GAIN_COLOR : HUD_LOSS_COLOR;
      const finish = () => image.setAlpha(1).clearTint();
      if (this.reducedMotion() || !animate) {
        image.setTint(tint);
        this.time.delayedCall(240, finish);
        return;
      }
      const proxy = { progress: 0 };
      this.tweens.add({
        targets: proxy,
        progress: 1,
        duration: HUD_CHANGE_MS,
        onUpdate: () => {
          image.setTint(mixColor(0xffffff, tint, feedbackColorStrength(proxy.progress)));
          image.setAlpha(feedbackBlinkAlpha(proxy.progress));
        },
        onComplete: finish,
      });
    };
    pulseImage(this.icons.standing!.fill, this.state.stats.standing - from.standing);
    pulseImage(this.icons.power!.fill, this.state.stats.power - from.power);
    pulseImage(this.icons.trust!.fill, this.state.stats.publicTrustPerceived - from.trust);

  }

  private showMoneyDelta(delta: number) {
    if (delta === 0) return;
    const loss = delta < 0;
    const txt = this.add.text(105, 46, formatSignedMoney(delta), {
      fontFamily: FONT, fontSize: '17px', fontStyle: 'bold',
      color: loss ? '#e18181' : '#9ac48a',
    }).setOrigin(0.5).setDepth(45);
    this.tweens.add({
      targets: txt, y: 24, alpha: 0,
      duration: this.reducedMotion() ? 450 : 900,
      ease: 'Cubic.out',
      onComplete: () => txt.destroy(),
    });
    const ratio = runwayRatio(this.state.stats.money, content.balance);
    if (loss && ratio <= content.balance.economy.criticalThreshold) {
      this.cameras.main.flash(this.reducedMotion() ? 0 : 180, 125, 25, 25, false);
      if (!this.reducedMotion() && (session.meta.settings?.screenShake ?? true)) {
        this.cameras.main.shake(180, 0.006);
      }
    }
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
    const p: ChoicePreview = {
      ...(choice.preview ?? {}),
      money: engine.moneyTrend(engine.projectMoneyDelta(this.state, card, side, lock.kind === 'cost')),
    };
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
        if (eff.type === 'stat' && eff.stat !== 'money' && eff.add !== undefined && eff.add !== 0) {
          const mag = Math.abs(eff.add) >= 9 ? 3 : Math.abs(eff.add) >= 4 ? 2 : 1;
          const key: 'money' | IconKey | undefined =
            eff.stat === 'standing' ? 'standing'
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
      target.setFontSize(this.arrowSize(tr.mag));
      target.setColor(tr.dir > 0 ? '#9ac48a' : '#d08a8a');
      target.setText((tr.dir > 0 ? ARROW_UP : ARROW_DOWN) + (tr.uncertain ? '?' : ''));
      if (key === 'money') {
        const arrowHalfWidth = target.displayWidth / 2;
        const arrowX = Math.min(
          MONEY_ARROW_MAX_RIGHT - arrowHalfWidth,
          this.moneyText.x + this.moneyText.displayWidth + MONEY_ARROW_GAP + arrowHalfWidth,
        );
        target.setPosition(arrowX, this.moneyText.y + MONEY_ARROW_Y_OFFSET);
      }
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

  private buildTimeline() {
    this.timelineYearText = this.add.text(GAME_WIDTH / 2, TIMELINE_YEAR_Y, '', {
      fontFamily: FONT, fontSize: '13px', color: COLORS.accent,
      fontStyle: 'bold', letterSpacing: 2,
    }).setOrigin(0.5).setDepth(1);
    this.timelineDayText = this.add.text(GAME_WIDTH / 2, TIMELINE_DAY_Y, '', {
      fontFamily: FONT, fontSize: '11px', color: COLORS.textDim,
      letterSpacing: 1,
    }).setOrigin(0.5).setDepth(1);
    this.updateTimeline();
  }

  private updateTimeline() {
    const elapsedDays = engine.getStoryElapsedDays(this.state);
    const year = engine.getStoryYear(this.state);
    const localizedDays = new Intl.NumberFormat(getLanguage()).format(elapsedDays);
    this.timelineYearText.setText(t('ui.timeline.year', [year]));
    this.timelineDayText.setText(t('ui.timeline.day_in_office', [localizedDays]));
  }

  private anchorCardToPanelBottom() {
    this.cardRestY = CARD_Y;
    this.timelineYearText?.setY(TIMELINE_YEAR_Y);
    this.timelineDayText?.setY(TIMELINE_DAY_Y);
  }

  // ------------------------------------------------------- narrative panel

  private buildPanel() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.bgPanel, 1);
    g.fillRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 14);

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
    this.measureItalic = this.add.text(0, 0, '', {
      fontFamily: FONT, fontSize: '19px', fontStyle: 'italic',
    }).setVisible(false);
    this.measureBoldItalic = this.add.text(0, 0, '', {
      fontFamily: FONT, fontSize: '19px', fontStyle: 'bold italic',
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
   * Two marker styles, deliberately distinct in weight:
   * - character names (auto-highlighted, plus any authored **run**) render
   *   bold + accent — identity always pops;
   * - authored *runs* render italic in the body color — quiet emphasis for
   *   the one sentence whose intent carries the card ("If you ask."),
   *   skimmable without shouting.
   * Layout is manual: styled runs, centered lines, CJK-aware wrapping.
   * Returns total content height.
   */
  private renderRichBody(raw: string): number {
    this.narrContent.removeAll(true);

    // Pass 1 — authored markers; ** must win over *, so its alternative comes first.
    interface StyleRun { text: string; bold: boolean; italic: boolean }
    const authored: StyleRun[] = [];
    for (const part of raw.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g)) {
      if (!part) continue;
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        authored.push({ text: part.slice(2, -2), bold: true, italic: false });
      } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        authored.push({ text: part.slice(1, -1), bold: false, italic: true });
      } else {
        authored.push({ text: part, bold: false, italic: false });
      }
    }

    // Pass 2 — auto-highlight character names inside non-bold runs, reusing
    // ** as a sentinel (authored markers were consumed above, so any ** here
    // is ours). Boundary guard is Latin-only: it stops "Minister" matching
    // inside "Ministerial", while CJK names still match mid-sentence (no
    // spaces there). The * in the guard keeps shorter terms from re-matching
    // inside an already-wrapped longer one ("Officer" in **Press Officer**).
    const latin = 'A-Za-z\\u00C0-\\u024F\\u1E00-\\u1EFF';
    const styled: StyleRun[] = [];
    for (const run of authored) {
      if (run.bold) { styled.push(run); continue; }
      let text = run.text;
      for (const term of this.highlightTerms) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        text = text.replace(
          new RegExp(`(^|[^*${latin}])(${escaped})(?![*${latin}])`, 'giu'),
          (_m, pre, hit) => `${pre}**${hit}**`,
        );
      }
      for (const part of text.split(/(\*\*[^*\n]+\*\*)/g)) {
        if (!part) continue;
        const name = part.startsWith('**') && part.endsWith('**');
        // A name inside an italic sentence keeps the italic slant on top of
        // its bold+accent, so the emphasis run still reads as one phrase.
        styled.push({ text: name ? part.slice(2, -2) : part, bold: name, italic: run.italic });
      }
    }

    interface Token { text: string; bold: boolean; italic: boolean; space: boolean }
    const tokens: Token[] = [];
    for (const run of styled) {
      run.text.split('\n').forEach((para, i) => {
        if (i > 0) tokens.push({ text: '\n', bold: false, italic: false, space: false });
        // CJK characters wrap individually; latin words wrap as units.
        for (const m of para.matchAll(/([　-〿㐀-鿿豈-﫿＀-￯])|(\s+)|([^\s　-〿㐀-鿿豈-﫿＀-￯]+)/gu)) {
          tokens.push({ text: m[0], bold: run.bold, italic: run.italic, space: !!m[2] });
        }
      });
    }

    const scratchFor = (bold: boolean, italic: boolean) => (
      bold
        ? (italic ? this.measureBoldItalic : this.measureBold)
        : (italic ? this.measureItalic : this.measureNormal)
    );
    const widthOf = (tk: Token) => {
      const scratch = scratchFor(tk.bold, tk.italic);
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
      const segments: { text: string; bold: boolean; italic: boolean }[] = [];
      for (const tk of line) {
        const last = segments[segments.length - 1];
        if (last && last.bold === tk.bold && last.italic === tk.italic) last.text += tk.text;
        else segments.push({ text: tk.text, bold: tk.bold, italic: tk.italic });
      }
      const segWidths = segments.map((s) => {
        const scratch = scratchFor(s.bold, s.italic);
        scratch.setText(s.text.replace(/ /g, ' '));
        return scratch.width;
      });
      const total = segWidths.reduce((a, b) => a + b, 0);
      let x = GAME_WIDTH / 2 - total / 2;
      segments.forEach((seg, i) => {
        const txt = this.add.text(x, y, seg.text, {
          fontFamily: FONT, fontSize: '19px',
          color: seg.bold ? COLORS.accent : COLORS.text,
          fontStyle: seg.bold
            ? (seg.italic ? 'bold italic' : 'bold')
            : (seg.italic ? 'italic' : 'normal'),
        }).setOrigin(0, 0);
        this.narrContent.add(txt);
        x += segWidths[i];
      });
      y += NARR_LINE_H;
    }

    this.narrMaxScroll = Math.max(0, y - NARR.h);
    this.setNarrScroll(0);
    return y;
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
    this.cardC.setDepth(2);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.38);
    shadow.fillRoundedRect(-CARD_W / 2, -CARD_H / 2 + 8, CARD_W, CARD_H, CARD_RADIUS);

    const fallback = this.add.graphics();
    fallback.fillStyle(COLORS.card, 1);
    fallback.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, CARD_RADIUS);

    const hitTarget = this.add.rectangle(0, 0, CARD_W, CARD_H, 0xffffff, 0);
    hitTarget.setInteractive({ draggable: true, useHandCursor: true });

    this.artImage = this.add.image(0, 0, '__DEFAULT').setVisible(false);
    this.cardArtMaskG = this.make.graphics({ x: CARD_X, y: CARD_Y }, false);
    this.cardArtMaskG.fillStyle(0xffffff);
    this.cardArtMaskG.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, CARD_RADIUS);
    this.artImage.setMask(this.cardArtMaskG.createGeometryMask());
    this.lockIcon = this.add.text(0, 0, '🔒', { fontSize: '46px' }).setOrigin(0.5).setAlpha(0);

    // Choice labels live on the card's top corners and move/rotate with it —
    // on the OPPOSITE corner of their drag direction, so the corner that stays
    // inside the viewport during the drag is the one you're reading.
    this.leftLabel = this.add.text(CARD_W / 2 - 16, -CARD_H / 2 + 14, '', {
      fontFamily: FONT, fontSize: '21px', color: COLORS.text,
      wordWrap: { width: 185 }, align: 'right',
    }).setOrigin(1, 0).setAlpha(CHOICE_BASE_ALPHA)
      .setShadow(0, 2, 'rgba(0,0,0,0.55)', 4, false, true);
    this.rightLabel = this.add.text(-CARD_W / 2 + 16, -CARD_H / 2 + 14, '', {
      fontFamily: FONT, fontSize: '21px', color: COLORS.text,
      wordWrap: { width: 185 }, align: 'left',
    }).setOrigin(0, 0).setAlpha(CHOICE_BASE_ALPHA)
      .setShadow(0, 2, 'rgba(0,0,0,0.55)', 4, false, true);

    // Continue cards: one centered action, visible at rest, no fake pair.
    this.continueLabel = this.add.text(0, -CARD_H / 2 + 18, '', {
      fontFamily: FONT, fontSize: '19px', color: COLORS.text, fontStyle: 'italic',
      wordWrap: { width: 360 }, align: 'center',
    }).setOrigin(0.5, 0).setAlpha(0)
      .setShadow(0, 2, 'rgba(0,0,0,0.55)', 4, false, true);

    this.cardC.add([shadow, fallback, this.artImage, hitTarget, this.leftLabel, this.rightLabel, this.continueLabel, this.lockIcon]);

    hitTarget.on('dragstart', (pointer: Phaser.Input.Pointer) => {
      if (this.busy) return;
      this.dragging = true;
      this.dragStart = { x: pointer.x, y: pointer.y };
    });
    hitTarget.on('drag', (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging || this.busy) return;
      this.onDragMove(pointer.x - this.dragStart.x, pointer.y - this.dragStart.y);
    });
    hitTarget.on('dragend', () => {
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
    this.input.keyboard?.on('keydown-SPACE', () => this.tryContinueKey());
    this.input.keyboard?.on('keydown-ENTER', () => this.tryContinueKey());
  }

  private isContinue(): boolean {
    return engine.isContinueCard(this.currentCard());
  }

  private tryContinueKey() {
    if (this.busy || !this.isContinue()) return;
    this.commit('left', false);
  }

  private currentCard(): CardDefinition {
    return engine.currentCard(this.state);
  }

  private showCard(fromDirection: 0 | 1 | -1 = 0) {
    const card = this.currentCard();
    audio.playGameMusic(this, this.state.run.currentAct);
    const speaker = card.speaker ? t(content.characters[card.speaker]?.nameKey ?? `char.${card.speaker}.name`) : '';
    this.speakerText.setText(speaker);
    this.renderRichBody(t(engine.resolveCardTextKey(this.state, card)));
    this.anchorCardToPanelBottom();
    this.updateCardArt(card);
    this.updateTimeline();

    const isIncident = card.type === 'incident';
    this.hud.setAlpha(isIncident ? 0 : 1);

    const left = engine.resolveChoice(this.state, card, 'left');
    const right = engine.resolveChoice(this.state, card, 'right');
    if (engine.isContinueCard(card)) {
      // One action, always readable, no preview: this screen is not a commitment.
      this.setChoiceText(this.leftLabel, '');
      this.setChoiceText(this.rightLabel, '');
      this.continueLabel.setText(`${t(left.textKey)}  ›`).setAlpha(CONTINUE_LABEL_ALPHA);
    } else {
      this.continueLabel.setText('').setAlpha(0);
      this.setChoiceText(this.leftLabel, this.choiceLabel(t(left.textKey), engine.getLockState(this.state, card, 'left')));
      this.setChoiceText(this.rightLabel, this.choiceLabel(t(right.textKey), engine.getLockState(this.state, card, 'right')));
    }
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

  private setChoiceText(label: Phaser.GameObjects.Text, text: string) {
    label.setFontSize(21).setText(text);
    if (label.height > 145) label.setFontSize(18);
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
    const tw = CARD_W;
    const th = CARD_H;
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
    this.cardC.y = this.cardRestY + this.dragOffset.y;
    this.cardC.angle = Phaser.Math.Clamp((this.dragOffset.x / (GAME_WIDTH / 2)) * MAX_ANGLE, -MAX_ANGLE, MAX_ANGLE);
    this.cardArtMaskG
      .setPosition(this.cardC.x, this.cardC.y)
      .setAngle(this.cardC.angle);
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
    if (this.isContinue()) {
      // Lighter interaction: no stat preview, no side to read.
      this.hidePreviewArrows();
      return;
    }
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
    const dy = this.dragOffset.y;
    if (this.isContinue()) {
      // A tap or a short drag either way advances; both sides are the same words.
      const tapped = Math.abs(dx) < TAP_DIST && Math.abs(dy) < TAP_DIST;
      if (tapped || Math.abs(dx) >= CONTINUE_COMMIT_DIST) {
        this.commit(dx < 0 ? 'left' : 'right', false);
      } else {
        this.returnCard();
      }
      return;
    }
    const side: 'left' | 'right' = dx < 0 ? 'left' : 'right';
    const lock = engine.getLockState(this.state, this.currentCard(), side);

    if (Math.abs(dx) >= COMMIT_DIST) {
      if (lock.kind === 'hard') {
        this.vibrateLockedChoice();
        audio.playSfx(this, 'lock');
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
    if (this.isContinue()) {
      this.commit('left', false);
      return;
    }
    const lock = engine.getLockState(this.state, this.currentCard(), side);
    if (lock.kind === 'hard') {
      audio.playSfx(this, 'lock');
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

  private vibrateLockedChoice() {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([35, 30, 65]);
      } catch {
        // Some browsers expose the API while disallowing it in the current context.
      }
    }
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
    const continueText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 92, t('ui.continue_prompt'), {
      fontFamily: FONT, fontSize: '14px', color: COLORS.textDim, letterSpacing: 1,
    }).setOrigin(0.5).setDepth(52).setAlpha(0);

    this.tweens.add({ targets: overlay, fillAlpha: 0.88, duration: this.reducedMotion() ? 0 : 200 });

    const items = lock.flashbacks;
    const captionKey = hasKey(`card.${card.id}.lock_caption`) ? `card.${card.id}.lock_caption` : 'ui.lock.caption';
    const caption = t(captionKey);
    let index = items.length > 0 ? 0 : -1;
    let showingCaption = items.length === 0;
    let armed = false;

    const arm = () => {
      armed = false;
      continueText.setAlpha(0);
      this.time.delayedCall(220, () => {
        armed = true;
        continueText.setAlpha(0.8);
      });
    };
    const showMemory = () => {
      const item = items[index];
      audio.playSfx(this, 'flash');
      if (!this.reducedMotion()) {
        flashRect.fillAlpha = 0.9;
        this.tweens.add({ targets: flashRect, fillAlpha: 0, duration: 180 });
      }
      const body = t(item.cardTextKey);
      memoryText.setText(body.length > 160 ? body.slice(0, 157) + '…' : body);
      chosenText.setText(`${t('ui.flashback.you_chose')}\n${item.choiceTextKey ? t(item.choiceTextKey) : ''}`);
      memoryText.setAlpha(1);
      chosenText.setAlpha(1);
      arm();
    };
    const showCaption = () => {
      showingCaption = true;
      memoryText.setText(caption).setAlpha(1);
      chosenText.setAlpha(0);
      arm();
    };
    const cleanup = () => {
      overlay.off('pointerdown', advance);
      this.input.keyboard?.off('keydown-SPACE', advance);
      this.input.keyboard?.off('keydown-ENTER', advance);
      [overlay, flashRect, memoryText, chosenText, continueText].forEach((o) => o.destroy());
      this.busy = false;
      this.returnCard();
    };
    const advance = () => {
      if (!armed) return;
      armed = false;
      if (!showingCaption && index + 1 < items.length) {
        index += 1;
        showMemory();
      } else if (!showingCaption) {
        showCaption();
      } else {
        cleanup();
      }
    };

    overlay.on('pointerdown', advance);
    this.input.keyboard?.on('keydown-SPACE', advance);
    this.input.keyboard?.on('keydown-ENTER', advance);
    this.time.delayedCall(250, () => {
      if (showingCaption) showCaption();
      else showMemory();
    });
  }

  // ---------------------------------------------------------------- commit

  private commit(side: 'left' | 'right', payCost: boolean) {
    this.busy = true;
    const card = this.currentCard();
    const dir = side === 'left' ? -1 : 1;
    const actBefore = this.state.run.currentAct;
    const hudBefore = this.hudSnapshot();

    let result;
    try {
      result = engine.commitChoice(this.state, side, { payCost });
    } catch (err) {
      console.error(err);
      this.busy = false;
      this.returnCard();
      return;
    }
    const isContinue = engine.isContinueCard(card);
    audio.playSfx(this, 'choicePaper');

    // Continue cards slide off short and quiet — no dramatic commit for a
    // screen that was never a decision.
    const proxy = { x: this.dragOffset.x, y: this.dragOffset.y, a: 1 };
    this.tweens.add({
      targets: proxy,
      x: dir * (isContinue ? GAME_WIDTH * 0.7 : GAME_WIDTH),
      y: this.dragOffset.y + (isContinue ? 10 : 40),
      a: isContinue ? 0.2 : 0.35,
      duration: this.reducedMotion() ? 0 : isContinue ? 200 : 280,
      ease: 'Cubic.in',
      onUpdate: () => {
        this.dragOffset = { x: proxy.x, y: proxy.y };
        this.applyCardTransform();
        this.cardC.alpha = proxy.a;
      },
      onComplete: () => {
        if (card.id === 'incident_collision') audio.playSfx(this, 'crash');
        this.hidePreviewArrows();
        this.leftLabel.setAlpha(CHOICE_BASE_ALPHA);
        this.rightLabel.setAlpha(CHOICE_BASE_ALPHA);
        this.continueLabel.setAlpha(0);
        // The Record: the player's own words land on top of the act, before
        // the numbers move. Not a lock — the swipe has already happened.
        if (result.witness) {
          this.playWitness(result.witness, () => this.afterCommit(result, hudBefore, actBefore, dir));
        } else {
          this.afterCommit(result, hudBefore, actBefore, dir);
        }
      },
    });
  }

  private afterCommit(
    result: { endingId?: string },
    hudBefore: HudSnapshot,
    actBefore: string,
    dir: number,
  ) {
    this.updateHud(true, hudBefore);
    this.showMoneyDelta(this.state.stats.money - hudBefore.money);

    if (result.endingId) {
      const meta = saves.recordCompletion(result.endingId);
      session.meta = meta;
      saves.clearRun();
      this.time.delayedCall(this.reducedMotion() ? 0 : 600, () => {
        this.scene.start('Ending', { endingId: result.endingId });
      });
      return;
    }

    saves.saveRun(this.state, getLanguage());

    if (this.state.run.currentAct !== actBefore) {
      this.time.delayedCall(1200, () => {
        this.showActInterstitial(() => this.showCard(dir as 1 | -1));
      });
    } else {
      this.showCard(dir as 1 | -1);
    }
  }

  // --------------------------------------------------------------- witness

  /**
   * ENGINE-REQ-04. Fired by a `promise_break` on a held promise. Not a lock:
   * no unlock cost, no back-out, no button. The scene dims and the pledge is
   * rendered in the voice of the card where it was made, under "YOU SAID:".
   * Held ~1.6s, then play continues. Reduced Motion: hard cut, same hold.
   */
  private playWitness(item: WitnessItem, done: () => void) {
    this.busy = true;
    const rm = this.reducedMotion();
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, rm ? 0.92 : 0)
      .setDepth(50).setInteractive();
    const prefix = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 92, t('promise.witness.prefix'), {
      fontFamily: FONT, fontSize: '15px', color: COLORS.accent, letterSpacing: 4,
    }).setOrigin(0.5).setDepth(52).setAlpha(rm ? 1 : 0);
    // Same typeface and framing as the narrative body where the words were first said.
    const pledge = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, t(item.pledgeKey), {
      fontFamily: FONT, fontSize: '23px', color: COLORS.text, fontStyle: 'italic',
      wordWrap: { width: 420 }, align: 'center', lineSpacing: 8,
    }).setOrigin(0.5).setDepth(52).setAlpha(rm ? 1 : 0);
    const rule = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + pledge.height / 2 + 24, 60, 1, 0xf0b84b, 0.7)
      .setDepth(52).setAlpha(rm ? 1 : 0);
    const originCard = content.cards[item.madeAtCardId];
    const originName = originCard?.speaker
      ? t(content.characters[originCard.speaker]?.nameKey ?? `char.${originCard.speaker}.name`)
      : '';
    const origin = this.add.text(GAME_WIDTH / 2, rule.y + 22, originName ? t('promise.witness.origin', [originName]) : '', {
      fontFamily: FONT, fontSize: '13px', color: COLORS.textDim, letterSpacing: 1,
    }).setOrigin(0.5).setDepth(52).setAlpha(rm ? 1 : 0);

    audio.playSfx(this, 'flash');
    if (!rm) {
      this.tweens.add({ targets: overlay, fillAlpha: 0.9, duration: 260 });
      this.tweens.add({ targets: [prefix, pledge, rule, origin], alpha: 1, duration: 320, delay: 180 });
    }
    const objects = [overlay, prefix, pledge, rule, origin];
    this.time.delayedCall(WITNESS_HOLD_MS + (rm ? 0 : 400), () => {
      const finish = () => {
        objects.forEach((o) => o.destroy());
        this.busy = false;
        done();
      };
      if (rm) finish();
      else this.tweens.add({ targets: objects, alpha: 0, duration: 260, onComplete: finish });
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
        storyDay: engine.getStoryElapsedDays(s),
        storyYear: engine.getStoryYear(s),
        stats: s.stats,
        economy: s.run.currentCardId ? engine.getEconomyBreakdown(s) : undefined,
        flags: s.flags,
        relationships: s.relationships,
        precedents: s.precedents,
        obligations: s.obligations.filter((o) => o.status === 'active').map((o) => `${o.id} (${o.creditor} w${o.weight})`),
        promises: (s.promises ?? []).map((p) => `${p.id}: ${p.status} (@${p.madeAt.cardId})`),
        queued: pendingEvents.map((e) => `${e.eventId}@${e.triggerAtTurn ?? e.triggerAct}`),
        beatsDone: s.narrative.completedBeats,
      },
      null,
      1,
    );
  }
}
