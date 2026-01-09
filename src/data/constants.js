export const RARITY = {
    COMMON: "common",
    RARE: "rare",
    EPIC: "epic"
};

export const KILL_REWARDS = {
    [RARITY.COMMON]: 1,
    [RARITY.RARE]: 2,
    [RARITY.EPIC]: 3
};

export const TRAIT_TYPES = {
    BATTLECRY: "BATTLECRY",         // runs every start of round
    DEATHRATTLE: "DEATHRATTLE",     // runs upon death
    TAUNT: "TAUNT",                 // can be the only target
    GLASS_FRAME: "GLASS_FRAME",     // the first damage = 0
    DOUBLE_ATTACK: "DOUBLE_ATTACK", // can attack 2 times per turn
    PERISHING: "PERISHING",         // dies upon N turns
    STEALTH: "STEALTH",             // can be targeted upon first attack
    INSENSATE: "INSENSATE"          // buildings
};

export const EFFECT_ACTIONS = {
    SUMMON: "summon",
    BUFF_STATS: "buff_stats",
    DAMAGE: "damage",
    HEAL: "heal",               // gives health but no more than the maximum
    GLASSING: "glassing"        // gives glass frame
};

export const TARGET_TYPES = {
    SELF: "self",
    RANDOM_ALLY: "random_ally",
    ALL_ALLIES: "all_allies",
    RANDOM_ENEMY: "random_enemy",
    ALL_ENEMIES: "all_enemies"
};