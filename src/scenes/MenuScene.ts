import Phaser from 'phaser';
import { CONFIG } from '../config';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Фон
        this.add.rectangle(
            CONFIG.WIDTH / 2,
            CONFIG.HEIGHT / 2,
            CONFIG.WIDTH,
            CONFIG.HEIGHT,
            CONFIG.COLORS.BG
        );

        // Декоративный кристалл в углу
        const crystal = this.add.image(CONFIG.WIDTH - 120, 100, 'crystal')
            .setScale(2)
            .setAlpha(0.6);
        this.tweens.add({
            targets: crystal,
            scale: 2.2,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Заголовок
        this.add.text(
            CONFIG.WIDTH / 2,
            100,
            'ЗАЩИТА КРИСТАЛЛА',
            {
                fontSize: '64px',
                color: '#4ea8de',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        // Подзаголовок
        this.add.text(
            CONFIG.WIDTH / 2,
            160,
            'Tower Defense',
            {
                fontSize: '24px',
                color: '#aaaacc',
                fontStyle: 'italic'
            }
        ).setOrigin(0.5);

        // Блок с правилами
        this.createRulesBlock();

        // Кнопка «Начать игру»
        this.createStartButton();
    }

    private createRulesBlock() {
        const rulesX = CONFIG.WIDTH / 2;
        const rulesY = 280;

        // Полупрозрачная панель под правила
        this.add.rectangle(
            rulesX,
            rulesY + 80,
            700,
            280,
            0x1a1a2e,
            0.7
        ).setStrokeStyle(2, 0x4ea8de, 0.5);

        // Заголовок правил
        this.add.text(
            rulesX,
            rulesY - 20,
            '📜 ПРАВИЛА ИГРЫ',
            {
                fontSize: '28px',
                color: '#ffd166',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        const rules = [
            '🎯 Цель: уничтожить всех врагов до того, как они дойдут до кристалла.',
            '❤️ У вас есть 5 жизней. Каждый пропущенный враг отнимает 1 жизнь.',
            '🏰 Кликните по синему слоту, чтобы построить башню (50 золота).',
            '💰 За каждого убитого врага вы получаете 15 золота.',
            '⚔️ Башни автоматически атакуют врагов в радиусе действия.',
            '🏆 Победа — когда все враги уничтожены и кристалл цел!'
        ];

        const lineStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontSize: '15px',
            color: '#ffffff',
            wordWrap: { width: 640 },
            lineSpacing: 8
        };

        rules.forEach((rule, i) => {
            this.add.text(
                rulesX - 320,
                rulesY + 20 + i * 32,
                rule,
                lineStyle
            );
        });
    }

    private createStartButton() {
        const button = this.add.text(
            CONFIG.WIDTH / 2,
            CONFIG.HEIGHT - 110,
            '▶  НАЧАТЬ ИГРУ',
            {
                fontSize: '36px',
                color: '#06d6a0',
                fontStyle: 'bold',
                backgroundColor: '#000000',
                padding: { x: 40, y: 18 }
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Пульсация кнопки
        this.tweens.add({
            targets: button,
            scale: 1.06,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Эффекты при наведении
        button.on('pointerover', () => {
            button.setColor('#ffd166');
            button.setBackgroundColor('#222222');
        });

        button.on('pointerout', () => {
            button.setColor('#06d6a0');
            button.setBackgroundColor('#000000');
        });

        // Запуск игры
        button.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('GameScene');
            this.scene.launch('UIScene');
        });
    }
}