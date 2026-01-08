import { INTENTS } from "../types";
import { TRAIT_TYPES } from "../../data/constants"; // Імпорт констант

export function computeEnemyTurn(state) {
    const intents = [];
    const { enemy, player } = state;

    // 1. Аналіз столу гравця: Чи є Провокатори?
    // Перевіряємо масив traits на наявність типу TAUNT
    const tauntUnits = player.board.filter(unit =>
        unit && unit.traits && unit.traits.some(t => t.type === TRAIT_TYPES.TAUNT)
    );

    const hasTaunt = tauntUnits.length > 0;

    // 2. Проходимо по істотах ворога
    enemy.board.forEach((attacker) => {
        if (!attacker) return;
        if (attacker.hasAttacked) return;

        // Пропускаємо "Неживих" (INSENSATE) та з 0 атаки
        if (attacker.traits.some(t => t.type === TRAIT_TYPES.INSENSATE)) return;
        if (attacker.currentStats.attack <= 0) return;

        // 3. Визначаємо пул валідних цілей
        let validTargets = [];

        if (hasTaunt) {
            // Якщо є танк - б'ємо тільки танків
            validTargets = tauntUnits;
        } else {
            // Якщо немає - б'ємо будь-кого живого, крім тих, хто в "Скритності" (STEALTH)
            // (Скритність додамо пізніше, поки просто всіх живих)
            validTargets = player.board.filter(u =>
                u !== null &&
                !u.traits.some(t => t.type === TRAIT_TYPES.STEALTH)
            );
        }

        if (validTargets.length === 0) return;

        // 4. Вибираємо ціль (поки що рандомно з доступних)
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];

        intents.push({
            type: INTENTS.ATTACK,
            attackerInstanceId: attacker.instanceId,
            defenderInstanceId: target.instanceId
        });
    });

    intents.push({ type: INTENTS.END_PHASE });
    return intents;
}