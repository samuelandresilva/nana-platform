import { Scene } from 'phaser';
import { Player } from '../player/Player';
import { World } from '../world/World';

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
            groundHoles: this.defineGroundHoles(),
            obstacles: this.defineObstacles()
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

    defineGroundHoles() {
        return [
            { x: 1080, width: 150 },
            { x: 1580, width: 150 },
            { x: 2180, width: 150 }
        ];
    }

    defineObstacles() {
        return [
            { x: 600, y: 550, width: 350, height: 40 },
            { x: 950, y: 420, width: 100, height: 40 },
            { x: 1350, y: 300, width: 180, height: 40 },
            { x: 1400, y: 540, width: 140, height: 40 },
            { x: 1600, y: 420, width: 140, height: 40 },
            { x: 1800, y: 550, width: 140, height: 40 },
            { x: 2350, y: 420, width: 100, height: 40 },
            { x: 2500, y: 550, width: 140, height: 40 },
            { x: 2800, y: 550, width: 80, height: 40 },
            { x: 3000, y: 600, width: 140, height: 40 }
        ];
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
