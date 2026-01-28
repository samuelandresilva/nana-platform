const PLAYER_CONFIG = {
    spawn: {
        x: 100,
        y: 100
    },
    assets: {
        frameWidth: 444,
        frameHeight: 773
    },
    render: {
        depth: 999,
        scale: 0.2,
        originX: 0.5,
        originY: 1
    },
    physics: {
        gravityY: 900,
        collideWorldBounds: true
    },
    movement: {
        walkSpeed: 200,
        crouchSpeed: 100,
        jumpVelocity: -720,
        coyoteTimeMs: 120
    },
    hitbox: {
        stand: {
            width: 0.6,
            height: 0.7,
            offsetX: 0.225,
            offsetY: 0.25
        },
        crouch: {
            width: 0.6,
            height: 0.45,
            offsetX: 0.225,
            offsetY: 0.5
        }
    },
    animations: {
        idle: {
            frameRate: 1,
            frame: 0
        },
        walk: {
            frameRate: 6,
            start: 0,
            end: 1
        },
        crouchIdle: {
            frameRate: 1,
            frame: 0
        },
        crouchWalk: {
            frameRate: 4,
            start: 0,
            end: 1
        },
        jump: {
            frameRate: 1,
            frame: 0
        }
    }
};

export class Player {

    constructor(scene, state) {
        this.scene = scene;
        this.state = state;
    }

    static preloadAssets(scene) {
        scene.load.spritesheet('player', 'assets/sprites/nana_walk.png', {
            frameWidth: PLAYER_CONFIG.assets.frameWidth,
            frameHeight: PLAYER_CONFIG.assets.frameHeight
        });

        scene.load.spritesheet('crouch', 'assets/sprites/nana_crouch.png', {
            frameWidth: PLAYER_CONFIG.assets.frameWidth,
            frameHeight: PLAYER_CONFIG.assets.frameHeight
        });

        scene.load.spritesheet('jump', 'assets/sprites/nana_jump.png', {
            frameWidth: PLAYER_CONFIG.assets.frameWidth,
            frameHeight: PLAYER_CONFIG.assets.frameHeight
        });
    }

    static create(scene, props = {}) {
        return new Player(scene, props.state).setup(props);
    }

    setup(props = {}) {
        this.#createAnimations(this.scene);
        this.#createPlayer(this.scene, props);
        return this;
    }

    #createAnimations(scene) {
        if (!scene.anims.exists('idle')) {
            scene.anims.create({
                key: 'idle',
                frames: [{ key: 'player', frame: PLAYER_CONFIG.animations.idle.frame }],
                frameRate: PLAYER_CONFIG.animations.idle.frameRate,
                repeat: -1
            });
        }

        if (!scene.anims.exists('walk')) {
            scene.anims.create({
                key: 'walk',
                frames: scene.anims.generateFrameNumbers('player', {
                    start: PLAYER_CONFIG.animations.walk.start,
                    end: PLAYER_CONFIG.animations.walk.end
                }),
                frameRate: PLAYER_CONFIG.animations.walk.frameRate,
                repeat: -1
            });
        }

        if (!scene.anims.exists('crouchIdle')) {
            scene.anims.create({
                key: 'crouchIdle',
                frames: [{ key: 'crouch', frame: PLAYER_CONFIG.animations.crouchIdle.frame }],
                frameRate: PLAYER_CONFIG.animations.crouchIdle.frameRate,
                repeat: -1
            });
        }

        if (!scene.anims.exists('crouchWalk')) {
            scene.anims.create({
                key: 'crouchWalk',
                frames: scene.anims.generateFrameNumbers('crouch', {
                    start: PLAYER_CONFIG.animations.crouchWalk.start,
                    end: PLAYER_CONFIG.animations.crouchWalk.end
                }),
                frameRate: PLAYER_CONFIG.animations.crouchWalk.frameRate,
                repeat: -1
            });
        }

