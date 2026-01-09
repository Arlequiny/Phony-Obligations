import {EFFECT_ACTIONS, TARGET_TYPES, TRAIT_TYPES} from "../../data/constants";
import {getCardById} from "../../data/cards"; // Треба експортувати цю функцію з cards.js

// Генеруємо випадковий ID для нових істот
const generateId = () => Math.random().toString(36).substr(2, 9);

export function resolveEffect(state, effect, sourceCard, sourceOwner) {
    let newState = { ...state };
    let affectedTargets = [];

    // 1. Визначаємо цілі
    const targets = findTargets(
        newState,
        effect.payload.targetType,
        sourceOwner,
        sourceCard,
        effect.payload.count,
        effect.payload.excludeSelf
    );

    // 2. Виконуємо дію
    switch (effect.action) {
        case EFFECT_ACTIONS.DAMAGE:
            targets.forEach(({ owner, index, card }) => {
                affectedTargets.push({ owner, index });

                // Працюємо виключно з currentStats
                const stats = { ...card.currentStats };
                let newTraits = [...card.traits];
                let remainingDamage = effect.payload.amount;

                const glassFrameIndex = newTraits.findIndex(t => t.type === TRAIT_TYPES.GLASS_FRAME);

                // 2. Скло
                if (glassFrameIndex !== -1 && effect.payload.amount > 0) {
                    newTraits.splice(glassFrameIndex, 1);
                    remainingDamage = 0;
                }

                // 2. Броня
                if (stats.armor > 0 && remainingDamage > 0) {
                    const absorb = Math.min(stats.armor, remainingDamage);
                    stats.armor -= absorb;
                    remainingDamage -= absorb;
                }

                // 3. Здоров'я
                if (remainingDamage > 0) {
                    stats.health = Math.max(0, stats.health - remainingDamage);
                }

                // Оновлюємо карту
                newState[owner].board[index] = {
                    ...card,
                    traits: newTraits,
                    currentStats: stats
                };
            });
            break;

        case EFFECT_ACTIONS.BUFF_STATS:
            targets.forEach(({ owner, index, card }) => {
                affectedTargets.push({ owner, index });

                newState[owner].board[index] = {
                    ...card,
                    currentStats: {
                        ...card.currentStats,
                        attack: card.currentStats.attack + (effect.payload.attack || 0),
                        health: card.currentStats.health + (effect.payload.health || 0)
                    }
                };
            });
            break;

        case EFFECT_ACTIONS.SUMMON: {
            // Сумон завжди йде на дошку власника (sourceOwner)
            const cardTemplateId = effect.payload.cardId;
            const count = effect.payload.count || 1;
            const template = getCardById(cardTemplateId);

            if (template) {
                for (let i = 0; i < count; i++) {
                    // Знаходимо пустий слот
                    const emptyIndex = newState[sourceOwner].board.findIndex(slot => slot === null);

                    if (emptyIndex !== -1) {
                        // Створюємо нову сутність (як в GameEngine)
                        newState[sourceOwner].board[emptyIndex] = {
                            ...template,
                            instanceId: generateId(),
                            currentStats: {...template.stats},
                            hasAttacked: true, // Сумони не атакують одразу (ривок - окрема механіка)
                            isJustDeployed: true,
                            traits: template.traits || [] // Важливо копіювати трейти
                        };
                    }
                }
            }
        }
            break;

        default:
            console.warn("Unknown effect action:", effect.action);
    }

    return { newState, affectedTargets };
}

// === ЛОГІКА ПОШУКУ ЦІЛЕЙ ===
function findTargets(state, targetType, sourceOwner, sourceCard, count = 1, excludeSelf = false) {
    const enemyOwner = sourceOwner === "player" ? "enemy" : "player";

    // Хелпер для збору всіх карт власника
    const getBoardCards = (owner) =>
        state[owner].board
            .map((card, index) => ({ card, index, owner }))
            .filter(item => item.card !== null);

    let candidates = [];

    switch (targetType) {
        case TARGET_TYPES.SELF: {
                // Шукаємо самого себе (потрібно знайти актуальний індекс)
                const selfLoc = state[sourceOwner].board.findIndex(c => c?.instanceId === sourceCard.instanceId);
                if (selfLoc !== -1) candidates.push({ card: state[sourceOwner].board[selfLoc], index: selfLoc, owner: sourceOwner });
                break;
            }

        case TARGET_TYPES.RANDOM_ENEMY:
        case TARGET_TYPES.ALL_ENEMIES:
            candidates = getBoardCards(enemyOwner);
            break;

        case TARGET_TYPES.RANDOM_ALLY:
        case TARGET_TYPES.ALL_ALLIES:
            candidates = getBoardCards(sourceOwner);
            break;

        default:
            return [];
    }

    if (excludeSelf) candidates = candidates.filter(c => c.card.instanceId !== sourceCard.instanceId);

    // Якщо це RANDOM - перемішуємо і беремо N
    if (targetType.includes("random")) {
        // Тасуємо (Fisher-Yates shuffle або просто sort random)
        const shuffled = candidates.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Якщо ALL - повертаємо всіх
    return candidates;
}