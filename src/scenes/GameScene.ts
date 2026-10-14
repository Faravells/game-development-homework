import Phaser from 'phaser';
import { CONFIG } from '../config';
import { Enemy } from '../objects/Enemy';
import { Tower } from '../objects/Tower';

export class GameScene extends Phaser.Scene {
    public enemies!: Phaser.GameObjects.Group;
    public towers!: Phaser.GameObjects.Group;
    public bullets!: Phaser.GameObjects.Group;

    public gold: number = CONFIG.START_GOLD;
    public hp: number = CONFIG.START_HP;

    private pathPoints: { x: number; y: number }[] = [];
    private towerSlots: { x: number; y: number }[] = [];
    private spawnTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super('GameScene');
    }

    create() {
        this.definePath();
        this.defineTowerSlots();
        this.drawMap();
        this.createCrystal();

        this.enemies = this.add.group();
        this.towers = this.add.group();
        this.bullets = this.add.group();

        // Клик по слоту — покупка башни
        this.input.on('pointerdown', this.handleClick, this);

        // Спавн врагов
        this.spawnTimer = this.time.addEvent({
            delay: CONFIG.ENEMY_SPAWN_DELAY,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Сообщаем UI начальные значения
        this.events.emit('update-ui', this.gold, this.hp);
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
        // Проверяем, попал ли клик в слот
        for (const slot of this.towerSlots) {
            const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, slot.x, slot.y);
            if (dist < 30) {
                // Проверяем, свободен ли слот
                const occupied = this.towers.getChildren().some(
                    (t: any) => t.x === slot.x && t.y === slot.y
                );
                if (occupied) return;

                if (this.gold >= CONFIG.TOWER_COST) {
                    this.gold -= CONFIG.TOWER_COST;
                    const tower = new Tower(this, slot.x, slot.y);
                    this.towers.add(tower);
                    this.events.emit('update-ui', this.gold, this.hp);
                } else {
                    this.flashMessage('Не хватает золота!');
                }
                return;
            }
        }
    }

    private spawnEnemy() {
        const enemy = new Enemy(this, this.pathPoints);
        this.enemies.add(enemy);
    }

    // Вызывается врагом, когда он дошел до конца
    public enemyReachedEnd(enemy: Enemy) {
        enemy.destroy();
        this.hp--;
        this.events.emit('update-ui', this.gold, this.hp);

        if (this.hp <= 0) {
            this.gameOver();
        }
    }

    // Вызывается, когда враг убит
    public enemyKilled(enemy: Enemy) {
        this.gold += CONFIG.GOLD_PER_KILL;
        this.events.emit('update-ui', this.gold, this.hp);
        enemy.destroy();
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
        this.spawnTimer.destroy();
        this.scene.pause();
        this.scene.launch('UIScene'); // На случай если закрыт
        this.events.emit('game-over');
    }
}