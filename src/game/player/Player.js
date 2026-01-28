export class Player {

    constructor(scene, state) {
        this.scene = scene;
        this.state = state;
    }

    static preloadAssets(scene) {
        alert('preloadPlayerAssets');
        scene.load.spritesheet('player', 'assets/sprites/nana_walk.png', {
            frameWidth: 444,
            frameHeight: 773
        });

        scene.load.spritesheet('crouch', 'assets/sprites/nana_crouch.png', {
            frameWidth: 444,
            frameHeight: 773
        });

        scene.load.spritesheet('jump', 'assets/sprites/nana_jump.png', {
            frameWidth: 444,
            frameHeight: 773
        });
    }

    static create(scene, props = {}) {
        alert('createPlayer');
        console.log(props);
        const player = new Player(scene, props.state);
        player.#createAnimations(scene);
        player.#createCharacter(scene, props);
        return player;
    }

    #createAnimations(scene) {
        alert('createPlayerAnimations');
        if (!scene.anims.exists('idle')) {
            scene.anims.create({
                key: 'idle',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
        }

        if (!scene.anims.exists('walk')) {
            scene.anims.create({
                key: 'walk',
                frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
                frameRate: 6,
                repeat: -1
            });
        }

        if (!scene.anims.exists('crouchIdle')) {
            scene.anims.create({
                key: 'crouchIdle',
                frames: [{ key: 'crouch', frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
        }

        if (!scene.anims.exists('crouchWalk')) {
            scene.anims.create({
                key: 'crouchWalk',
                frames: scene.anims.generateFrameNumbers('crouch', { start: 0, end: 1 }),
                frameRate: 4,
                repeat: -1
            });
        }

        if (!scene.anims.exists('jump')) {
            scene.anims.create({
                key: 'jump',
                frames: [{ key: 'jump', frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
        }
    }

    #createCharacter(scene, props = {}) {
        alert('createCharacter');
        const character = scene.physics.add.sprite(100, 100, 'player');
        character.setDepth(999);
        character.setScale(0.2);
        character.setOrigin(0.5, 1);
        character.setCollideWorldBounds(true);
        character.setGravityY(900);

        if (props.groundSegments) {
            scene.physics.add.collider(
                character,
                props.groundSegments,
                null,
                props.shouldCollideWithGround,
                props.shouldCollideContext ?? scene
            );
        }

        const standHitbox = {
            width: character.width * 0.6,
            height: character.height * 0.7,
            offsetX: character.width * 0.225,
            offsetY: character.height * 0.25
        };

        const crouchHitbox = {
            width: character.width * 0.6,
            height: character.height * 0.45,
            offsetX: character.width * 0.225,
            offsetY: character.height * 0.5
        };

        this.state = {
            character,
            standHitbox,
            crouchHitbox,
            isCrouching: false,
            coyoteTimerMs: 0,
            cursors: scene.input.keyboard.createCursorKeys()
        };

        this.#applyHitbox(character, standHitbox);
        character.play('idle');

        scene.character = character;
    }

    #applyHitbox(character, cfg) {
        character.body.setSize(cfg.width, cfg.height, true);
        character.body.setOffset(cfg.offsetX, cfg.offsetY);
    }

    updatePlayer(delta) {
        if (!this.state) return;

        this.#updateCoyoteTimer(delta);
        this.#updatePlayerMovement();
    };

    #updatePlayerMovement() {
        const { character, cursors } = this.state;
        const down = cursors.down.isDown;
        const left = cursors.left.isDown;
        const right = cursors.right.isDown;
        const onGround = character.body.blocked.down;

        if (down) this.#enterCrouch(this.state);
        else this.#exitCrouch(this.scene, this.state);

        const crouching = this.state.isCrouching;
        const speed = crouching ? 100 : 200;

        if (crouching) {
            character.setVelocityX(0);

            if (left) {
                character.setVelocityX(-speed);
                character.setFlipX(true);
                character.play('crouchWalk', true);
            } else if (right) {
                character.setVelocityX(speed);
                character.setFlipX(false);
                character.play('crouchWalk', true);
            } else {
                character.play('crouchIdle', true);
            }
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up) && this.state.coyoteTimerMs > 0) {
            character.setVelocityY(-720);
            character.play('jump', true);
            this.state.coyoteTimerMs = 0;
            return;
        }

        if (!onGround) {
            character.play('jump', true);
            return;
        }

        character.setVelocityX(0);
        if (left) {
            character.setVelocityX(-speed);
            character.setFlipX(true);
            character.play('walk', true);
        } else if (right) {
            character.setVelocityX(speed);
            character.setFlipX(false);
            character.play('walk', true);
        } else {
            character.play('idle', true);
        }
    }

    #enterCrouch(state) {
        if (state.isCrouching) return;
        state.isCrouching = true;
        this.#applyHitbox(state.character, state.crouchHitbox);
    }

    #exitCrouch(scene, state) {
        if (!state.isCrouching) return;
        if (!this.#canStandUp(scene, state)) return;
        state.isCrouching = false;
        this.#applyHitbox(state.character, state.standHitbox);
    }

    #canStandUp(scene, state) {
        const { character, standHitbox, crouchHitbox } = state;
        const scaleX = character.scaleX;
        const scaleY = character.scaleY;
        const extraHeight = (standHitbox.height - crouchHitbox.height) * scaleY;

        if (extraHeight <= 0) return true;

        const body = character.body;
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
        if (this.state.character.body.blocked.down) {
            this.state.coyoteTimerMs = 120;
        } else {
            this.state.coyoteTimerMs = Math.max(0, this.state.coyoteTimerMs - delta);
        }
    };


}