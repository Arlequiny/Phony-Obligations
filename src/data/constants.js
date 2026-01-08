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
    BATTLECRY: "battlecry",         // runs every start of round
    DEATHRATTLE: "deathrattle",     // runs upon death
    TAUNT: "taunt",                 // can be the only target
    GLASS_FRAME: "glass_frame",     // the first damage = 0
    DOUBLE_ATTACK: "double_attack", // can attack 2 times per turn
    PERISHING: "perishing",         // dies upon N turns
    STEALTH: "stealth",             // can be targeted upon first attack
    INSENSATE: "insensate"          // buildings
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