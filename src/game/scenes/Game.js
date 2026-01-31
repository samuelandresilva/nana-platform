import { Scene } from 'phaser';
import { Player } from '../player/Player';
import { World } from '../world/World';
import { LEVEL_1 } from '../levels/level1';
import { Collectibles } from '../items/Collectibles';
import { Enemies } from '../enemies/Enemies';

export class Game extends Scene {

    constructor() {
        super('Game');
    }

    preload() {
        World.preloadAssets(this);
        Player.preloadAssets(this);
        Collectibles.preloadAssets(this);
        Enemies.preloadAssets(this);
        this.load.audio('bgm_main', 'assets/audio/music/bgm_main.m4a');
        this.load.audio('sfx_game_over', 'assets/audio/sfx/game_over.mp3');
        this.load.audio('sfx_esa', 'assets/audio/sfx/esa.mp3');
        this.load.audio('sfx_coin', 'assets/audio/sfx/coin.mp3');
        this.load.audio('sfx_sucky', 'assets/audio/sfx/sucky.mp3');
        this.load.audio('sfx_win', 'assets/audio/sfx/win.mp3');
        this.load.image('flag', 'assets/tiles/flag.png');
        this.load.image('flag2', 'assets/tiles/flag2.png');
        this.load.image('olaf', 'assets/tiles/Olaf.png');
        this.load.image('dialog', 'assets/tiles/dialog.png');
    }

    create() {
        this.isGameOver = false;
        this.isWin = false;
        this.collectedItems = 0;
        this.totalCollectibles = LEVEL_1.collectibles?.length ?? 0;
        this.worldWidth = this.scale.width * 3.5;
        this.worldHeight = this.scale.height;
        this.fallLimit = 300;
        this.worldBoundsHeight = this.worldHeight + this.fallLimit;

        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldBoundsHeight);

        this.world = new World(this, this.worldWidth, this.worldHeight).setup({
            groundHoles: LEVEL_1.groundHoles,
            obstacles: LEVEL_1.obstacles
        });

        this.playerController = new Player(this).setup({
            groundSegments: this.world.groundSegments,
            shouldCollideWithGround: this.shouldCollideWithGround,
            shouldCollideContext: this
        });
        this.player = this.playerController.player;
        this.playerController.setInput(this.input.keyboard.createCursorKeys());

        this.collectibles = new Collectibles(this).setup({
            positions: LEVEL_1.collectibles
        });

        this.enemies = new Enemies(this).setup({
            enemies: LEVEL_1.enemies
        });

        this.createBackgroundMusic();
        this.configureCamera();
        this.createHud();
        this.createDebugHud();
        this.createFlag();
        this.createOlaf();
        this.createDeathZone();

