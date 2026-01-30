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
        scene.load.image('ground_cliff_left', 'assets/tiles/ground_cliff_left.png');
        scene.load.image('ground_cliff_right', 'assets/tiles/ground_cliff_right.png');
        scene.load.image('block', 'assets/tiles/block.png');
    }

    static create(scene, props = {}) {
        return new World(scene, props.worldWidth, props.worldHeight).setup(props);
    }

    setup(props = {}) {
        this.#createSky();
        this.#createClouds();
        this.#createGround(props.groundHoles);
        this.#createObstacles(props.obstacles);
        return this;
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
        const tileWidth = this.#getScaledTileWidth('ground', groundHeight);

        this.groundSegments = this.scene.physics.add.staticGroup();
        this.groundHoleRanges = this.#buildGroundHoleRanges(this.worldWidth, holes);

        let cursor = 0;

        const holeRanges = this.groundHoleRanges;

        for (let i = 0; i < holeRanges.length; i += 1) {
            const hole = holeRanges[i];
            const segmentStart = cursor;
            const segmentEnd = hole.start;

            if (segmentEnd > segmentStart) {
                const hasLeftHole = cursor > 0;
                this.#addGroundSegment(
                    segmentStart,
                    segmentEnd,
                    groundY,
                    groundHeight,
                    tileWidth,
                    hasLeftHole,
                    true
                );
            }

            cursor = Math.max(cursor, hole.end);
        }

        const tailWidth = this.worldWidth - cursor;

        if (tailWidth > 0) {
            const segmentStart = cursor;
            const segmentEnd = this.worldWidth;
            const hasLeftHole = holeRanges.length > 0;
            this.#addGroundSegment(
                segmentStart,
                segmentEnd,
                groundY,
                groundHeight,
                tileWidth,
                hasLeftHole,
                false
            );
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

    #addGroundSegment(startX, endX, y, height, tileWidth, addLeftCliff, addRightCliff) {
        const width = endX - startX;
        const body = this.scene.add.rectangle(startX + width / 2, y, width, height, 0x000000, 0);
        this.scene.physics.add.existing(body, true);
        this.groundSegments.add(body);

        let visualStart = startX;
        let visualEnd = endX;

        if (addLeftCliff) {
            this.#addGroundCliff(visualStart + tileWidth / 2, y, 'ground_cliff_left', height);
            visualStart += tileWidth;
        }

        if (addRightCliff) {
            this.#addGroundCliff(visualEnd - tileWidth / 2, y, 'ground_cliff_right', height);
            visualEnd -= tileWidth;
        }

        const visualWidth = visualEnd - visualStart;
        if (visualWidth > 0) {
            this.scene.add.tileSprite(visualStart + visualWidth / 2, y, visualWidth, height, 'ground');
        }
    }

    #addGroundCliff(x, y, key, groundHeight) {
        const sprite = this.scene.add.image(x, y, key);
        const baseHeight = sprite.height || groundHeight;
        const scale = groundHeight / baseHeight;
        sprite.setScale(scale);
        sprite.setDepth(2);
    }

    #getScaledTileWidth(key, groundHeight) {
        const texture = this.scene.textures.get(key);
        const source = texture?.getSourceImage?.();
        const baseWidth = source?.width ?? groundHeight;
        const baseHeight = source?.height ?? groundHeight;
        const scale = groundHeight / baseHeight;
        return baseWidth * scale;
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
