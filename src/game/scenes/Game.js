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
    }

    create() {
        this.isGameOver = false;
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
    }

    update(time, delta) {
        this.world.animate(delta);
        this.playerController.updatePlayer(delta);
        this.enemies.update();
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
}