        this.physics.add.collider(this.player, this.world.obstacles);
        this.physics.add.overlap(
            this.player,
            this.collectibles.group,
            this.handleCollectiblePickup,
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.enemies.group,
            this.handleEnemyHit,
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.goalFlag,
            this.handleGoalHit,
            null,
            this
        );
    }

    update(time, delta) {
        this.world.animate(delta);
        this.playerController.updatePlayer(delta);
        this.enemies.update();
        this.updateFlagProximity();
        this.updateDebugHud();
    }

    createBackgroundMusic() {
        this.sound.stopByKey('bgm_main');
        this.bgm = this.sound.add('bgm_main', { loop: true, volume: 0.1 });
        this.bgm.play();
    }

    isOverHole(x) {
        return this.world.isOverHole(x, this.world.groundHoleRanges);
    }

    shouldCollideWithGround(player) {
        return !this.isGameOver && !this.isOverHole(player.body.center.x);
    }

    configureCamera() {
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setDeadzone(300, 200);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    }

    createDeathZone() {
        const zoneHeight = 200;
        const zoneY = this.worldHeight + this.fallLimit - zoneHeight / 2;

        this.deathZone = this.add.rectangle(
            this.worldWidth / 2,
            zoneY,
            this.worldWidth,
            zoneHeight,
            0x000000,
            0
        );

        this.physics.add.existing(this.deathZone, true);
        this.physics.add.overlap(this.player, this.deathZone, this.handleGameOver, null, this);
    }

    handleGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;

        if (this.player?.body) {
            this.player.setVelocity(0);
        }

        if (this.bgm?.isPlaying) {
            this.bgm.stop();
        } else {
            this.sound.stopByKey('bgm_main');
        }

        this.sound.play('sfx_game_over');
        this.sound.play('sfx_esa');
        this.time.delayedCall(2000, () => {
            this.scene.restart();
        });
    }

    handleCollectiblePickup(player, collectible) {
        if (!collectible.active) return;

        collectible.disableBody(true, true);
        this.collectedItems += 1;
        this.sound.play('sfx_sucky');
        this.updateHud();
    }

    handleEnemyHit() {
        this.handleGameOver();
    }

    createFlag() {
        this.createFlagAnimation();

        const flagX = this.worldWidth - 220;
        const flagY = this.world.groundTopY ?? (this.worldHeight - 70);

        this.goalFlag = this.physics.add.staticSprite(flagX, flagY, 'flag');
        this.goalFlag.setOrigin(0.5, 1);
        this.goalFlag.setDepth(20);
        this.goalFlag.play('flag_wave');
        this.goalFlag.refreshBody();
    }

    createOlaf() {
        const flagX = this.worldWidth - 220;
        const flagY = this.world.groundTopY ?? (this.worldHeight - 70);
        const olafX = flagX + 140;
        const olafY = flagY + 10;

        this.olaf = this.add.image(olafX, olafY, 'olaf');
        this.olaf.setOrigin(0.5, 1);
        this.olaf.setScale(0.5);
        this.olaf.setDepth(19);

        this.dialog = this.add.image(olafX - 20, olafY, 'dialog');
        this.dialog.setOrigin(0.5, 1);
        this.dialog.setScale(0.4);
        this.dialog.setDepth(20);
        this.dialog.y = this.olaf.y - this.olaf.displayHeight - 10;
        this.dialog.setVisible(false);
    }

    createFlagAnimation() {
        if (this.anims.exists('flag_wave')) return;

        this.anims.create({
            key: 'flag_wave',
            frames: [
                { key: 'flag' },
                { key: 'flag2' }
            ],
            frameRate: 2,
            repeat: -1
        });
    }

    handleGoalHit() {
        if (this.isWin || this.isGameOver) return;
        if (this.collectedItems < this.totalCollectibles) {
            this.showGoalFeedback();
            return;
        }

        this.isWin = true;
        if (this.bgm?.isPlaying) {
            this.bgm.stop();
        }

        this.playerController.setInput(null);
        this.cameras.main.stopFollow();

        if (this.player?.body) {
            const groundY = (this.world.groundTopY ?? (this.worldHeight - 70)) - 30;
            this.player.setVelocity(0, 0);
            this.player.body.reset(this.player.x, groundY);
            this.player.y = groundY;
            this.player.body.updateFromGameObject();
            this.player.body.setAllowGravity(false);
            this.player.body.checkCollision.none = true;
        }
        this.player.setCollideWorldBounds(false);
        this.player.setFlipX(false);

        this.player.play('walk', true);

        const camera = this.cameras.main;
        const exitX = camera.scrollX + camera.width + this.player.displayWidth;

        this.tweens.add({
            targets: this.player,
            x: exitX,
            duration: 3000,
            ease: 'Sine.easeInOut'
        });

        this.sound.play('sfx_win');
        this.time.delayedCall(4000, () => {
            this.scene.start('Menu');
        });
    }

    createHud() {
        const style = {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        };

        const hudX = 16;
        const hudY = 16;
        const iconScale = 0.06;

        this.collectibleIcon = this.add.image(hudX, hudY, 'pacifier');
        this.collectibleIcon.setOrigin(0, 0);
        this.collectibleIcon.setScale(iconScale);
        this.collectibleIcon.setScrollFactor(0);
        this.collectibleIcon.setDepth(1000);

        const textX = hudX + this.collectibleIcon.displayWidth + 8;
        const textY = hudY + this.collectibleIcon.displayHeight / 2;

        this.collectibleText = this.add.text(textX, textY, this.getCollectibleText(), style);
        this.collectibleText.setOrigin(0, 0.5);
        this.collectibleText.setScrollFactor(0);
        this.collectibleText.setDepth(1000);
    }

    updateHud() {
        if (!this.collectibleText) return;
        this.collectibleText.setText(this.getCollectibleText());
    }

    getCollectibleText() {
        return `${this.collectedItems}/${this.totalCollectibles}`;
    }

    createDebugHud() {
        const style = {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffaa',
            stroke: '#000000',
            strokeThickness: 3
        };

        this.debugText = this.add.text(16, 56, '', style);
        this.debugText.setScrollFactor(0);
        this.debugText.setDepth(1000);
    }

    updateDebugHud() {
        if (!this.debugText || !this.player) return;
        const x = Math.round(this.player.x);
        const y = Math.round(this.player.y);
        this.debugText.setText(`X:${x} Y:${y}`);
    }

    showGoalFeedback() {
        if (!this.goalFeedbackText) return;
        this.goalFeedbackText.setVisible(true);
        this.goalFeedbackText.alpha = 1;
        this.goalFeedbackText.setText('Você não pegou todas as Tus');

        this.tweens.killTweensOf(this.goalFeedbackText);
        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: this.goalFeedbackText,
                alpha: 0,
                duration: 400,
                onComplete: () => {
                    this.goalFeedbackText.setVisible(false);
                }
            });
        });
    }

    updateFlagProximity() {
        if (!this.dialog || !this.player || !this.goalFlag) return;
        const isAtFlag = this.physics.overlap(this.player, this.goalFlag);
        this.dialog.setVisible(isAtFlag);
    }
}
