import { RARITY, TRAIT_TYPES } from "./constants";
import { EFFECT_ACTIONS, TARGET_TYPES } from "./constants";

// Заклинаннями будуть аналоги карт таро - щоб розіграти потрібні умови на полі. Якщо будуть. Можливо.

export const CARDS = [
    {
        id: "c_peasant_01",
        name: "Peasant",
        cost: 2,
        rarity: RARITY.COMMON,
        stats: { attack: 2, health: 3, armor: 1 },
        image: "/images/bio/peasant.png",
        description: ' "- Ach vy svine take!" ',
        traits: []
    },
    {
        id: "c_goblin_02",
        name: "Goblin",
        cost: 2,
        rarity: RARITY.COMMON,
        stats: { attack: 3, health: 2, armor: 0 },
        image: "/images/bio/goblin.png",
        description: "Truly an eco-friendly creation.",
        traits: []
    },
    {
        id: "c_spirit_03",
        name: "Restless Spirit",
        cost: 3,
        rarity: RARITY.RARE,
        stats: { attack: 6, health: 6, armor: 0 },
        image: "/images/bio/spirit.png",
        description: "Has not much time.",
        traits: [
            { type: TRAIT_TYPES.PERISHING, value: 2 }
        ]
    },
    {
        id: "c_tower_04",
        name: "Water Tower",
        cost: 3,
        rarity: RARITY.COMMON,
        stats: { attack: 1, health: 8, armor: 0 },
        image: "/images/bio/water_tower.png",
        description: "Defend building, contains water.",
        traits: [
            { type: TRAIT_TYPES.INSENSATE },
            { type: TRAIT_TYPES.TAUNT }
        ]
    },
    {
        id: "c_natrix_05",
        name: "Natrix",
        cost: 4,
        rarity: RARITY.RARE,
        stats: { attack: 3, health: 4, armor: 0 },
        image: "/images/bio/natrix.png",
        traits: [
            { type: TRAIT_TYPES.STEALTH },
        ]
    },
    {
        id: "c_mole_06",
        name: "Dire Mole",
        cost: 1,
        rarity: RARITY.COMMON,
        stats: { attack: 1, health: 3, armor: 0 },
        image: "/images/bio/mole.png",
        traits: []
    },
    {
        id: "c_pupbot_07",
        name: "Pupbot",
        cost: 2,
        rarity: RARITY.COMMON,
        stats: { attack: 2, health: 1, armor: 0 },
        image: "/images/bio/pupbot.png",
        description: "A good boy.",
        traits: [
            { type: TRAIT_TYPES.GLASS_FRAME },
        ]
    },
    {
        id: "c_nerubian_egg_08",
        name: "Nerubian Egg",
        cost: 1,
        rarity: RARITY.RARE,
        stats: { attack: 0, health: 2, armor: 0 },
        image: "/images/bio/nerubian-egg.png",
        description: "What a little shiny egg.",
        traits: [
            {
                type: TRAIT_TYPES.DEATHRATTLE,
                action: EFFECT_ACTIONS.SUMMON, // Двигун знає: при смерті -> викликати
                payload: {
                    cardId: "c_nerubian_09", // Кого викликати
                    count: 1
                }
            }
        ]
    },
    {
        id: "c_nerubian_09",
        name: "Nerubian",
        cost: 2,
        rarity: RARITY.COMMON,
        stats: { attack: 4, health: 4, armor: 0 },
        image: "/images/bio/nerubian.png",
        traits: []
    },
    {
        id: "c_maduro_10",
        name: "Maduro Shieldmasta",
        cost: 3,
        rarity: RARITY.COMMON,
        stats: { attack: 3, health: 7, armor: 1 },
        image: "/images/bio/maduro.png",
        traits: [
            { type: TRAIT_TYPES.TAUNT },
        ]
    },
    {
        id: "c_onix_11",
        name: "Onix the Drago",
        cost: 5,
        rarity: RARITY.EPIC,
        stats: { attack: 3, health: 6, armor: 2 },
        image: "/images/bio/onix.png",
        description: "Legendary hero.",
        traits: [
            { type: TRAIT_TYPES.DOUBLE_ATTACK },
            { type: TRAIT_TYPES.GLASS_FRAME }
        ]
    },
    {
        id: "c_menagerie-jug_12",
        name: "Menagerie Jug",
        cost: 4,
        rarity: RARITY.RARE,
        stats: { attack: 3, health: 3, armor: 0 },
        image: "/images/bio/menagerie-jug.png",
        description: "Freshy.",
        traits: [
            {
                type: TRAIT_TYPES.BATTLECRY,
                action: EFFECT_ACTIONS.BUFF_STATS,
                payload: {
                    attack: 1,
                    health: 1,
                    targetType: TARGET_TYPES.RANDOM_ALLY,
                    count: 2,           // Кількість цілей
                    excludeSelf: true   // Чи може бафнути сам себе? Зазвичай глечик бафає інших.
                }
            }
        ]
    },
    {
        id: "c_boulderfist-ogre_13",
        name: "Boulderfist Ogre",
        cost: 4,
        rarity: RARITY.COMMON,
        stats: { attack: 6, health: 6, armor: 0 },
        image: "/images/bio/boulderfist-ogre.png",
        traits: []
    },
    {
        id: "c_ember_14",
        name: "Glowing Ember",
        cost: 1,
        rarity: RARITY.COMMON,
        stats: { attack: 1, health: 1, armor: 0 },
        image: "/images/bio/ember.png",
        traits: [
            { type: TRAIT_TYPES.TAUNT },
            { type: TRAIT_TYPES.GLASS_FRAME }
        ]
    },
    {
        id: "c_Verminaard_15",
        name: "Verminaard",
        cost: 5,
        rarity: RARITY.EPIC,
        stats: { attack: 6, health: 9, armor: 2 },
        image: "/images/bio/verminaard.png",
        description: "Dead king.",
        traits: [
            { type: TRAIT_TYPES.GLASS_FRAME }
        ]
    },
    {
        id: "c_barb_16",
        name: "Vitya",
        cost: 4,
        rarity: RARITY.RARE,
        stats: { attack: 7, health: 4, armor: 0 },
        image: "/images/bio/barb.png",
        description: "Momma's best boy.",
        traits: []
    },
    {
        id: "c_croco_17",
        name: "River Crocodile",
        cost: 3,
        rarity: RARITY.COMMON,
        stats: { attack: 3, health: 6, armor: 1 },
        image: "/images/bio/croco.png",
        traits: []
    },
    {
        id: "c_castle_cannon_18",
        name: "Castle Cannon",
        cost: 3,
        rarity: RARITY.COMMON,
        stats: { attack: 1, health: 5, armor: 0 },
        image: "/images/bio/castle_cannon.png",
        projectileType: "cannonball",
        traits: [
            {
                type: TRAIT_TYPES.BATTLECRY,
                action: EFFECT_ACTIONS.DAMAGE,
                payload: {
                    amount: 3,
                    targetType: TARGET_TYPES.RANDOM_ENEMY,
                    count: 1           // Кількість цілей
                }
            },
            { type: TRAIT_TYPES.INSENSATE }
        ]
    },
    {
        id: "c_wild-bear_19",
        name: "Wild Bear",
        cost: 3,
        rarity: RARITY.COMMON,
        stats: { attack: 5, health: 5, armor: 0 },
        image: "/images/bio/wild_bear.png",
        traits: [
            { type: TRAIT_TYPES.TAUNT }
        ]
    },
    {
        id: "c_frozen_elemental_20",
        name: "Frozen Elemental",
        cost: 3,
        rarity: RARITY.RARE,
        stats: { attack: 2, health: 6, armor: 0 },
        image: "/images/bio/frozen_elemental.png",
        description: "Always being frozen.",
        traits: [
            { type: TRAIT_TYPES.TAUNT },
            { type: TRAIT_TYPES.INSENSATE }
        ]
    },
    {
        id: "c_old_turtle_21",
        name: "Papa Turtle",
        cost: 3,
        rarity: RARITY.COMMON,
        stats: { attack: 3, health: 4, armor: 1 },
        image: "/images/bio/old_turtle.png",
        traits: [
            {
                type: TRAIT_TYPES.BATTLECRY,
                action: EFFECT_ACTIONS.SUMMON,
                payload: {
                    cardId: "c_young_turtle_22",
                    count: 1
                }
            }
        ]
    },
    {
        id: "c_young_turtle_22",
        name: "Baby Turtle",
        cost: 1,
        rarity: RARITY.COMMON,
        stats: { attack: 1, health: 2, armor: 1 },
        image: "/images/bio/young_turtle.png",
        traits: []
    },
];

// Допоміжна функція для швидкого пошуку
export const getCardById = (id) => CARDS.find(c => c.id === id);