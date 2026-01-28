export const createSky = (scene, worldWidth, worldHeight) => {
    scene.add.tileSprite(
        worldWidth / 2,
        worldHeight / 2,
        worldWidth,
        worldHeight,
        'sky'
    );
};

export const createClouds = (scene, worldWidth) => {
    const cloudKeys = ['cloud1', 'cloud2', 'cloud3'];
    const clouds = [];

    for (let i = 0; i < 20; i++) {
        const key = Phaser.Utils.Array.GetRandom(cloudKeys);
        const cloud = scene.add.image(
            Phaser.Math.Between(0, worldWidth),
            Phaser.Math.Between(60, 220),
            key
        );

        clouds.push({ cloud, speed: 60 });
    }

    return clouds;
};

export const animateClouds = (clouds, worldWidth, delta) => {
    if (!clouds || clouds.length === 0) return;

    const dt = Math.min(delta, 33) / 1000;

    for (const item of clouds) {
        const cloud = item.cloud;
        cloud.x -= item.speed * dt;

        const half = cloud.displayWidth / 2;
        if (cloud.x < -half) {
            cloud.x = worldWidth + half;
            cloud.y = Phaser.Math.Between(60, 220);
        }
    }
};

const buildGroundHoleRanges = (worldWidth, holes) => {
    if (!holes || holes.length === 0) return [];

    return holes
        .map((hole) => ({
            start: Math.max(0, hole.x - hole.width / 2),
            end: Math.min(worldWidth, hole.x + hole.width / 2)
        }))
        .filter((hole) => hole.end > hole.start)
        .sort((a, b) => a.start - b.start);
};

const addGroundSegment = (scene, group, x, y, width, height) => {
    const body = scene.add.rectangle(x, y, width, height, 0x000000, 0);
    scene.physics.add.existing(body, true);
    group.add(body);

    scene.add.tileSprite(x, y, width, height, 'ground');
};

export const createGround = (scene, worldWidth, worldHeight, holes = []) => {
    const groundHeight = 70;
    const groundY = worldHeight - groundHeight / 2;

    const groundSegments = scene.physics.add.staticGroup();
    const groundHoleRanges = buildGroundHoleRanges(worldWidth, holes);

    let cursor = 0;

    for (const hole of groundHoleRanges) {
        const width = hole.start - cursor;

        if (width > 0) {
            addGroundSegment(scene, groundSegments, cursor + width / 2, groundY, width, groundHeight);
        }

        cursor = Math.max(cursor, hole.end);
    }

    const tailWidth = worldWidth - cursor;

    if (tailWidth > 0) {
        addGroundSegment(scene, groundSegments, cursor + tailWidth / 2, groundY, tailWidth, groundHeight);
    }

    return { groundSegments, groundHoleRanges };
};

const addObstacle = (scene, group, obstacle) => {
    const { x, y, width, height } = obstacle;
    const body = scene.add.rectangle(x, y, width, height, 0x000000, 0);
    scene.physics.add.existing(body, true);
    group.add(body);

    scene.add.tileSprite(x, y, width, height, 'block').setDepth(10);
};

export const createObstacles = (scene, obstacles = []) => {
    const group = scene.physics.add.staticGroup();

    for (const obstacle of obstacles) {
        addObstacle(scene, group, obstacle);
    }

    return group;
};

export const isOverHole = (x, holeRanges) => {
    if (!holeRanges) return false;

    for (const hole of holeRanges) {
        if (x >= hole.start && x <= hole.end) return true;
    }

    return false;
};
