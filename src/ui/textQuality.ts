import Phaser from 'phaser';

/**
 * Phaser Text defaults to a 1x internal canvas even on high-DPI displays.
 * Rendering text textures at 2x keeps glyph edges crisp when the fixed
 * portrait playfield is fitted to a phone or a non-integer desktop size.
 */
export function enableHighResolutionText(scene: Phaser.Scene): void {
  const resolution = 2;
  const apply = (gameObject: Phaser.GameObjects.GameObject) => {
    if (gameObject instanceof Phaser.GameObjects.Text) {
      gameObject.setResolution(resolution);
    }
  };

  scene.sys.displayList.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, apply);
  scene.children.list.forEach(apply);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.sys.displayList.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, apply);
  });
}