        if (!scene.anims.exists('jump')) {
            scene.anims.create({
                key: 'jump',
                frames: [{ key: 'jump', frame: PLAYER_CONFIG.animations.jump.frame }],
                frameRate: PLAYER_CONFIG.animations.jump.frameRate,
                repeat: -1
            });
        }
    }

    #createPlayer(scene, props = {}) {
        const player = scene.physics.add.sprite(
            PLAYER_CONFIG.spawn.x,
            PLAYER_CONFIG.spawn.y,
            'player'
        );
        player.setDepth(PLAYER_CONFIG.render.depth);
        player.setScale(PLAYER_CONFIG.render.scale);
        player.setOrigin(PLAYER_CONFIG.render.originX, PLAYER_CONFIG.render.originY);
        player.setCollideWorldBounds(PLAYER_CONFIG.physics.collideWorldBounds);
        player.setGravityY(PLAYER_CONFIG.physics.gravityY);

        if (props.groundSegments) {
            scene.physics.add.collider(
                player,
                props.groundSegments,
                null,
                props.shouldCollideWithGround,
                props.shouldCollideContext ?? scene
            );
        }

        const standHitbox = {
            width: player.width * PLAYER_CONFIG.hitbox.stand.width,
            height: player.height * PLAYER_CONFIG.hitbox.stand.height,
            offsetX: player.width * PLAYER_CONFIG.hitbox.stand.offsetX,
            offsetY: player.height * PLAYER_CONFIG.hitbox.stand.offsetY
        };

        const crouchHitbox = {
            width: player.width * PLAYER_CONFIG.hitbox.crouch.width,
            height: player.height * PLAYER_CONFIG.hitbox.crouch.height,
            offsetX: player.width * PLAYER_CONFIG.hitbox.crouch.offsetX,
            offsetY: player.height * PLAYER_CONFIG.hitbox.crouch.offsetY
        };

        this.state = {
            player,
            standHitbox,
            crouchHitbox,
            isCrouching: false,
            coyoteTimerMs: 0,
            cursors: null
        };

        this.#applyHitbox(player, standHitbox);
        player.play('idle');

        this.player = player;
    }

    setInput(cursors) {
        if (!this.state) {
            this.state = { cursors };
            return;
        }

        this.state.cursors = cursors;
    }

    #applyHitbox(player, cfg) {
        player.body.setSize(cfg.width, cfg.height, true);
        player.body.setOffset(cfg.offsetX, cfg.offsetY);
    }

    updatePlayer(delta) {
        if (!this.state) return;

        this.#updateCoyoteTimer(delta);
        this.#updatePlayerMovement();
    };

    #updatePlayerMovement() {
        const { player, cursors } = this.state;
        if (!cursors) return;
        const down = cursors.down.isDown;
        const left = cursors.left.isDown;
        const right = cursors.right.isDown;
        const onGround = player.body.blocked.down;

        if (down) this.#enterCrouch(this.state);
        else this.#exitCrouch(this.scene, this.state);

        const crouching = this.state.isCrouching;
        const speed = crouching
            ? PLAYER_CONFIG.movement.crouchSpeed
            : PLAYER_CONFIG.movement.walkSpeed;

        if (crouching) {
            player.setVelocityX(0);

            if (left) {
                player.setVelocityX(-speed);
                player.setFlipX(true);
                player.play('crouchWalk', true);
            } else if (right) {
                player.setVelocityX(speed);
                player.setFlipX(false);
                player.play('crouchWalk', true);
            } else {
                player.play('crouchIdle', true);
            }
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up) && this.state.coyoteTimerMs > 0) {
            player.setVelocityY(PLAYER_CONFIG.movement.jumpVelocity);
            player.play('jump', true);
            this.state.coyoteTimerMs = 0;
            return;
        }

        if (!onGround) {
            player.play('jump', true);
            return;
        }

        player.setVelocityX(0);
        if (left) {
            player.setVelocityX(-speed);
            player.setFlipX(true);
            player.play('walk', true);
        } else if (right) {
            player.setVelocityX(speed);
            player.setFlipX(false);
            player.play('walk', true);
        } else {
            player.play('idle', true);
        }
    }

    #enterCrouch(state) {
        if (state.isCrouching) return;
        state.isCrouching = true;
        this.#applyHitbox(state.player, state.crouchHitbox);
    }

    #exitCrouch(scene, state) {
        if (!state.isCrouching) return;
        if (!this.#canStandUp(scene, state)) return;
        state.isCrouching = false;
        this.#applyHitbox(state.player, state.standHitbox);
    }

    #canStandUp(scene, state) {
        const { player, standHitbox, crouchHitbox } = state;
        const scaleX = player.scaleX;
        const scaleY = player.scaleY;
        const extraHeight = (standHitbox.height - crouchHitbox.height) * scaleY;

        if (extraHeight <= 0) return true;

        const body = player.body;
        const standWidth = standHitbox.width * scaleX;
        const rectX = body.center.x - standWidth / 2;
        const rectY = body.top - extraHeight;

        const bodies = scene.physics.overlapRect(
            rectX,
            rectY,
            standWidth,
            extraHeight,
            true,
            true
        );

        for (const other of bodies) {
            if (!other || other === body) continue;
            return false;
        }

        return true;
    }

    #updateCoyoteTimer(delta) {
        if (this.state.player.body.blocked.down) {
            this.state.coyoteTimerMs = PLAYER_CONFIG.movement.coyoteTimeMs;
        } else {
            this.state.coyoteTimerMs = Math.max(0, this.state.coyoteTimerMs - delta);
        }
    };


}
