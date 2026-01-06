// export const EVENTS = {
//     ATTACK_RESOLVED: "ATTACK_RESOLVED",
//     CREATURE_DAMAGED: "CREATURE_DAMAGED",
//     CREATURE_DIED: "CREATURE_DIED",
//     TURN_STARTED: "TURN_STARTED",
//     TURN_ENDED: "TURN_ENDED",
//     ATTACK_INIT: "ATTACK_INIT",
//     DAMAGE_DEALT: "DAMAGE_DEALT",
//     DEATH_PROCESS: "DEATH_PROCESS"
// };

export const EVENTS = {
    INIT: "INIT",
    TRANSITION_PHASE: "TRANSITION_PHASE",
    ERROR: "ERROR",
    ATTACK_INIT: "ATTACK_INIT",       // Початок замаху
    DAMAGE_DEALT: "DAMAGE_DEALT",     // Нанесення шкоди
    DEATH_PROCESS: "DEATH_PROCESS",   // Обробка смерті (видалення з дошки)
    TURN_START: "TURN_START",         // Початок ходу (для тригерів)
    GAME_OVER: "GAME_OVER"
};

export const PHASES = {
    DEPLOY_PLAYER: "DEPLOY_PLAYER",
    BATTLE_PLAYER: "BATTLE_PLAYER",
    BATTLE_ENEMY: "BATTLE_ENEMY",
    GAME_OVER: "GAME_OVER"
};

export const INTENTS = {
    DEPLOY_CARD: "DEPLOY_CARD",
    ATTACK: "ATTACK",
    END_PHASE: "END_PHASE"
};