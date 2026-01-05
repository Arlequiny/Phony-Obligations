import { PHASES } from "../types";
import { LEVELS } from "../../data/levels";
import { getCardById } from "../../data/cards";
import { v4 as uuidv4 } from 'uuid';

export function createInitialState(levelId) {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) throw new Error(`Level ${levelId} not found`);

    // 1. Формуємо руку гравця
    let hand = [];
    if (level.config.playerHand.type === "fixed") {
        hand = level.config.playerHand.cardIds.map(id => createCardInstance(id));
    } else {
        // Тут пізніше буде рандом
        console.warn("Random hand not implemented yet");
    }

    // 2. Формуємо стіл ворога
    const enemySlots = Array(7).fill(null);
    level.enemyBoard.forEach(setup => {
        if (setup.slotIndex >= 0 && setup.slotIndex < 7) {
            enemySlots[setup.slotIndex] = createCardInstance(setup.cardId);
        }
    });

    return {
        meta: {
            levelId: level.id,
            turn: "DEPLOY",
            isGameOver: false
        },
        phase: PHASES.DEPLOY_PLAYER,
        player: {
            money: level.initialMoney,
            hand: hand, // Масив об'єктів карток
            board: Array(7).fill(null) // 7 пустих слотів
        },
        enemy: {
            money: 0, // У ворога поки немає економіки
            hand: [],
            board: enemySlots
        }
    };
}

// Перетворює статичні дані картки на унікальний ігровий об'єкт
function createCardInstance(cardId) {
    const baseCard = getCardById(cardId);
    if (!baseCard) throw new Error(`Card ${cardId} not found in database`);

    return {
        instanceId: uuidv4(), // Унікальний ID для кожної копії (щоб розрізняти двох однакових ополченців)
        cardId: baseCard.id,
        name: baseCard.name,
        stats: { ...baseCard.stats }, // Копіюємо статти, щоб можна було змінювати (damage/buff)
        currentStats: { ...baseCard.stats }, // Поточні статти (поранення)
        traits: baseCard.traits,
        description: baseCard.description,
        image: baseCard.image,
        cost: baseCard.cost,
        canAttack: false,
        hasAttacked: false,
        isDead: false
    };
}