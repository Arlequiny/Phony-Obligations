import { INTENTS } from "../types.js";

export function computeEnemyTurn(state) {
    const intents = [];
    const { enemy, player } = state;

    // 1. Знаходимо всіх ворогів, які можуть ходити (зліва направо)
    enemy.board.forEach((attacker, attackerIndex) => {
        if (!attacker) return; // Пустий слот
        if (attacker.hasAttacked) return; // Вже ходив (хоча на початку ходу всі свіжі)

        // 2. Знаходимо валідні цілі у гравця
        // (Тут пізніше додамо фільтр по Taunt)
        const validTargets = [];
        player.board.forEach((defender, defenderIndex) => {
            if (defender) {
                validTargets.push(defender);
            }
        });

        if (validTargets.length === 0) return; // Нема кого бити

        // 3. Вибираємо випадкову ціль
        const randomTarget = validTargets[Math.floor(Math.random() * validTargets.length)];

        // 4. Формуємо намір
        intents.push({
            type: INTENTS.ATTACK,
            attackerInstanceId: attacker.instanceId,
            defenderInstanceId: randomTarget.instanceId
        });
    });

    // 5. В кінці ворог завжди передає хід назад
    intents.push({
        type: INTENTS.END_PHASE
    });

    return intents;
}