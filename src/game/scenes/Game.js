import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.image('skyTile', 'assets/tiles/sky.png');
        this.load.image('cloud1', 'assets/tiles/cloud1.png');
        this.load.image('cloud2', 'assets/tiles/cloud2.png');
        this.load.image('cloud3', 'assets/tiles/cloud3.png');
        this.load.image('groundTile', 'assets/tiles/ground.png');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        this.physics.world.setBounds(0, 0, w, h);

        this.createSky(w, h);
        this.createClouds(w, h);
        this.createGround(w, h);
    }

    update(time, delta) {
        this.animateClouds(delta);
    }

    createSky(w, h) {
        this.add.tileSprite(
            w / 2,
            h / 2,
            w,
            h,
            'skyTile'
        );
    }

    createClouds(w, h) {
        this.cloudKeys = ['cloud1', 'cloud2', 'cloud3'];

        this.clouds = [];

        const count = 5;

        for (let i = 0; i < count; i++) {
            const key = Phaser.Utils.Array.GetRandom(this.cloudKeys);

            const cloud = this.add.image(
                Phaser.Math.Between(0, w),
                Phaser.Math.Between(60, 220),
                key
            );

            const speed = 60;
            this.clouds.push({ cloud, speed });
        }
    }

    animateClouds(delta) {
        if (!this.clouds) return;

        const dt = Math.min(delta, 33) / 1000;
        const w = this.scale.width;

        for (const item of this.clouds) {
            const cloud = item.cloud;

            cloud.x -= item.speed * dt;

            const half = Math.ceil(cloud.displayWidth / 2);

            if (cloud.x < -half) {
                cloud.x = w + half;
                cloud.y = Phaser.Math.Between(60, 220);
                item.speed = 60;
            }
        }
    }

    createGround(w, h) {
        const groundHeight = 70;

        const ground = this.add.rectangle(
            w / 2,
            h - groundHeight / 2,
            w,
            groundHeight,
            0x444444
        );

        ground.setFillStyle(0x000000, 0);

        this.physics.add.existing(ground, true);

        this.add.tileSprite(
            w / 2,
            h - groundHeight / 2,
            w,
            groundHeight,
            'groundTile'
        );
    }
}
