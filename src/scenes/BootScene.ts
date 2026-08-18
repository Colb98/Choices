import Phaser from 'phaser';
import { content } from '../services';
import { AUDIO_ASSETS } from '../audio';

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
  'memorial_tree',
] as const;

export const ENDING_ART_IDS = [
  'ending_bankrupt',
  'ending_collapse',
  'ending_untouchable',
  'ending_protected',
  'ending_scapegoat',
] as const;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Card art = the character the player is talking to; scenes only for key moments.
    for (const id of Object.keys(content.characters)) {
      this.load.image(`portrait:${id}`, `art/portraits/${id}.webp`);
    }
    for (const id of KEY_SCENES) {
      this.load.image(`scene:${id}`, `art/scenes/${id}.webp`);
    }
    for (const id of ENDING_ART_IDS) {
      this.load.image(`ending:${id}`, `art/endings/${id}.webp`);
    }
    for (const id of ['standing', 'power', 'trust'] as const) {
      this.load.image(`hud:${id}`, `art/ui/${id}.png`);
    }
    for (const [id, path] of Object.entries(AUDIO_ASSETS.music)) {
      this.load.audio(`music:${id}`, path);
    }
    for (const [id, path] of Object.entries(AUDIO_ASSETS.sfx)) {
      this.load.audio(`sfx:${id}`, path);
    }
  }

  create() {
    this.scene.start('MainMenu');
  }
}
