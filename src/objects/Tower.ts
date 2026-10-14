import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';

export class Tower extends Phaser.GameObjects.Sprite {
    private lastFired: number = 0;
    private rangeCircle: Phaser.GameObjects.Arc;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'tower');
        scene.add.existing(this);
        this.setDepth(2);

        // Индикатор радиуса (появляется при наведении)
        this.rangeCircle = scene.add.circle(x, y, CONFIG.TOWER_RANGE, CONFIG.COLORS.TOWER_RANGE, 0.15);
        this.rangeCircle.setDepth(1);
        this.rangeCircle.setVisible(false);

        this.setInteractive();
        this.on('pointerover', () => this.rangeCircle.setVisible(true));
        this.on('pointerout', () => this.rangeCircle.setVisible(false));
    }

    update(time: number, enemies: Phaser.GameObjects.Group, bullets: Phaser.GameObjects.Group) {
        if (time < this.lastFired + CONFIG.TOWER_FIRE_RATE) return;

        // Ищем ближайшего врага в радиусе
        let closestEnemy: Enemy | null = null;
        let minDistance = CONFIG.TOWER_RANGE;

        enemies.getChildren().forEach((obj) => {
            const enemy = obj as Enemy;
            if (!enemy.active) return;

            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (dist < minDistance) {
                minDistance = dist;
                closestEnemy = enemy;
            }
        });

        if (closestEnemy) {
            this.shoot(closestEnemy, bullets);
            this.lastFired = time;

            // Анимация поворота/отдачи
            this.scene.tweens.add({
                targets: this,
                scale: 1.15,
                duration: 80,
                yoyo: true
            });
        }
    }

    private shoot(target: Enemy, bullets: Phaser.GameObjects.Group) {
        const bullet = new Bullet(this.scene, this.x, this.y, target);
        bullets.add(bullet);
    }

    destroy(fromScene?: boolean) {
        this.rangeCircle.destroy();
        super.destroy(fromScene);
    }
}