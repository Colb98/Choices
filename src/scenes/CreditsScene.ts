import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../ui/dimensions';
import { hasKey, t } from '../engine/i18n';
import { content, session } from '../services';
import { COLORS, FONT } from '../ui/format';
import { discoveredCount, endingToTease, listedEndings, UNLISTED_ENDINGS } from '../ui/endings';
import { enableHighResolutionText } from '../ui/textQuality';
import { audio } from '../audio';

export class CreditsScene extends Phaser.Scene {
  private fromEnding = false;
  private endingId?: string;
  private newlyDiscovered = false;

  constructor() {
    super('Credits');
  }

  init(data: { fromEnding?: boolean; endingId?: string; newlyDiscovered?: boolean }) {
    this.fromEnding = data?.fromEnding ?? false;
    this.endingId = data?.endingId;
    this.newlyDiscovered = data?.newlyDiscovered ?? false;
  }

  create() {
    enableHighResolutionText(this);
    this.cameras.main.setBackgroundColor(0x0a0a0e);
    audio.playMusic(this, 'menu');
    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 200, t('ui.credits.title'), {
      fontFamily: FONT, fontSize: '28px', color: COLORS.text, letterSpacing: 6,
    }).setOrigin(0.5);

    // The theme quote lives here — never preached during the story itself.
    const quoteKey = hasKey('credits.quote') ? 'credits.quote' : 'ui.credits.quote';
    this.add.text(cx, GAME_HEIGHT / 2 - 20, t(quoteKey), {
      fontFamily: FONT, fontSize: '19px', color: '#cfcdc6', fontStyle: 'italic',
      wordWrap: { width: 400 }, align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);
    this.add.text(cx, GAME_HEIGHT / 2 + 70, t('ui.credits.quote_attr'), {
      fontFamily: FONT, fontSize: '15px', color: COLORS.textDim,
    }).setOrigin(0.5);

    if (this.fromEnding && this.endingId) this.renderProgress(cx);

    const back = this.add.text(cx, GAME_HEIGHT - 140, t('ui.credits.back'), {
      fontFamily: FONT, fontSize: '22px', color: COLORS.text,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor(COLORS.accent));
    back.on('pointerout', () => back.setColor(COLORS.text));
    back.on('pointerdown', () => this.scene.start('MainMenu'));

    if (this.fromEnding) {
      back.setAlpha(0);
      this.tweens.add({ targets: back, alpha: 1, duration: 600, delay: 1500 });
    }
  }

  /**
   * Replay is only a possibility the player knows about. Under the quote:
   * which ending this was, how many there are, and one door not yet opened —
   * phrased as what it would have taken, never as a mechanic.
   */
  private renderProgress(cx: number) {
    const ending = content.endings.find((e) => e.id === this.endingId);
    if (!ending) return;
    const total = listedEndings(content).length;
    const found = discoveredCount(content, session.meta);
    const rm = session.meta.settings?.reducedMotion ?? false;
    const lines: Phaser.GameObjects.Text[] = [];

    const title = this.add.text(cx, GAME_HEIGHT / 2 + 150, t(ending.titleKey).toUpperCase(), {
      fontFamily: FONT, fontSize: '16px', color: COLORS.accent, letterSpacing: 4,
    }).setOrigin(0.5);
    lines.push(title);
    if (!UNLISTED_ENDINGS.has(ending.id)) {
      const label = t('ui.ending.progress', [String(found), String(total)]);
      const progress = this.add.text(cx, GAME_HEIGHT / 2 + 180,
        this.newlyDiscovered ? `${label}  ·  ${t('ui.ending.new')}` : label, {
          fontFamily: FONT, fontSize: '14px', color: COLORS.text, letterSpacing: 1,
        }).setOrigin(0.5);
      lines.push(progress);
    }
    const tease = endingToTease(content, session.meta);
    if (tease && hasKey(`ending.${tease.id}.hint`)) {
      const hint = this.add.text(cx, GAME_HEIGHT / 2 + 215, `${t('ui.ending.not_yet')} ${t(`ending.${tease.id}.hint`)}`, {
        fontFamily: FONT, fontSize: '14px', color: COLORS.textDim, fontStyle: 'italic',
        wordWrap: { width: 400 }, align: 'center', lineSpacing: 5,
      }).setOrigin(0.5, 0);
      lines.push(hint);
    }
    if (!rm) {
      lines.forEach((l) => l.setAlpha(0));
      this.tweens.add({ targets: lines, alpha: 1, duration: 700, delay: 900 });
    }
  }
}
