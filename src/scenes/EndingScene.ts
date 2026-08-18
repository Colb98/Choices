import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../ui/dimensions';
import { content, engine, session } from '../services';
import { t } from '../engine/i18n';
import type { ArticleDefinition, EndingDefinition, EndingSequenceStep } from '../engine/types';
import { COLORS, FONT } from '../ui/format';
import { enableHighResolutionText } from '../ui/textQuality';
import { audio } from '../audio';

const MEMORIAL_TEXT = 'In memory of the victims of the May 30, 2025 traffic collision.';

/** Plays an ending's presentation sequence: articles, removals, memorial, credits. */
export class EndingScene extends Phaser.Scene {
  private ending!: EndingDefinition;
  private stepIndex = 0;
  private articleC?: Phaser.GameObjects.Container;
  private currentArticle?: ArticleDefinition;
  private updateLineCount = 0;
  private continuePrompt?: Phaser.GameObjects.Text;
  private advanceCleanup?: () => void;

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
    audio.playMusic(this, 'aftermath');
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
        audio.playSfx(this, 'article');
        this.renderArticle('normal');
        this.awaitInput(500);
        break;
      }
      case 'article_state': {
        this.renderArticleTransition(step.state);
        this.awaitInput(this.rm() ? 150 : 1050);
        break;
      }
      case 'article_updates': {
        this.renderUpdates(step.updateKeys);
        this.awaitInput(650 + step.updateKeys.length * 1500);
        break;
      }
      case 'ending_card': {
        this.renderEndingCard(step);
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
        this.awaitInput(this.rm() ? 150 : 550, () => {
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
        this.renderMemorial();
        break;
      }
      case 'record_ledger': {
        this.renderRecordLedger();
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

  private renderEndingCard(step: Extract<EndingSequenceStep, { type: 'ending_card' }>) {
    this.clearArticle();
    this.cameras.main.setBackgroundColor(COLORS.bg);
    const c = this.add.container(0, 0);
    const cardX = GAME_WIDTH / 2;
    const cardY = 340;
    const cardW = 440;
    const cardH = 470;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.42);
    shadow.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2 + 10, cardW, cardH, 26);
    const image = this.add.image(cardX, cardY, `ending:${step.artId}`);
    const scale = Math.max(cardW / image.width, cardH / image.height);
    image.setScale(scale);
    const maskG = this.make.graphics({}, false);
    maskG.fillStyle(0xffffff);
    maskG.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 26);
    image.setMask(maskG.createGeometryMask());

    const title = this.add.text(cardX, 605, t(step.titleKey), {
      fontFamily: FONT, fontSize: '28px', color: COLORS.accent,
      fontStyle: 'bold', align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5, 0);
    const narrative = this.add.text(cardX, 655, t(step.textKey), {
      fontFamily: FONT, fontSize: '18px', color: COLORS.text,
      align: 'center', wordWrap: { width: 425 }, lineSpacing: 6,
    }).setOrigin(0.5, 0);
    c.add([shadow, image, title, narrative]);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: this.rm() ? 0 : 550 });

    this.awaitInput(this.rm() ? 150 : 600, () => {
      this.tweens.add({
        targets: c, alpha: 0, duration: this.rm() ? 0 : 450,
        onComplete: () => {
          c.destroy();
          maskG.destroy();
          this.next();
        },
      });
    });
  }

  private renderMemorial() {
    this.clearArticle();
    this.cameras.main.setBackgroundColor(0x08070a);
    const c = this.add.container(0, 0);
    const imageX = GAME_WIDTH / 2;
    const imageY = 340;
    const imageW = 440;
    const imageH = 470;

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.45);
    shadow.fillRoundedRect(imageX - imageW / 2, imageY - imageH / 2 + 10, imageW, imageH, 26);
    const image = this.add.image(imageX, imageY, 'scene:memorial_tree');
    image.setScale(Math.max(imageW / image.width, imageH / image.height));
    const maskG = this.make.graphics({}, false);
    maskG.fillStyle(0xffffff);
    maskG.fillRoundedRect(imageX - imageW / 2, imageY - imageH / 2, imageW, imageH, 26);
    image.setMask(maskG.createGeometryMask());

    const dedication = this.add.text(GAME_WIDTH / 2, 625, MEMORIAL_TEXT, {
      fontFamily: FONT, fontSize: '21px', color: '#efe7d8',
      wordWrap: { width: 420 }, align: 'center', lineSpacing: 8,
    }).setOrigin(0.5, 0);
    c.add([shadow, image, dedication]);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: this.rm() ? 0 : 1200 });

    this.awaitInput(this.rm() ? 150 : 1250, () => {
      this.tweens.add({
        targets: c, alpha: 0, duration: this.rm() ? 0 : 800,
        onComplete: () => {
          c.destroy();
          maskG.destroy();
          this.next();
        },
      });
    });
  }

  /**
   * ENGINE-REQ-05 — The Record. Every promise the player ever made, in their
   * own words, with its fate — revealed one at a time, the way a lock
   * flashback plays: the pledge, then a cut to the exact card and the exact
   * swipe that broke it (or kept it when it cost something), then the stamp.
   * No commentary, no score, no total; identical across endings. A summary
   * list closes it. An empty Record prints the cynic's single cold line.
   */
  private renderRecordLedger() {
    this.clearArticle();
    this.cameras.main.setBackgroundColor(0x08070a);
    const lines = session.state ? engine.promiseLedger(session.state) : [];
    const rm = this.rm();

    const header = this.add.text(GAME_WIDTH / 2, 120, t('record.header'), {
      fontFamily: FONT, fontSize: '16px', color: COLORS.accent, letterSpacing: 5,
    }).setOrigin(0.5, 0).setAlpha(0);
    this.tweens.add({ targets: header, alpha: 1, duration: rm ? 0 : 700 });

    const statusKey = (status: string) =>
      status === 'broken' ? 'record.broken'
      : status === 'honored_under_pressure' ? 'record.kept_costly'
      : 'record.kept';
    const statusColor = (status: string) =>
      status === 'broken' ? '#d08a8a' : status === 'honored_under_pressure' ? COLORS.accent : '#9ac48a';

    if (lines.length === 0) {
      const empty = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, t('record.empty'), {
        fontFamily: FONT, fontSize: '21px', color: COLORS.text, fontStyle: 'italic',
        wordWrap: { width: 420 }, align: 'center', lineSpacing: 8,
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: empty, alpha: 1, duration: rm ? 0 : 900, delay: rm ? 0 : 400 });
      this.awaitInput(rm ? 150 : 2200, () => {
        this.tweens.add({
          targets: [header, empty], alpha: 0, duration: rm ? 0 : 600,
          onComplete: () => { header.destroy(); empty.destroy(); this.next(); },
        });
      });
      return;
    }

    const flashRect = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0).setDepth(5);
    let index = 0;

    const showSummary = () => {
      const c = this.add.container(0, 0);
      let y = 210;
      for (const line of lines) {
        const pledge = this.add.text(50, y, `“${t(line.pledgeKey)}”`, {
          fontFamily: FONT, fontSize: '18px', color: COLORS.text, fontStyle: 'italic',
          wordWrap: { width: 440 }, lineSpacing: 5,
        }).setOrigin(0, 0);
        const fate = this.add.text(GAME_WIDTH - 50, y + pledge.height + 4, `— ${t(statusKey(line.status))}`, {
          fontFamily: FONT, fontSize: '13px', color: statusColor(line.status), letterSpacing: 1,
        }).setOrigin(1, 0);
        c.add([pledge, fate]);
        y += pledge.height + fate.height + 26;
      }
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, duration: rm ? 0 : 700 });
      this.awaitInput(rm ? 150 : 1400, () => {
        this.tweens.add({
          targets: [c, header], alpha: 0, duration: rm ? 0 : 600,
          onComplete: () => { c.destroy(); header.destroy(); flashRect.destroy(); this.next(); },
        });
      });
    };

    const showPromise = () => {
      const line = lines[index];
      const c = this.add.container(0, 0);
      const objects: Phaser.GameObjects.GameObject[] = [];

      const said = this.add.text(GAME_WIDTH / 2, 235, t('promise.witness.prefix'), {
        fontFamily: FONT, fontSize: '14px', color: COLORS.accent, letterSpacing: 4,
      }).setOrigin(0.5, 0);
      const pledge = this.add.text(GAME_WIDTH / 2, 268, t(line.pledgeKey), {
        fontFamily: FONT, fontSize: '23px', color: COLORS.text, fontStyle: 'italic',
        wordWrap: { width: 430 }, align: 'center', lineSpacing: 8,
      }).setOrigin(0.5, 0);
      c.add([said, pledge]);
      c.setAlpha(0);
      this.tweens.add({ targets: c, alpha: 1, duration: rm ? 0 : 500 });

      let stampY = pledge.y + pledge.height + 40;
      const reveal: Phaser.GameObjects.Text[] = [];

      const stamp = () => {
        const fate = this.add.text(GAME_WIDTH / 2, stampY, `— ${t(statusKey(line.status))} —`, {
          fontFamily: FONT, fontSize: '17px', color: statusColor(line.status), letterSpacing: 2,
        }).setOrigin(0.5, 0).setAlpha(0);
        objects.push(fate);
        this.tweens.add({ targets: fate, alpha: 1, duration: rm ? 0 : 400 });
        if (line.status === 'broken' && !rm) this.cameras.main.shake(140, 0.004);
        this.awaitInput(rm ? 150 : 1300, () => {
          this.tweens.add({
            targets: [c, ...objects], alpha: 0, duration: rm ? 0 : 450,
            onComplete: () => {
              c.destroy();
              objects.forEach((o) => o.destroy());
              index += 1;
              if (index < lines.length) showPromise();
              else showSummary();
            },
          });
        });
      };

      // The moment: the card as it read then, and the swipe — a flashback.
      const moment = line.moment;
      if (moment && (line.status === 'broken' || line.status === 'honored_under_pressure')) {
        this.time.delayedCall(rm ? 200 : 1100, () => {
          audio.playSfx(this, 'flash');
          if (!rm) {
            flashRect.fillAlpha = 0.85;
            this.tweens.add({ targets: flashRect, fillAlpha: 0, duration: 200 });
          }
          const body = t(moment.cardTextKey);
          const excerpt = body.length > 190 ? body.slice(0, 187).trimEnd() + '…' : body;
          let y = pledge.y + pledge.height + 46;
          const memory = this.add.text(GAME_WIDTH / 2, y, excerpt, {
            fontFamily: FONT, fontSize: '17px', color: COLORS.textDim,
            wordWrap: { width: 430 }, align: 'center', lineSpacing: 5,
          }).setOrigin(0.5, 0);
          y += memory.height + 22;
          const chose = this.add.text(GAME_WIDTH / 2, y, t('ui.flashback.you_chose'), {
            fontFamily: FONT, fontSize: '13px', color: COLORS.accent, letterSpacing: 3,
          }).setOrigin(0.5, 0);
          y += chose.height + 8;
          const choiceText = this.add.text(GAME_WIDTH / 2, y, moment.choiceTextKey ? t(moment.choiceTextKey) : '', {
            fontFamily: FONT, fontSize: '21px', color: COLORS.text, fontStyle: 'bold',
            wordWrap: { width: 420 }, align: 'center',
          }).setOrigin(0.5, 0);
          y += choiceText.height + 30;
          stampY = y;
          reveal.push(memory, chose, choiceText);
          objects.push(memory, chose, choiceText);
          if (!rm) {
            reveal.forEach((o) => o.setAlpha(0));
            this.tweens.add({ targets: reveal, alpha: 1, duration: 350 });
          }
          this.time.delayedCall(rm ? 100 : 900, stamp);
        });
      } else {
        this.time.delayedCall(rm ? 150 : 900, stamp);
      }
    };

    this.time.delayedCall(rm ? 0 : 500, showPromise);
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
      audio.playSfx(this, 'removed');
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

  private awaitInput(minDelayMs: number, onAdvance = () => this.next()) {
    this.advanceCleanup?.();
    let advanced = false;
    let armed = false;
    const go = () => {
      if (!armed || advanced) return;
      advanced = true;
      cleanup();
      onAdvance();
    };
    const cleanup = () => {
      this.input.off('pointerdown', go);
      this.input.keyboard?.off('keydown-SPACE', go);
      this.input.keyboard?.off('keydown-ENTER', go);
      this.continuePrompt?.destroy();
      this.continuePrompt = undefined;
      this.advanceCleanup = undefined;
    };
    this.advanceCleanup = cleanup;
    this.time.delayedCall(minDelayMs, () => {
      if (advanced) return;
      armed = true;
      this.continuePrompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 48, t('ui.continue_prompt'), {
        fontFamily: FONT, fontSize: '14px', color: COLORS.textDim, letterSpacing: 1,
      }).setOrigin(0.5).setDepth(100).setAlpha(0);
      this.tweens.add({ targets: this.continuePrompt, alpha: 0.82, duration: this.rm() ? 0 : 250 });
      this.input.on('pointerdown', go);
      this.input.keyboard?.on('keydown-SPACE', go);
      this.input.keyboard?.on('keydown-ENTER', go);
    });
  }

  private rm(): boolean {
    return session.meta.settings?.reducedMotion ?? false;
  }
}
