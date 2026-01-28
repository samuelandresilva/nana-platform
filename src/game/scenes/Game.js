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

        this.load.image('block', 'assets/tiles/block.png');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        this.coyoteTimeMs = 120;
        this.coyoteTimerMs = 0;

        this.worldWidth = w * 3;
        this.worldHeight = h;
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        this.initiateAnimations();
        this.createSky();
        this.createClouds();
        this.createGround();
        this.createObstacles();
        this.createPlayer();
        this.configureCamera();

        this.physics.add.collider(this.player, this.obstacles);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        this.animateClouds(delta);
        this.updateCoyoteTimer(delta);
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

    createSky() {
        this.add.tileSprite(
            this.worldWidth / 2,
            this.worldHeight / 2,
            this.worldWidth,
            this.worldHeight,
            'skyTile'
        );
    }

    createClouds() {
        this.cloudKeys = ['cloud1', 'cloud2', 'cloud3'];
        this.clouds = [];

        for (let i = 0; i < 20; i++) {
            const key = Phaser.Utils.Array.GetRandom(this.cloudKeys);
            const cloud = this.add.image(
                Phaser.Math.Between(0, this.worldWidth),
                Phaser.Math.Between(60, 220),
                key
            );

            this.clouds.push({ cloud, speed: 60 });
        }
    }

    animateClouds(delta) {
        const dt = Math.min(delta, 33) / 1000;

        for (const item of this.clouds) {
            const cloud = item.cloud;
            cloud.x -= item.speed * dt;

            const half = cloud.displayWidth / 2;
            if (cloud.x < -half) {
                cloud.x = this.worldWidth + half;
                cloud.y = Phaser.Math.Between(60, 220);
            }
        }
    }

    createGround() {
        const groundHeight = 70;
        const groundWidth = this.worldWidth;

        this.ground = this.add.rectangle(
            groundWidth / 2,
            this.worldHeight - groundHeight / 2,
            groundWidth,
            groundHeight,
            0x000000,
            0
        );

        this.physics.add.existing(this.ground, true);

        this.add.tileSprite(
            groundWidth / 2,
            this.worldHeight - groundHeight / 2,
            groundWidth,
            groundHeight,
            'groundTile'
        );
    }

    createObstacles() {
        this.obstacles = this.physics.add.staticGroup();

        this.addObstacle(600, 550, 520, 40);
        this.addObstacle(850, 410, 180, 40);
        this.addObstacle(1150, 400, 180, 40);
        this.addObstacle(1400, 540, 140, 40);
    }

    addObstacle(x, y, width, height) {
        const body = this.add.rectangle(x, y, width, height, 0x000000, 0);
        this.physics.add.existing(body, true);
        this.obstacles.add(body);

        this.add.tileSprite(x, y, width, height, 'block').setDepth(10);
    }

    createPlayer() {
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.player.setDepth(999);
        this.player.setScale(0.2);
        this.player.setOrigin(0.5, 1);
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(900);

        this.physics.add.collider(this.player, this.ground);

        this.standHitbox = {
            width: this.player.width * 0.6,
            height: this.player.height * 0.7,
            offsetX: this.player.width * 0.225,
            offsetY: this.player.height * 0.25
        };

        this.crouchHitbox = {
            width: this.player.width * 0.6,
            height: this.player.height * 0.45,
            offsetX: this.player.width * 0.225,
            offsetY: this.player.height * 0.5
        };

        this.isCrouching = false;
        this.applyHitbox(this.standHitbox);

        this.player.play('idle');
    }

    applyHitbox(cfg) {
        this.player.body.setSize(cfg.width, cfg.height, true);
        this.player.body.setOffset(cfg.offsetX, cfg.offsetY);
    }

    enterCrouch() {
        if (this.isCrouching) return;
        this.isCrouching = true;
        this.applyHitbox(this.crouchHitbox);
    }

    exitCrouch() {
        if (!this.isCrouching) return;
        if (!this.canStandUp()) return;
        this.isCrouching = false;
        this.applyHitbox(this.standHitbox);
    }

    canStandUp() {
        const scaleX = this.player.scaleX;
        const scaleY = this.player.scaleY;
        const extraHeight = (this.standHitbox.height - this.crouchHitbox.height) * scaleY;

        if (extraHeight <= 0) return true;

        const body = this.player.body;
        const standWidth = this.standHitbox.width * scaleX;
        const rectX = body.center.x - standWidth / 2;
        const rectY = body.top - extraHeight;

        const bodies = this.physics.overlapRect(
            rectX,
            rectY,
            standWidth,
            extraHeight,
            true,
            true
        );

        for (const other of bodies) {
            if (!other || other === body) continue;
            return false;
        }

        return true;
    }

    updateCoyoteTimer(delta) {
        if (this.player.body.blocked.down) {
            this.coyoteTimerMs = this.coyoteTimeMs;
        } else {
            this.coyoteTimerMs = Math.max(0, this.coyoteTimerMs - delta);
        }
    }

    updatePlayerMovement() {
        const down = this.cursors.down.isDown;
        const left = this.cursors.left.isDown;
        const right = this.cursors.right.isDown;
        const onGround = this.player.body.blocked.down;

        if (down) this.enterCrouch();
        else this.exitCrouch();

        const crouching = this.isCrouching;
        const speed = crouching ? 100 : 200;

        if (crouching) {
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

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.coyoteTimerMs > 0) {
            this.player.setVelocityY(-720);
            this.player.play('jump', true);
            this.coyoteTimerMs = 0;
            return;
        }

        if (!onGround) {
            this.player.play('jump', true);
            return;
        }

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

    configureCamera() {
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setDeadzone(300, 200);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    }
}
