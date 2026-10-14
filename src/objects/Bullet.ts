import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Enemy } from './Enemy';

export class Bullet extends Phaser.GameObjects.Sprite {
    private target: Enemy;
    private speed: number = 500;
    private damage: number = CONFIG.TOWER_DAMAGE;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy) {
        super(scene, x, y, 'bullet');
        this.target = target;
        scene.add.existing(this);
        this.setDepth(5);
    }

    update(_time: number, delta: number) {
        if (!this.active) return;

        // Если цель мертва — удаляем пулю
        if (!this.target.active) {
            this.destroy();
            return;
        }

        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        const distance = this.speed * (delta / 1000);

        this.x += Math.cos(angle) * distance;
        this.y += Math.sin(angle) * distance;

        // Попадание
        if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 12) {
            this.target.takeDamage(this.damage);
            this.destroy();
        }
    }
}