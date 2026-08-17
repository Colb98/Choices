import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../ui/dimensions';
import { engine, persistLanguage, saves, session } from '../services';
import { SUPPORTED_LANGUAGES, getLanguage, setLanguage, t } from '../engine/i18n';
import { COLORS, FONT } from '../ui/format';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.buildMenu();
  }

  private buildMenu() {
    this.children.removeAll();
    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, 190, t('ui.title'), {
        fontFamily: FONT,
        fontSize: '54px',
        color: COLORS.text,
        letterSpacing: 10,
      })
      .setOrigin(0.5);
    this.add
      .text(cx, 245, t('ui.subtitle'), {
        fontFamily: FONT,
        fontSize: '20px',
        color: COLORS.textDim,
      })
      .setOrigin(0.5);

    const hasSave = !!saves.loadRun();
    let y = 420;

    if (hasSave) {
      this.menuButton(cx, y, t('ui.menu.continue'), () => this.continueRun());
      y += 78;
    }
    this.menuButton(cx, y, t('ui.menu.new_game'), () => this.newGame(hasSave));
    y += 78;
    this.menuButton(cx, y, t('ui.menu.credits'), () => this.scene.start('Credits'));
    y += 78;

    // Language selector
    const lang = getLanguage();
    const label = SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.label ?? lang;
    this.menuButton(cx, y, `${t('ui.menu.language')}: ${label}`, () => {
      const idx = SUPPORTED_LANGUAGES.findIndex((l) => l.code === getLanguage());
      const next = SUPPORTED_LANGUAGES[(idx + 1) % SUPPORTED_LANGUAGES.length];
      setLanguage(next.code);
      persistLanguage(next.code);
      this.buildMenu();
    }, true);

    // Hidden quote: small, static, unhighlighted, only after first completion.
    if (session.meta.quoteUnlocked) {
      this.add
        .text(cx, GAME_HEIGHT - 60, t('ui.menu.quote'), {
          fontFamily: FONT,
          fontSize: '14px',
          color: COLORS.textDim,
          fontStyle: 'italic',
        })
        .setOrigin(0.5);
    }
  }

  private menuButton(x: number, y: number, label: string, onClick: () => void, small = false) {
    const txt = this.add
      .text(x, y, label, {
        fontFamily: FONT,
        fontSize: small ? '18px' : '26px',
        color: COLORS.text,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    txt.on('pointerover', () => txt.setColor(COLORS.accent));
    txt.on('pointerout', () => txt.setColor(COLORS.text));
    txt.on('pointerdown', onClick);
    return txt;
  }

  private continueRun() {
    const save = saves.loadRun();
    if (!save) return this.buildMenu();
    setLanguage(save.language ?? getLanguage());
    session.state = save.state;
    this.scene.start('Game');
  }

  private newGame(hasSave: boolean) {
    if (hasSave) {
      this.confirmNewGame();
      return;
    }
    this.startFresh();
  }

  private confirmNewGame() {
    const cx = GAME_WIDTH / 2;
    const overlay = this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75).setInteractive();
    const panel = this.add.rectangle(cx, GAME_HEIGHT / 2, 440, 220, COLORS.bgPanel).setStrokeStyle(1, COLORS.cardBorder);
    const msg = this.add
      .text(cx, GAME_HEIGHT / 2 - 50, t('ui.menu.confirm_new'), {
        fontFamily: FONT, fontSize: '20px', color: COLORS.text, wordWrap: { width: 380 }, align: 'center',
      })
      .setOrigin(0.5);
    const yes = this.menuButton(cx, GAME_HEIGHT / 2 + 20, t('ui.menu.confirm_yes'), () => this.startFresh(), true);
    const no = this.menuButton(cx, GAME_HEIGHT / 2 + 70, t('ui.menu.confirm_no'), () => {
      [overlay, panel, msg, yes, no].forEach((o) => o.destroy());
    }, true);
  }

  private startFresh() {
    saves.clearRun();
    session.state = engine.newRun();
    saves.saveRun(session.state, getLanguage());
    this.scene.start('Game');
  }
}
