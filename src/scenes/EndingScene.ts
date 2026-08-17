import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../ui/dimensions';
import { content, session } from '../services';
import { hasKey, t } from '../engine/i18n';
import type { ArticleDefinition, EndingDefinition, EndingSequenceStep } from '../engine/types';
import { COLORS, FONT } from '../ui/format';
import { enableHighResolutionText } from '../ui/textQuality';

/** Plays an ending's presentation sequence: articles, removals, memorial, credits. */
export class EndingScene extends Phaser.Scene {
  private ending!: EndingDefinition;
  private stepIndex = 0;
  private articleC?: Phaser.GameObjects.Container;
  private currentArticle?: ArticleDefinition;
  private updateLineCount = 0;

  constructor() {
    super('Ending');
  }

  init(data: { endingId: string }) {
    const e = content.endings.find((x) => x.id === data.endingId);
    if (!e) throw new Error(`Unknown ending ${data.endingId}`);
    this.ending = e;
    this.stepIndex = 0;
  }

  create() {
    enableHighResolutionText(this);
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.runStep();
  }

  private next(delayMs = 0) {
    this.stepIndex += 1;
    if (delayMs > 0) this.time.delayedCall(delayMs, () => this.runStep());
    else this.runStep();
  }

  private runStep() {
    const steps = this.ending.presentation.sequence;
    if (this.stepIndex >= steps.length) {
      this.scene.start('Credits', { fromEnding: true });
      return;
    }
    const step = steps[this.stepIndex];
    this.executeStep(step);
  }

