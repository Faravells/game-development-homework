import Phaser from 'phaser';
import { CONFIG } from '../config';

export class Enemy extends Phaser.GameObjects.Sprite {
    public hp: number;
    public maxHp: number;
    public speed: number;
    public reward: number;

    private path: { x: number; y: number }[];
    private currentWaypointIndex: number = 0;
    private hpBar: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, path: { x: number; y: number }[]) {
        super(scene, path[0].x, path[0].y, 'enemy');
        this.path = path;

        this.maxHp = CONFIG.ENEMY_HP;
        this.hp = this.maxHp;
        this.speed = CONFIG.ENEMY_SPEED;
        this.reward = CONFIG.GOLD_PER_KILL;

        scene.add.existing(this);
        this.setDepth(3);

        // Полоска здоровья
        this.hpBar = scene.add.graphics();
        this.hpBar.setDepth(4);
        this.drawHpBar();
    }

    update(time: number, delta: number) {
        if (!this.active) return;

        const target = this.path[this.currentWaypointIndex + 1];
        if (!target) {
            // Дошли до конца пути
            (this.scene as any).enemyReachedEnd(this);
            return;
        }

        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        const distance = this.speed * (delta / 1000);

        this.x += Math.cos(angle) * distance;
        this.y += Math.sin(angle) * distance;

        // Проверяем, дошли ли до следующей точки
        if (Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) < 5) {
            this.currentWaypointIndex++;
        }

        this.drawHpBar();
    }

    takeDamage(amount: number) {
        this.hp -= amount;

        // Вспышка при получении урона
        this.setTint(0xffffff);
        this.scene.time.delayedCall(80, () => this.clearTint());

        if (this.hp <= 0) {
            (this.scene as any).enemyKilled(this);
        } else {
            this.drawHpBar();
        }
    }

    private drawHpBar() {
        this.hpBar.clear();
        const width = 32;
        const height = 4;
        const x = this.x - width / 2;
        const y = this.y - 26;

        // Фон
        this.hpBar.fillStyle(0x000000, 0.6);
        this.hpBar.fillRect(x, y, width, height);

        // Заполнение
        const ratio = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
        const color = ratio > 0.5 ? 0x06d6a0 : ratio > 0.25 ? 0xffd166 : 0xef476f;
        this.hpBar.fillStyle(color, 1);
        this.hpBar.fillRect(x, y, width * ratio, height);
    }

    destroy(fromScene?: boolean) {
        this.hpBar.destroy();
        super.destroy(fromScene);
    }
}