import Phaser from 'phaser';
import { session } from './services';

export const AUDIO_ASSETS = {
  music: {
    menu: 'audio/bgm/menu.ogg',
    main: 'audio/bgm/main.ogg',
    aftermath: 'audio/bgm/aftermath.ogg',
  },
  sfx: {
    article: 'audio/sfx/article.ogg',
    choicePaper: 'audio/sfx/choice_paper.ogg',
    crash: 'audio/sfx/crash.ogg',
    flash: 'audio/sfx/flash.ogg',
    lock: 'audio/sfx/lock.ogg',
    removed: 'audio/sfx/removed.ogg',
  },
} as const;

export type MusicId = keyof typeof AUDIO_ASSETS.music;
export type SfxId = keyof typeof AUDIO_ASSETS.sfx;

const musicKey = (id: MusicId) => `music:${id}`;
const sfxKey = (id: SfxId) => `sfx:${id}`;

function clampVolume(value: number | undefined, fallback: number): number {
  return Phaser.Math.Clamp(value ?? fallback, 0, 1);
}

class AudioController {
  private currentMusic?: Phaser.Sound.BaseSound;
  private currentMusicId?: MusicId;

  playMusic(scene: Phaser.Scene, id: MusicId, fadeMs = 650) {
    const volume = clampVolume(session.meta.settings?.musicVolume, 0.45);

    if (this.currentMusicId === id && this.currentMusic) {
      if (!this.currentMusic.isPlaying) this.currentMusic.play({ loop: true, volume });
      else (this.currentMusic as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).setVolume(volume);
      return;
    }

    const previous = this.currentMusic;
    const next = scene.sound.add(musicKey(id), {
      loop: true,
      volume: fadeMs > 0 ? 0 : volume,
    });
    this.currentMusic = next;
    this.currentMusicId = id;
    next.play();

    if (fadeMs <= 0) {
      previous?.stop();
      previous?.destroy();
      return;
    }

    scene.tweens.add({
      targets: next,
      volume,
      duration: fadeMs,
      ease: 'Sine.out',
    });

    if (previous) {
      scene.tweens.add({
        targets: previous,
        volume: 0,
        duration: fadeMs,
        ease: 'Sine.in',
        onComplete: () => {
          previous.stop();
          previous.destroy();
        },
      });
    }
  }

  playGameMusic(scene: Phaser.Scene, actId: string) {
    this.playMusic(scene, actId === 'aftermath' ? 'aftermath' : 'main');
  }

  playSfx(scene: Phaser.Scene, id: SfxId, volumeScale = 1) {
    const volume = clampVolume(session.meta.settings?.sfxVolume, 0.75) * volumeScale;
    if (volume <= 0 || !scene.cache.audio.exists(sfxKey(id))) return;
    scene.sound.play(sfxKey(id), { volume: Phaser.Math.Clamp(volume, 0, 1) });
  }
}

export const audio = new AudioController();
