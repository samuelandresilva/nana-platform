import { Scene } from 'phaser';

export class Congratilations extends Scene {
    constructor() {
        super('Congratilations');
    }

    create() {
        const { width, height } = this.scale;

        this.cameras.main.setBackgroundColor('#1f2a44');

        const panel = this.add.rectangle(
            width / 2,
            height / 2,
            width * 0.82,
            height * 0.52,
            0x0f172a,
            0.88
        );
        panel.setStrokeStyle(4, 0xf4d35e, 1);

        const titleStyle = {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#f8fafc',
            stroke: '#000000',
            strokeThickness: 6
        };

        const subtitleStyle = {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#e2e8f0',
            stroke: '#000000',
            strokeThickness: 4
        };

        const hintStyle = {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#f4d35e',
            stroke: '#000000',
            strokeThickness: 4
        };

        this.add.text(width / 2, height / 2 - 80, 'Congratilations!', titleStyle).setOrigin(0.5);
        this.add.text(width / 2, height / 2 - 10, 'Voce concluiu todas as fases', subtitleStyle).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 30, 'É... só tem duas...', subtitleStyle).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 100, 'Pressione ESPACO para voltar ao menu', hintStyle).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Menu');
        });
    }
}
