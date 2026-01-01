import { applyDamage } from "../utils/damage";

export function resolveAttack(state, attackerIndex, defenderIndex) {
    const attackId = crypto.randomUUID();
    const playerSlots = [...state.player.board.slots];
    const enemySlots = [...state.enemy.board.slots];

    let attacker = playerSlots[attackerIndex];
    let defender = enemySlots[defenderIndex];

    if (!attacker || !defender) return state;

    const damageEvents = [];

    const defenderResult = applyDamage(defender, attacker.attack);
    defender = defenderResult.creature;

    if (defenderResult.damage > 0) {
        damageEvents.push({
            target: "enemy",
            slotIndex: defenderIndex,
            amount: defenderResult.damage
        });
    }

    const attackerResult = applyDamage(attacker, defender.attack);
    attacker = attackerResult.creature;

    if (attackerResult.damage > 0) {
        damageEvents.push({
            target: "player",
            slotIndex: attackerIndex,
            amount: attackerResult.damage
        });
    }

    attacker = {
        ...attacker,
        hasAttacked: true
    };

    const deaths = [];

    if (attacker.health <= 0) {
        deaths.push({ target: "player", slotIndex: attackerIndex });
    }
    if (defender.health <= 0) {
        deaths.push({ target: "enemy", slotIndex: defenderIndex });
    }

    playerSlots[attackerIndex] =
        attacker.health > 0 ? attacker : null;

    enemySlots[defenderIndex] =
        defender.health > 0 ? defender : null;

    return {
        ...state,
        player: {
            ...state.player,
            board: { ...state.player.board, slots: playerSlots }
        },
        enemy: {
            ...state.enemy,
            board: { ...state.enemy.board, slots: enemySlots }
        },
        damageEvents,
        deaths,
        lastAttack: {
            id: attackId,
            attacker: attackerIndex,
            defender: defenderIndex
        }
    };
}
