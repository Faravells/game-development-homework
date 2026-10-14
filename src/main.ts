import Phaser from 'phaser';
import { CONFIG } from './config';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: CONFIG.WIDTH,
    height: CONFIG.HEIGHT,
    parent: 'game',
    backgroundColor: CONFIG.COLORS.BG,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scene: [BootScene, GameScene, UIScene]
};

new Phaser.Game(gameConfig);