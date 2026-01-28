import { Scene } from 'phaser';
import { Player } from '../player/Player';
import { World } from '../world/World';
import { LEVEL_1 } from '../levels/level1';

export class Game extends Scene {

    constructor() {
        super('Game');
    }

    preload() {
        World.preloadAssets(this);
        Player.preloadAssets(this);
    }

    create() {
        this.worldWidth = this.scale.width * 3;
        this.worldHeight = this.scale.height;
        this.fallLimit = 300;
        this.worldBoundsHeight = this.worldHeight + this.fallLimit;

        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldBoundsHeight);

        this.world = World.create(this, {
            worldWidth: this.worldWidth,
            worldHeight: this.worldHeight,
            groundHoles: LEVEL_1.groundHoles,
            obstacles: LEVEL_1.obstacles
        });

        this.playerController = Player.create(this, {
            groundSegments: this.world.groundSegments,
            shouldCollideWithGround: this.shouldCollideWithGround,
            shouldCollideContext: this
        });
        this.player = this.playerController.player;

        this.configureCamera();
        this.createDeathZone();

        this.physics.add.collider(this.player, this.world.obstacles);

    }

    update(time, delta) {
        this.world.animate(delta);
        this.playerController.updatePlayer(delta);
    }

    isOverHole(x) {
        return this.world.isOverHole(x, this.world.groundHoleRanges);
    }

    shouldCollideWithGround(player) {
        return !this.isOverHole(player.body.center.x);
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
        this.physics.add.overlap(this.player, this.deathZone, this.restartLevel, null, this);
    }

    restartLevel() {
        this.scene.restart();
    }
}
