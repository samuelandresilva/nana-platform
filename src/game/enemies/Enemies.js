const ENEMY_CONFIG = {
    key: 'hill_small',
    scale: 0.7,
    speed: 80,
    depth: 12,
    patrolDistance: 300
};

export class Enemies {

    constructor(scene) {
        this.scene = scene;
    }

    static preloadAssets(scene) {
        scene.load.image(ENEMY_CONFIG.key, 'assets/tiles/hill_small.png');
    }

    setup(props = {}) {
        const enemies = props.enemies ?? [];
        const key = props.key ?? ENEMY_CONFIG.key;
        const scale = props.scale ?? ENEMY_CONFIG.scale;
        const depth = props.depth ?? ENEMY_CONFIG.depth;

        this.group = this.scene.physics.add.group();
        this.instances = [];

        for (const enemy of enemies) {
            const sprite = this.group.create(enemy.x, enemy.y, key);
            sprite.setOrigin(0.5, 1);
            sprite.setScale(enemy.scale ?? scale);
            sprite.setDepth(enemy.depth ?? depth);
            sprite.body.setAllowGravity(false);
            sprite.body.setImmovable(true);

            const patrolDistance = enemy.patrolDistance ?? ENEMY_CONFIG.patrolDistance;
            const speed = enemy.speed ?? ENEMY_CONFIG.speed;
            const minX = enemy.x - patrolDistance;
            const maxX = enemy.x + patrolDistance;

            sprite.setVelocityX(speed);
            this.instances.push({ sprite, minX, maxX, speed });
        }

        return this;
    }

    update() {
        if (!this.instances || this.instances.length === 0) return;

        for (const enemy of this.instances) {
            const sprite = enemy.sprite;
            if (!sprite?.active) continue;

            if (sprite.x <= enemy.minX) {
                sprite.setVelocityX(Math.abs(enemy.speed));
            } else if (sprite.x >= enemy.maxX) {
                sprite.setVelocityX(-Math.abs(enemy.speed));
            }
        }
    }
}
