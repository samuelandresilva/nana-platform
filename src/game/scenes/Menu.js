import { Scene } from 'phaser';

export class Menu extends Scene {
    constructor() {
        super('Menu');
    }

    preload() {
        this.load.image('menu_bg', 'assets/bg/menu.png');
        this.load.audio('bgm_menu', 'assets/audio/music/bgm_menu.mp3');
    }

    create() {
        this.#createBackground();
        this.#createMusic();

        this.input.keyboard.once('keydown-SPACE', () => {
            this.#stopMusic();
            this.scene.start('Game');
        });
    }

    #createBackground() {
        const { width, height } = this.scale;
        const bg = this.add.image(width / 2, height / 2, 'menu_bg');
        const scale = Math.max(width / bg.width, height / bg.height);
        bg.setScale(scale);
    }

    #createMusic() {
        this.sound.stopByKey('bgm_menu');
        this.bgm = this.sound.add('bgm_menu', { loop: true, volume: 0.6 });
        this.bgm.play();
    }

    #stopMusic() {
        if (this.bgm?.isPlaying) {
            this.bgm.stop();
        } else {
            this.sound.stopByKey('bgm_menu');
        }
    }
}
