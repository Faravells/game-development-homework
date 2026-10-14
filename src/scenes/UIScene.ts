import Phaser from 'phaser';
import { CONFIG } from '../config';

export class UIScene extends Phaser.Scene {
    private goldText!: Phaser.GameObjects.Text;
    private hpText!: Phaser.GameObjects.Text;

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

        // Подсказка
        this.add.text(
            CONFIG.WIDTH / 2,
            CONFIG.HEIGHT - 30,
            'Кликните по слоту, чтобы построить башню (50 золота)',
            {
                fontSize: '18px',
                color: '#aaaacc',
                fontStyle: 'italic'
            }
        ).setOrigin(0.5);

        // Подписка на события из GameScene
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('update-ui', this.updateUI, this);
        gameScene.events.on('game-over', this.showGameOver, this);
    }

    private updateUI(gold: number, hp: number, wave: number) {
        this.goldText.setText(`💰 ${gold}`);
        this.hpText.setText(`❤️ ${hp}`);
    }

    private showGameOver(wave: number) {
        const overlay = this.add.rectangle(
            CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2,
            CONFIG.WIDTH, CONFIG.HEIGHT,
            0x000000, 0.7
        ).setDepth(200);

        const title = this.add.text(
            CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 60,
            'ИГРА ОКОНЧЕНА',
            { fontSize: '56px', color: '#ef476f', fontStyle: 'bold' }
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
            this.scene.start('BootScene');
        });

        overlay.setInteractive();
    }
}