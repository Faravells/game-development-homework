export const CONFIG = {
    // Размеры
    WIDTH: 1024,
    HEIGHT: 768,
    TILE_SIZE: 64,

    // Экономика
    START_GOLD: 150,
    START_HP: 20,
    GOLD_PER_KILL: 15,
    TOWER_COST: 50,

    // Башня
    TOWER_RANGE: 180,
    TOWER_FIRE_RATE: 800, // мс между выстрелами
    TOWER_DAMAGE: 25,

    // Враг
    ENEMY_HP: 100,
    ENEMY_SPEED: 60, // пикселей в секунду
    ENEMY_SPAWN_DELAY: 1500, // мс

    // Цвета (hex)
    COLORS: {
        BG: 0x2d2d44,
        PATH: 0x4a4a6a,
        TOWER: 0x4ea8de,
        TOWER_RANGE: 0x4ea8de,
        ENEMY: 0xef476f,
        BULLET: 0xffd166,
        CRYSTAL: 0x06d6a0,
        SLOT: 0x3a3a5a,
        TEXT: '#ffffff'
    }
};