import { applyDamage } from "../utils/damage";

export function resolveAttack(state, attackerIndex, defenderIndex) {
    const playerSlots = [...state.player.board.slots];
    const enemySlots = [...state.enemy.board.slots];

    let attacker = playerSlots[attackerIndex];
    let defender = enemySlots[defenderIndex];

    if (!attacker || !defender) return state;

    // 1️⃣ Взаємний урон
    defender = applyDamage(defender, attacker.attack);
    attacker = applyDamage(attacker, defender.attack);

    // 2️⃣ Помічаємо, що атакував
    attacker = {
        ...attacker,
        hasAttacked: true
    };

    // 3️⃣ Оновлюємо слоти
    playerSlots[attackerIndex] =
        attacker.health > 0 ? attacker : null;

    enemySlots[defenderIndex] =
        defender.health > 0 ? defender : null;

    return {
        ...state,
        player: {
            ...state.player,
            board: {
                ...state.player.board,
                slots: playerSlots
            }
        },
        enemy: {
            ...state.enemy,
            board: {
                ...state.enemy.board,
                slots: enemySlots
            }
        }
    };
}