  private executeStep(step: EndingSequenceStep) {
    switch (step.type) {
      case 'article': {
        this.currentArticle = content.articles[step.articleId];
        this.updateLineCount = 0;
        this.renderArticle('normal');
        this.awaitTapOrDelay(2600);
        break;
      }
      case 'article_state': {
        this.renderArticleTransition(step.state);
        this.awaitTapOrDelay(2400);
        break;
      }
      case 'article_updates': {
        this.renderUpdates(step.updateKeys);
        this.awaitTapOrDelay(1200 + step.updateKeys.length * 1500);
        break;
      }
      case 'text': {
        this.clearArticle();
        const txt = this.add
          .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, t(step.textKey), {
            fontFamily: FONT, fontSize: '21px', color: COLORS.text,
            wordWrap: { width: 430 }, align: 'center', lineSpacing: 8,
          })
          .setOrigin(0.5)
          .setAlpha(0);
        this.tweens.add({ targets: txt, alpha: 1, duration: this.rm() ? 0 : 500 });
        this.time.delayedCall(2600, () => {
          this.tweens.add({
            targets: txt, alpha: 0, duration: this.rm() ? 0 : 500,
            onComplete: () => { txt.destroy(); this.next(); },
          });
        });
        break;
      }
      case 'stat_glitch': {
        this.clearArticle();
        this.playStatGlitch(step.stat, step.finalValue);
        break;
      }
      case 'delay': {
        this.next(step.milliseconds);
        break;
      }
      case 'memorial': {
        this.clearArticle();
        this.cameras.main.setBackgroundColor(0x000000);
        const memorialKey = hasKey('memorial.dedication.anonymous') ? 'memorial.dedication.anonymous' : 'ui.memorial';
        const text = this.add
          .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, t(memorialKey), {
            fontFamily: FONT, fontSize: '19px', color: '#cfcdc6',
            wordWrap: { width: 420 }, align: 'center', lineSpacing: 8,
          })
          .setOrigin(0.5)
          .setAlpha(0);
        this.tweens.add({ targets: text, alpha: 1, duration: this.rm() ? 0 : 1200 });
        this.time.delayedCall(4200, () => {
          this.tweens.add({
            targets: text, alpha: 0, duration: this.rm() ? 0 : 800,
            onComplete: () => { text.destroy(); this.next(); },
          });
        });
        break;
      }
      case 'credits': {
        this.scene.start('Credits', { fromEnding: true, endingId: this.ending.id });
        break;
      }
    }
  }

  // ------------------------------------------------------------ article view

  private clearArticle() {
    this.articleC?.destroy();
    this.articleC = undefined;
  }

  /** Dim newspaper key-scene art behind the article page, when it exists. */
  private addNewspaperBackdrop(c: Phaser.GameObjects.Container) {
    if (!this.textures.exists('scene:newspaper')) return;
    const img = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'scene:newspaper');
    const scale = Math.max(GAME_WIDTH / img.width, GAME_HEIGHT / img.height);
    img.setScale(scale).setAlpha(0.22);
    c.add(img);
  }

  private renderArticle(state: 'normal' | 'edited' | 'archived') {
    this.clearArticle();
    const a = this.currentArticle;
    const c = this.add.container(0, 0);
    this.addNewspaperBackdrop(c);
    const page = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 470, 720, 0xf1ede2).setStrokeStyle(1, 0xcccccc);
    c.add(page);

    const masthead = this.add.text(GAME_WIDTH / 2, 170, '— THE NATIONAL RECORD —', {
      fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '15px', color: '#4a4a4a', letterSpacing: 2,
    }).setOrigin(0.5);
    c.add(masthead);

    if (a) {
      const headline = this.add.text(GAME_WIDTH / 2, 230, t(a.headlineKey), {
        fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '26px', color: '#191919',
        wordWrap: { width: 410 }, align: 'center', fontStyle: 'bold',
      }).setOrigin(0.5, 0);
      c.add(headline);

      let y = 230 + headline.height + 30;
      for (const bodyKey of a.bodyKeys) {
        const p = this.add.text(65, y, t(bodyKey), {
          fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '16px', color: '#2c2c2c',
          wordWrap: { width: 410 }, lineSpacing: 5,
        });
        c.add(p);
        y += p.height + 14;
        if (y > GAME_HEIGHT / 2 + 280) break;
      }
      if (state === 'archived') {
        const stamp = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 300, 'ARCHIVED', {
          fontFamily: FONT, fontSize: '15px', color: '#8a2020', letterSpacing: 4,
        }).setOrigin(0.5).setAngle(-8);
        c.add(stamp);
      }
    }
    this.articleC = c;
    if (!this.rm()) {
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, duration: 400 });
    }
  }

  private renderArticleTransition(state: 'normal' | 'edited' | 'removed' | 'unavailable' | 'archived') {
    if (state === 'normal' || state === 'edited' || state === 'archived') {
      this.renderArticle(state === 'normal' ? 'normal' : state);
      return;
    }
    // Reload shimmer, then the vanished-article page.
    this.clearArticle();
    const c = this.add.container(0, 0);
    this.addNewspaperBackdrop(c);
    const page = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 470, 720, 0xf6f4ee).setStrokeStyle(1, 0xcccccc);
    const loading = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, t('ui.article.loading'), {
      fontFamily: FONT, fontSize: '16px', color: '#7a7a7a',
    }).setOrigin(0.5);
    c.add([page, loading]);
    this.articleC = c;
    this.time.delayedCall(this.rm() ? 100 : 900, () => {
      loading.setText(state === 'removed' ? t('ui.article.removed') : t('ui.article.unavailable'));
      loading.setWordWrapWidth(380);
      loading.setAlign('center');
    });
  }

  private renderUpdates(updateKeys: string[]) {
    // Appends dated update lines beneath the current article (positive endings:
    // the record persists and keeps growing).
    if (!this.articleC) this.renderArticle('normal');
    const baseY = GAME_HEIGHT / 2 + 150;
    updateKeys.forEach((key, i) => {
      this.time.delayedCall(600 + i * 1500, () => {
        const line = this.add.text(65, baseY + (this.updateLineCount + i) * 46, t(key), {
          fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '15px', color: '#20406a',
          wordWrap: { width: 410 },
        }).setAlpha(0);
        this.articleC?.add(line);
        this.tweens.add({ targets: line, alpha: 1, duration: this.rm() ? 0 : 350 });
      });
    });
    this.updateLineCount += updateKeys.length;
  }

  private playStatGlitch(stat: string, finalValue: number) {
    const label = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, stat.toUpperCase(), {
      fontFamily: FONT, fontSize: '24px', color: COLORS.text, letterSpacing: 6,
    }).setOrigin(0.5);
    const startValue = stat === 'power' ? session.state?.stats.power ?? 90 : 90;
    const barBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 360, 22, COLORS.barBg);
    const bar = this.add.rectangle(GAME_WIDTH / 2 - 180, GAME_HEIGHT / 2, (startValue / 100) * 360, 22, COLORS.power).setOrigin(0, 0.5);
    const value = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, String(Math.round(startValue)), {
      fontFamily: FONT, fontSize: '28px', color: COLORS.text,
    }).setOrigin(0.5);

    this.time.delayedCall(1600, () => {
      if (!this.rm()) this.cameras.main.shake(180, 0.01);
      bar.width = (finalValue / 100) * 360;
      value.setText(String(finalValue));
    });
    this.time.delayedCall(3400, () => {
      [label, barBg, bar, value].forEach((o) => o.destroy());
      this.next();
    });
  }

  private awaitTapOrDelay(ms: number) {
    let advanced = false;
    const go = () => {
      if (advanced) return;
      advanced = true;
      this.input.off('pointerdown', go);
      this.next();
    };
    this.time.delayedCall(ms, go);
    this.time.delayedCall(800, () => this.input.once('pointerdown', go));
  }

  private rm(): boolean {
    return session.meta.settings?.reducedMotion ?? false;
  }
}
