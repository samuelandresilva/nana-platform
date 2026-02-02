export const LEVEL_2 = {
    worldWidthMultiplier: 4.0,
    groundHoles: [
        { x: 900, width: 200 },
        { x: 1900, width: 180 },
        { x: 3100, width: 260 },
        { x: 4200, width: 220 }
    ],
    obstacles: [
        { x: 500, y: 560, width: 220, height: 40 },
        { x: 800, y: 430, width: 160, height: 40 },
        { x: 1500, y: 320, width: 160, height: 40 },
        { x: 1750, y: 520, width: 180, height: 40 },
        { x: 2300, y: 440, width: 140, height: 40 },
        { x: 2700, y: 360, width: 140, height: 40 },
        { x: 3300, y: 520, width: 200, height: 40 },
        { x: 3800, y: 420, width: 160, height: 40 },
        { x: 4400, y: 360, width: 160, height: 40 }
    ],
    collectibles: [
        { x: 520, y: 500 },
        { x: 1400, y: 250 },
        { x: 2300, y: 370 },
        { x: 3300, y: 470 },
        { x: 4500, y: 300 }
    ],
    enemies: [
        { x: 1600, y: 650, patrolDistance: 180, speed: 110 },
        { x: 2800, y: 650, patrolDistance: 260, speed: 100 },
        { x: 4100, y: 650, patrolDistance: 200, speed: 120 }
    ]
};
