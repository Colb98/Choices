import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../ui/dimensions';
import { hasKey, t } from '../engine/i18n';
import { COLORS, FONT } from '../ui/format';
import { enableHighResolutionText } from '../ui/textQuality';

export class CreditsScene extends Phaser.Scene {
  private fromEnding = false;

  constructor() {
    super('Credits');
  }

  init(data: { fromEnding?: boolean }) {
    this.fromEnding = data?.fromEnding ?? false;
  }

  create() {
    enableHighResolutionText(this);
    this.cameras.main.setBackgroundColor(0x0a0a0e);
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
}
