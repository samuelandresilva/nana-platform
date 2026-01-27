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

        this.load.spritesheet('player', 'assets/sprites/nana_walk.png', {
            frameWidth: 444,
            frameHeight: 773
        });

        this.load.spritesheet('crouch', 'assets/sprites/nana_crouch.png', {
            frameWidth: 444,
            frameHeight: 773
        });

        this.load.spritesheet('jump', 'assets/sprites/nana_jump.png', {
            frameWidth: 444,
            frameHeight: 773
        });
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        this.physics.world.setBounds(0, 0, w, h);

        this.initiateAnimations();
        this.createSky(w, h);
        this.createClouds(w, h);
        this.createGround(w, h);
        this.createPlayer();

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        this.animateClouds(delta);
        this.updatePlayerMovement();
    }

    initiateAnimations() {
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'crouchIdle',
            frames: [{ key: 'crouch', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'crouchWalk',
            frames: this.anims.generateFrameNumbers('crouch', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [{ key: 'jump', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

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

        this.ground = this.add.rectangle(
            w / 2,
            h - groundHeight / 2,
            w,
            groundHeight,
            0x444444
        );

        this.ground.setFillStyle(0x000000, 0);

        this.physics.add.existing(this.ground, true);

        this.add.tileSprite(
            w / 2,
            h - groundHeight / 2,
            w,
            groundHeight,
            'groundTile'
        );
    }

    createPlayer() {
        this.player = this.physics.add.sprite(100, 100, 'player');

        this.player.setScale(0.2);
        this.player.body.setSize(
            this.player.width * 0.35,
            this.player.height * 0.6,
            true
        );

        this.player.body.setOffset(
            this.player.width * 0.325,
            this.player.height * 0.35
        );
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(900);
        this.physics.add.collider(this.player, this.ground);

        this.player.play('idle');
    }

    updatePlayerMovement() {
        const down = this.cursors.down.isDown;
        const left = this.cursors.left.isDown;
        const right = this.cursors.right.isDown;
        const onGround = this.player.body.blocked.down;

        const speed = down ? 100 : 200;

        // --- CROUCH ---
        if (down) {
            this.player.setVelocityX(0);

            if (left) {
                this.player.setVelocityX(-speed);
                this.player.setFlipX(true);
                this.player.play('crouchWalk', true);
            } else if (right) {
                this.player.setVelocityX(speed);
                this.player.setFlipX(false);
                this.player.play('crouchWalk', true);
            } else {
                this.player.play('crouchIdle', true);
            }
            return;
        }

        // --- PULO ---
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround) {
            this.player.setVelocityY(-720);
            this.player.play('jump', true);
            return;
        }

        if (!onGround) {
            this.player.play('jump', true);
            return;
        }

        // --- MOVIMENTO NORMAL ---
        this.player.setVelocityX(0);

        if (left) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            this.player.play('walk', true);
        } else if (right) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            this.player.play('walk', true);
        } else {
            this.player.play('idle', true);
        }
    }
}
