import { applyDamage } from "../utils/damage";

function getAliveIndices(slots) {
    return slots
        .map((c, i) => (c ? i : null))
        .filter(i => i !== null);
}

export function resolveEnemyTurn(state) {
    let playerSlots = [...state.player.board.slots];
    let enemySlots = [...state.enemy.board.slots];

    for (let enemyIndex = 0; enemyIndex < enemySlots.length; enemyIndex++) {
        let enemy = enemySlots[enemyIndex];
        if (!enemy) continue;

        const possibleTargets = getAliveIndices(playerSlots);
        if (possibleTargets.length === 0) break;

        const targetIndex =
            possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

        let target = playerSlots[targetIndex];

        // взаємний урон
        target = applyDamage(target, enemy.attack);
        enemy = applyDamage(enemy, target.attack);

        // оновлення слотів
        playerSlots[targetIndex] =
            target.health > 0 ? target : null;

        enemySlots[enemyIndex] =
            enemy.health > 0 ? enemy : null;
    }

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
