import Phaser from 'phaser';
import { CONFIG } from '../config';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        this.createEnemyTexture();
        this.createTowerTexture();
        this.createBulletTexture();
        this.createCrystalTexture();

        this.scene.start('MenuScene');
    }

    private createEnemyTexture() {
        const g = this.add.graphics();
        g.fillStyle(CONFIG.COLORS.ENEMY, 1);
        g.fillRoundedRect(0, 0, 32, 32, 6);
        g.generateTexture('enemy', 32, 32);
        g.destroy();
    }

    private createTowerTexture() {
        const g = this.add.graphics();
        g.fillStyle(CONFIG.COLORS.TOWER, 1);
        g.fillCircle(16, 16, 16);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(16, 16, 6);
        g.generateTexture('tower', 32, 32);
        g.destroy();
    }

    private createBulletTexture() {
        const g = this.add.graphics();
        g.fillStyle(CONFIG.COLORS.BULLET, 1);
        g.fillCircle(5, 5, 5);
        g.generateTexture('bullet', 10, 10);
        g.destroy();
    }

    private createCrystalTexture() {
        const g = this.add.graphics();
        g.fillStyle(CONFIG.COLORS.CRYSTAL, 1);
        // Ромб
        g.beginPath();
        g.moveTo(24, 0);
        g.lineTo(48, 24);
        g.lineTo(24, 48);
        g.lineTo(0, 24);
        g.closePath();
        g.fillPath();
        g.generateTexture('crystal', 48, 48);
        g.destroy();
    }
}