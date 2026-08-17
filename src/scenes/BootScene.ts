import Phaser from 'phaser';
import { content } from '../services';

/** The only scene illustrations that exist: key narrative moments. */
export const KEY_SCENES = [
  'villa_evening',
  'villa_toast',
  'villa_glass',
  'villa_driveway',
  'night_road',
  'headlights',
  'black_road',
  'newspaper',
] as const;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Card art = the man the player is talking to; scenes only for key moments.
    for (const id of Object.keys(content.characters)) {
      this.load.image(`portrait:${id}`, `art/portraits/${id}.webp`);
    }
    for (const id of KEY_SCENES) {
      this.load.image(`scene:${id}`, `art/scenes/${id}.webp`);
    }
    for (const id of ['standing', 'power', 'trust'] as const) {
      this.load.image(`hud:${id}`, `art/ui/${id}.png`);
    }
  }

  create() {
    this.scene.start('MainMenu');
  }
}
