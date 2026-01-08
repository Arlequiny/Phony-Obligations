export const LEVELS = [
    // РІВЕНЬ 1: "Розминка"
    // Мета: Навчитись атакувати і знищувати слабких ворогів.
    {
        id: "level-1",
        name: "Rat Infestation",
        description: "Clearing the cellar from pests.",
        initialMoney: 5,
        enemyHeroHealth: 20,
        config: {
            playerHand: {
                type: "fixed",
                cardIds: ["c_peasant_01", "c_peasant_01", "c_goblin_02", "c_mole_06"]
            }
        },
        enemyBoard: [
            { slotIndex: 2, cardId: "c_mole_06" }, // Слабкий кріт
            { slotIndex: 4, cardId: "c_mole_06" },
            { slotIndex: 5, cardId: "c_peasant_01" } // Селянин-зрадник
        ],
        reward: 50,
        unlocks: "level-2"
    },

    // РІВЕНЬ 2: "Стіна"
    // Мета: Познайомити гравця з TAUNT (Провокацією).
    // Гравець змушений пробивати Вежу, перш ніж дістатись до Гобліна.
    {
        id: "level-2",
        name: "The Blockade",
        description: "A heavy tower blocks the path.",
        initialMoney: 12,
        enemyHeroHealth: 25,
        config: {
            playerHand: {
                type: "fixed",
                cardIds: ["c_goblin_02", "c_goblin_02", "c_wild-bear_19", "c_maduro_10"]
            }
        },
        enemyBoard: [
            { slotIndex: 3, cardId: "c_tower_04" }, // 1/8 TAUNT (Вежа по центру)
            { slotIndex: 2, cardId: "c_goblin_02" }, // Гоблін ховається поруч (але його не можна бити першим)
            { slotIndex: 4, cardId: "c_goblin_02" }
        ],
        reward: 75,
        unlocks: "level-3"
    },

    // РІВЕНЬ 3: "Тіні та Скло"
    // Мета: Познайомити зі STEALTH та GLASS FRAME.
    // Натрікс не можна бити, а Папбота треба вдарити двічі.
    {
        id: "level-3",
        name: "Shadows & Glass",
        description: "Tricky enemies ahead.",
        initialMoney: 15,
        enemyHeroHealth: 30,
        config: {
            playerHand: {
                type: "fixed",
                cardIds: ["c_onix_11", "c_ember_14", "c_ember_14", "c_pupbot_07"]
                // Онікс (Double Attack) ідеальний, щоб збити скло і вдарити
            }
        },
        enemyBoard: [
            { slotIndex: 1, cardId: "c_natrix_05" }, // Stealth
            { slotIndex: 3, cardId: "c_pupbot_07" }, // Glass Frame
            { slotIndex: 5, cardId: "c_pupbot_07" }  // Glass Frame
        ],
        reward: 100,
        unlocks: "level-4"
    },

    // РІВЕНЬ 4: "Павуче лігво"
    // Мета: DEATHRATTLE. Гравцю треба думати, чи варто вбивати яйця зараз.
    {
        id: "level-4",
        name: "The Spider's Nest",
        description: "Don't wake them up...",
        initialMoney: 20,
        enemyHeroHealth: 40,
        config: {
            playerHand: {
                type: "fixed",
                cardIds: ["c_castle_cannon_18", "c_spirit_03", "c_croco_17", "c_old_turtle_21"]
            }
        },
        enemyBoard: [
            { slotIndex: 2, cardId: "c_nerubian_egg_08" }, // Яйце 0/2 -> Павук 4/4
            { slotIndex: 3, cardId: "c_menagerie-jug_12" }, // Глечик, що бафає яйця (небезпечна комба!)
            { slotIndex: 4, cardId: "c_nerubian_egg_08" }
        ],
        reward: 150,
        unlocks: "level-5"
    },

    // РІВЕНЬ 5: "Облога Замку" (Бос)
    // Мета: Складна комбінація. Гармата стріляє щоходу, захищена двома танками.
    {
        id: "level-5",
        name: "Castle Siege",
        description: "Break their defenses!",
        initialMoney: 25,
        enemyHeroHealth: 60,
        config: {
            playerHand: {
                type: "fixed",
                cardIds: ["c_Verminaard_15", "c_barb_16", "c_onix_11", "c_spirit_03", "c_spirit_03"]
                // Даємо важку артилерію гравцю
            }
        },
        enemyBoard: [
            { slotIndex: 1, cardId: "c_frozen_elemental_20" }, // Taunt + Insensate
            { slotIndex: 3, cardId: "c_castle_cannon_18" },    // Main Threat (DPS)
            { slotIndex: 5, cardId: "c_maduro_10" }            // Taunt
        ],
        reward: 300,
        unlocks: null // Фінал
    }
];

export const getLevelById = (id) => LEVELS.find(l => l.id === id);