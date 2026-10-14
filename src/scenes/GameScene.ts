import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Enemy } from '../objects/Enemy';
import { Tower } from '../objects/Tower';

export class GameScene extends Phaser.Scene {
    public enemies!: Phaser.GameObjects.Group;
    public towers!: Phaser.GameObjects.Group;
    public bullets!: Phaser.GameObjects.Group;

    public gold!: number;
    public hp!: number;

    private spawnedCount!: number;
    private isGameOver!: boolean;

    private pathPoints: { x: number; y: number }[] = [];
    private towerSlots: { x: number; y: number }[] = [];
    private spawnTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super('GameScene');
    }

    init() {
        this.gold = CONFIG.START_GOLD;
        this.hp = CONFIG.START_HP;
        this.spawnedCount = 0;
        this.isGameOver = false;
    }

    create() {
        this.definePath();
        this.defineTowerSlots();
        this.drawMap();
        this.createCrystal();

        this.enemies = this.add.group();
        this.towers = this.add.group();
        this.bullets = this.add.group();

        this.input.on('pointerdown', this.handleClick, this);

        // Cпавн — только если есть ещё враги
        this.spawnTimer = this.time.addEvent({
            delay: CONFIG.ENEMY_SPAWN_DELAY,
            callback: this.trySpawnEnemy,
            callbackScope: this,
            loop: true
        });

        this.time.delayedCall(0, () => {
            this.trySpawnEnemy();
            this.emitUIUpdate()
        });
    }

    update(time: number, delta: number) {
        // Обновляем врагов
        this.enemies.getChildren().forEach((enemy: any) => {
            if (enemy.active) enemy.update(time, delta);
        });

        // Обновляем башни (поиск цели и стрельба)
        this.towers.getChildren().forEach((tower: any) => {
            if (tower.active) tower.update(time, this.enemies, this.bullets);
        });

        // Обновляем пули
        this.bullets.getChildren().forEach((bullet: any) => {
            if (bullet.active) bullet.update(time, delta);
        });
    }

    // --- Карта ---

    private definePath() {
        this.pathPoints = [
            { x: -40, y: 150 },
            { x: 300, y: 150 },
            { x: 300, y: 400 },
            { x: 700, y: 400 },
            { x: 700, y: 650 },
            { x: 980, y: 650 }
        ];
    }

    private defineTowerSlots() {
        // Слоты, куда можно ставить башни (рядом с дорогой)
        this.towerSlots = [
            { x: 150, y: 300 }, { x: 450, y: 250 },
            { x: 500, y: 550 }, { x: 850, y: 500 },
            { x: 600, y: 250 },
        ];
    }

    private drawMap() {
        const graphics = this.add.graphics();

        // Дорога
        graphics.lineStyle(60, CONFIG.COLORS.PATH, 1);
        graphics.beginPath();
        graphics.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
        for (let i = 1; i < this.pathPoints.length; i++) {
            graphics.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
        }
        graphics.strokePath();
        graphics.setDepth(0);

        // Слоты для башен
        this.towerSlots.forEach(slot => {
            const g = this.add.graphics();
            g.fillStyle(CONFIG.COLORS.SLOT, 0.6);
            g.fillRoundedRect(slot.x - 24, slot.y - 24, 48, 48, 8);
            g.lineStyle(2, CONFIG.COLORS.TOWER, 0.5);
            g.strokeRoundedRect(slot.x - 24, slot.y - 24, 48, 48, 8);
            g.setDepth(1);
        });
    }

    private createCrystal() {
        const lastPoint = this.pathPoints[this.pathPoints.length - 1];
        const crystal = this.add.image(lastPoint.x, lastPoint.y, 'crystal');
        crystal.setDepth(2);
    }

    // --- Действия ---

    private handleClick(pointer: Phaser.Input.Pointer) {
        if (this.isGameOver) return;

        for (const slot of this.towerSlots) {
            const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, slot.x, slot.y);
            if (dist < 30) {
                const occupied = this.towers.getChildren().some(
                    (t: any) => t.x === slot.x && t.y === slot.y
                );
                if (occupied) return;

                if (this.gold >= CONFIG.TOWER_COST) {
                    this.gold -= CONFIG.TOWER_COST;
                    const tower = new Tower(this, slot.x, slot.y);
                    this.towers.add(tower);
                    this.emitUIUpdate();
                } else {
                    this.flashMessage('Не хватает золота!');
                }
                return;
            }
        }
    }

     private trySpawnEnemy() {
        if (this.isGameOver) return;
        if (this.spawnedCount >= CONFIG.TOTAL_ENEMIES) {
            this.spawnTimer.destroy();
            this.checkVictory();
            return;
        }

        const enemy = new Enemy(this, this.pathPoints);
        this.enemies.add(enemy);
        this.spawnedCount++;
        this.emitUIUpdate();
    }

    // Вызывается врагом, когда он дошел до конца
    public enemyReachedEnd(enemy: Enemy) {
        enemy.destroy();
        this.hp--;
        this.emitUIUpdate();

        if (this.hp <= 0) {
            this.gameOver();
        } else {
            this.checkVictory();
        }
    }

    // Вызывается, когда враг убит
    public enemyKilled(enemy: Enemy) {
        this.gold += CONFIG.GOLD_PER_KILL;
        enemy.destroy();
        this.emitUIUpdate();
        this.checkVictory();
    }

    private checkVictory() {
        if (this.isGameOver) return;

        const aliveEnemies = this.enemies.countActive(true);
        const allSpawned = this.spawnedCount >= CONFIG.TOTAL_ENEMIES;

        if (allSpawned && aliveEnemies === 0) {
            this.victory();
        }
    }

    private victory() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.spawnTimer.destroy();
        this.enemies.clear(true, true);
        this.bullets.clear(true, true);
        this.events.emit('victory', this.hp);
    }

    private flashMessage(text: string) {
        const msg = this.add.text(CONFIG.WIDTH / 2, 50, text, {
            fontSize: '24px',
            color: '#ef476f',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: 20,
            duration: 1200,
            onComplete: () => msg.destroy()
        });
    }

    private gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.spawnTimer.destroy();
        this.events.emit('game-over', this.spawnedCount);
    }

    // Универсальный метод обновления UI
    private emitUIUpdate() {
        const alive = this.enemies.countActive(true);
        const remaining = CONFIG.TOTAL_ENEMIES - this.spawnedCount + alive;
        this.events.emit('update-ui', this.gold, this.hp, remaining);
    }
}