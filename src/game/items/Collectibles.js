const COLLECTIBLE_CONFIG = {
    key: 'pacifier',
    scale: 0.06,
    depth: 15
};

export class Collectibles {

    constructor(scene) {
        this.scene = scene;
    }

    static preloadAssets(scene) {
        scene.load.image(COLLECTIBLE_CONFIG.key, 'assets/tiles/pacifier.png');
    }

    static create(scene, props = {}) {
        return new Collectibles(scene).setup(props);
    }

    setup(props = {}) {
        const positions = props.positions ?? [];
        const key = props.key ?? COLLECTIBLE_CONFIG.key;
        const scale = props.scale ?? COLLECTIBLE_CONFIG.scale;
        const depth = props.depth ?? COLLECTIBLE_CONFIG.depth;

        this.group = this.scene.physics.add.staticGroup();

        for (const pos of positions) {
            const item = this.group.create(pos.x, pos.y, key);
            item.setScale(scale);
            item.setDepth(depth);
            item.refreshBody();
        }

        return this;
    }
}
