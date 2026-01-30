import { Game as MainGame } from './scenes/Game';
import { Menu } from './scenes/Menu';
import { AUTO, Scale, Game } from 'phaser';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#2b353d',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        Menu,
        MainGame
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 800 }
        }
    },
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

export default StartGame;
