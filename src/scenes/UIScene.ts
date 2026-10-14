import Phaser from 'phaser';
import { CONFIG } from '../config';

export class UIScene extends Phaser.Scene {
    private goldText!: Phaser.GameObjects.Text;
    private hpText!: Phaser.GameObjects.Text;
    private enemiesText!: Phaser.GameObjects.Text;

    constructor() {
        super('UIScene');
    }

    create() {
        const style: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '22px',
            color: CONFIG.COLORS.TEXT,
            fontStyle: 'bold',
            backgroundColor: '#00000088',
            padding: { x: 12, y: 6 }
        };

        this.goldText = this.add.text(16, 16, `💰 ${CONFIG.START_GOLD}`, style);
        this.hpText = this.add.text(16, 56, `❤️ ${CONFIG.START_HP}`, style);
        this.enemiesText = this.add.text(
            CONFIG.WIDTH - 16, 16,
            `👾 Осталось: ${CONFIG.TOTAL_ENEMIES}`,
            style
        ).setOrigin(1, 0);

        this.add.text(
            CONFIG.WIDTH / 2,
            CONFIG.HEIGHT - 30,
            'Кликните по синему слоту, чтобы построить башню (50 золота)',
            {
                fontSize: '18px',
                color: '#aaaacc',
                fontStyle: 'italic'
            }
        ).setOrigin(0.5);

        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('update-ui', this.updateUI, this);
        gameScene.events.on('game-over', this.showGameOver, this);
        gameScene.events.on('victory', this.showVictory, this);
    }
    
    shutdown() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.events) {
            gameScene.events.off('update-ui', this.updateUI, this);
            gameScene.events.off('game-over', this.showGameOver, this);
            gameScene.events.off('victory', this.showVictory, this);
        }
    }

    private updateUI(gold: number, hp: number, enemiesLeft: number) {
        if (!this.goldText || !this.goldText.scene) return;
        if (!this.hpText || !this.hpText.scene) return;
        if (!this.enemiesText || !this.enemiesText.scene) return;

        this.goldText.setText(`💰 ${gold}`);
        this.hpText.setText(`❤️ ${hp}`);
        this.enemiesText.setText(`👾 Осталось: ${Math.max(0, enemiesLeft)}`);
    }

    private showGameOver(spawned: number) {
        this.createOverlay(
            'ИГРА ОКОНЧЕНА',
            '#ef476f',
            `Уничтожено врагов: ${spawned - this.getAliveCount()}`
        );
    }

    private showVictory(hpLeft: number) {
        this.createOverlay(
            'ПОБЕДА!',
            '#06d6a0',
            `Все ${CONFIG.TOTAL_ENEMIES} врагов уничтожены! Осталось HP: ${hpLeft}`
        );
    }

    private getAliveCount(): number {
        const gameScene = this.scene.get('GameScene') as any;
        return gameScene.enemies ? gameScene.enemies.countActive(true) : 0;
    }

    private createOverlay(title: string, titleColor: string, subtitle: string) {
        this.add.rectangle(
            CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2,
            CONFIG.WIDTH, CONFIG.HEIGHT,
            0x000000, 0.7
        ).setDepth(200).setInteractive();

        this.add.text(
            CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 60,
            title,
            { fontSize: '56px', color: titleColor, fontStyle: 'bold' }
        ).setOrigin(0.5).setDepth(201);

        this.add.text(
            CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 20,
            subtitle,
            { fontSize: '24px', color: '#ffffff' }
        ).setOrigin(0.5).setDepth(201);

        const button = this.add.text(
            CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 100,
            'Начать заново',
            {
                fontSize: '28px',
                color: '#06d6a0',
                fontStyle: 'bold',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setDepth(201).setInteractive({ useHandCursor: true });

        button.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });
    }
}