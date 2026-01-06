import {EVENTS} from "../types";
import {KILL_REWARDS, RARITY} from "../../data/constants";

export function resolveAttack(initialState, { attackerInstanceId, defenderInstanceId }) {
    const transitions = [];

    // 1. Пошук карток
    const findCard = (state, instanceId) => {
        let index = state.player.board.findIndex(c => c?.instanceId === instanceId);
        if (index !== -1) return { owner: "player", index, card: state.player.board[index] };

        index = state.enemy.board.findIndex(c => c?.instanceId === instanceId);
        if (index !== -1) return { owner: "enemy", index, card: state.enemy.board[index] };

        return null;
    };

    const attackerLoc = findCard(initialState, attackerInstanceId);
    const defenderLoc = findCard(initialState, defenderInstanceId);

    if (!attackerLoc || !defenderLoc) {
        console.warn("Cards not found");
        return { finalState: initialState, transitions: [] };
    }

    let currentState = initialState;

    // --- ФАЗА 1: Ініціація ---
    transitions.push({
        type: EVENTS.ATTACK_INIT,
        payload: {
            attacker: { owner: attackerLoc.owner, index: attackerLoc.index },
            defender: { owner: defenderLoc.owner, index: defenderLoc.index }
        }
    });

    // --- ФАЗА 2: Розрахунок ---
    const attCard = attackerLoc.card;
    const defCard = defenderLoc.card;

    // Беремо атаку з currentStats (бо можуть бути бафи)
    const damageToDefender = attCard.currentStats.attack;
    const damageToAttacker = defCard.currentStats.attack;

    // Застосовуємо шкоду
    const newDefender = applyDamage(defCard, damageToDefender);
    const newAttacker = applyDamage(attCard, damageToAttacker);

    // Маркуємо атаку
    newAttacker.hasAttacked = true;

    // Оновлюємо стейт (ЖИВІ, АЛЕ ПОБИТІ)
    const stateAfterDamage = cloneStateWithUpdates(currentState, [
        { owner: attackerLoc.owner, index: attackerLoc.index, card: newAttacker },
        { owner: defenderLoc.owner, index: defenderLoc.index, card: newDefender }
    ]);

    transitions.push({
        type: EVENTS.DAMAGE_DEALT,
        state: stateAfterDamage,
        payload: {
            hits: [
                { owner: defenderLoc.owner, index: defenderLoc.index, damage: damageToDefender },
                { owner: attackerLoc.owner, index: attackerLoc.index, damage: damageToAttacker }
            ]
        }
    });

    currentState = stateAfterDamage;

// --- ФАЗА 3: Смерть та Нагороди ---
    const deaths = [];
    const updatesForDeath = [];

    // Функція обробки смерті
    const processDeath = (deadCardLoc, killerLoc) => {
        deaths.push({ owner: deadCardLoc.owner, index: deadCardLoc.index });
        updatesForDeath.push({ owner: deadCardLoc.owner, index: deadCardLoc.index, card: null });

        // НАРАХУВАННЯ ГРОШЕЙ
        // Якщо вбив гравець (killer.owner === 'player') - даємо гроші
        // АБО: Зазвичай гроші дають тільки ГРАВЦЮ за вбивство ворогів.
        if (deadCardLoc.owner === "enemy") {
            // Треба оновити гроші гравця.
            // УВАГА: Ми не можемо просто написати currentState.player.money +=... бо це мутація
            // Нам треба буде врахувати це при створенні stateAfterDeath
            return KILL_REWARDS[deadCardLoc.card.rarity] || KILL_REWARDS[RARITY.COMMON];
        }
        return 0;
    };

    let moneyEarned = 0;

    // Перевірка смерті Атакуючого
    if (newAttacker.currentStats.health <= 0) {
        moneyEarned += processDeath(attackerLoc, defenderLoc);
    }

    // Перевірка смерті Захисника
    if (newDefender.currentStats.health <= 0) {
        moneyEarned += processDeath(defenderLoc, attackerLoc);
    }

    if (deaths.length > 0) {
        // Створюємо фінальний стейт з урахуванням смертей І грошей
        let stateAfterDeath = cloneStateWithUpdates(currentState, updatesForDeath);

        // Додаємо гроші
        if (moneyEarned > 0) {
            stateAfterDeath = {
                ...stateAfterDeath,
                player: {
                    ...stateAfterDeath.player,
                    money: stateAfterDeath.player.money + moneyEarned
                }
            };
        }

        // Запам'ятовуємо, що гравець втратив істоту (для Рятівного Деплою)
        const playerLostCreature = deaths.some(d => d.owner === "player");
        if (playerLostCreature) {
            stateAfterDeath.meta.playerDiedThisTurn = true;
        }

        transitions.push({
            type: EVENTS.DEATH_PROCESS,
            state: stateAfterDeath,
            payload: { deaths, moneyEarned } // Передаємо інфо про смерть
        });

        currentState = stateAfterDeath;
    }

    return { finalState: currentState, transitions };
}



function applyDamage(card, amount) {
    // Працюємо виключно з currentStats
    const stats = { ...card.currentStats };
    let remainingDamage = amount;

    // 1. Броня
    if (stats.armor > 0 && remainingDamage > 0) {
        const absorb = Math.min(stats.armor, remainingDamage);
        stats.armor -= absorb;
        remainingDamage -= absorb;
    }

    // 2. Здоров'я
    if (remainingDamage > 0) {
        stats.health = Math.max(0, stats.health - remainingDamage);
    }

    return {
        ...card,
        currentStats: stats
    };
}

function cloneStateWithUpdates(state, updates) {
    const newState = {
        ...state,
        player: { ...state.player, board: [...state.player.board] },
        enemy: { ...state.enemy, board: [...state.enemy.board] }
    };

    updates.forEach(({ owner, index, card }) => {
        newState[owner].board[index] = card;
    });

    return newState;
}