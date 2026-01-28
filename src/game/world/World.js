const WORLD_CONFIG = {
    clouds: {
        keys: ['cloud1', 'cloud2', 'cloud3'],
        quantity: 20,
        minY: 60,
        maxY: 220,
        speed: 60
    },
    ground: {
        height: 70
    },
    animation: {
        maxDeltaMs: 33
    }
};

export class World {

    constructor(scene, worldWidth, worldHeight) {
        this.scene = scene;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
    }

    static preloadAssets(scene) {
        scene.load.image('sky', 'assets/tiles/sky.png');
        scene.load.image('cloud1', 'assets/tiles/cloud1.png');
        scene.load.image('cloud2', 'assets/tiles/cloud2.png');
        scene.load.image('cloud3', 'assets/tiles/cloud3.png');
        scene.load.image('ground', 'assets/tiles/ground.png');
        scene.load.image('block', 'assets/tiles/block.png');
    }

    static create(scene, props = {}) {
        const world = new World(scene, props.worldWidth, props.worldHeight);
        world.#createSky();
        world.#createClouds();
        world.#createGround(props.groundHoles);
        world.#createObstacles(props.obstacles);
        return world;
    }

    #createSky() {
        this.scene.add.tileSprite(
            this.worldWidth / 2,
            this.worldHeight / 2,
            this.worldWidth,
            this.worldHeight,
            'sky'
        );
    };

    #createClouds() {
        this.clouds = [];

        const cloudKeys = WORLD_CONFIG.clouds.keys;
        const quantity = WORLD_CONFIG.clouds.quantity;

        for (let i = 0; i < quantity; i++) {
            const key = Phaser.Utils.Array.GetRandom(cloudKeys);
            const cloud = this.scene.add.image(
                Phaser.Math.Between(0, this.worldWidth),
                Phaser.Math.Between(WORLD_CONFIG.clouds.minY, WORLD_CONFIG.clouds.maxY),
                key
            );

            this.clouds.push({ cloud, speed: WORLD_CONFIG.clouds.speed });
        }
    }

    #createGround(holes = []) {
        const groundHeight = WORLD_CONFIG.ground.height;
        const groundY = this.worldHeight - groundHeight / 2;

        this.groundSegments = this.scene.physics.add.staticGroup();
        this.groundHoleRanges = this.#buildGroundHoleRanges(this.worldWidth, holes);

        let cursor = 0;

        for (const hole of this.groundHoleRanges) {
            const width = hole.start - cursor;

            if (width > 0) {
                this.#addGroundSegment(this.scene, this.groundSegments, cursor + width / 2, groundY, width, groundHeight);
            }

            cursor = Math.max(cursor, hole.end);
        }

        const tailWidth = this.worldWidth - cursor;

        if (tailWidth > 0) {
            this.#addGroundSegment(this.scene, this.groundSegments, cursor + tailWidth / 2, groundY, tailWidth, groundHeight);
        }
    }

    #buildGroundHoleRanges(worldWidth, holes) {
        if (!holes || holes.length === 0) return [];

        return holes
            .map((hole) => ({
                start: Math.max(0, hole.x - hole.width / 2),
                end: Math.min(worldWidth, hole.x + hole.width / 2)
            }))
            .filter((hole) => hole.end > hole.start)
            .sort((a, b) => a.start - b.start);
    }

    #addGroundSegment(scene, group, x, y, width, height) {
        const body = scene.add.rectangle(x, y, width, height, 0x000000, 0);
        scene.physics.add.existing(body, true);
        group.add(body);

        scene.add.tileSprite(x, y, width, height, 'ground');
    }

    #createObstacles(obstacles = []) {
        this.obstacles = this.scene.physics.add.staticGroup();

        for (const obstacle of obstacles) {
            this.#addObstacle(this.obstacles, obstacle);
        }
    }

    #addObstacle(group, obstacle) {
        const { x, y, width, height } = obstacle;
        const body = this.scene.add.rectangle(x, y, width, height, 0x000000, 0);
        this.scene.physics.add.existing(body, true);
        group.add(body);

        this.scene.add.tileSprite(x, y, width, height, 'block').setDepth(10);
    }

    animate(delta) {
        if (!this.clouds || this.clouds.length === 0) return;

        const dt = Math.min(delta, WORLD_CONFIG.animation.maxDeltaMs) / 1000;

        for (const item of this.clouds) {
            const cloud = item.cloud;
            cloud.x -= item.speed * dt;

            const half = cloud.displayWidth / 2;
            if (cloud.x < -half) {
                cloud.x = this.worldWidth + half;
                cloud.y = Phaser.Math.Between(WORLD_CONFIG.clouds.minY, WORLD_CONFIG.clouds.maxY);
            }
        }
    }

    isOverHole(x, holeRanges) {
        if (!holeRanges) return false;

        for (const hole of holeRanges) {
            if (x >= hole.start && x <= hole.end) return true;
        }

        return false;
    }

}
