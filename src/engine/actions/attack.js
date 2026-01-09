import { EVENTS } from "../types";
import { KILL_REWARDS, RARITY, TRAIT_TYPES } from "../../data/constants";
import { resolveEffect } from "../systems/effectSystem";

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

    // Знімаємо маскування, якщо було
    let newAttackerTraits = [...newAttacker.traits];
    const stealthIndex = newAttackerTraits.findIndex(t => t.type === TRAIT_TYPES.STEALTH);
    if (stealthIndex !== -1) {
        newAttackerTraits.splice(stealthIndex, 1);
    }

    // Уточнюємо подвійну атаку
    const hasDoubleAttack = attCard.traits.some(t => t.type === TRAIT_TYPES.DOUBLE_ATTACK);
    let attacksCount = attCard.attacksCount || 0;
    attacksCount++;

    let hasAttacked = true;
    if (hasDoubleAttack && attacksCount < 2) {
        hasAttacked = false;
    }

    // Оновлюємо атакуючого
    const finalAttacker = {
        ...newAttacker,
        hasAttacked: hasAttacked,
        attacksCount: attacksCount,
        traits: newAttackerTraits
    };

    // Оновлюємо стейт (ЖИВІ, АЛЕ ПОБИТІ)
    const stateAfterDamage = cloneStateWithUpdates(currentState, [
        { owner: attackerLoc.owner, index: attackerLoc.index, card: finalAttacker },
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
    const processDeath = (deadCardLoc) => {
        const hasDeathrattle = deadCardLoc.card.traits.some(t => t.type === TRAIT_TYPES.DEATHRATTLE);
        deaths.push({
            owner: deadCardLoc.owner,
            index: deadCardLoc.index,
            hasDeathrattle: hasDeathrattle
        });
        updatesForDeath.push({
            owner: deadCardLoc.owner,
            index: deadCardLoc.index,
            card: null
        });

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
    if (finalAttacker.currentStats.health <= 0) {
        moneyEarned += processDeath(attackerLoc, defenderLoc);
    }

    // Перевірка смерті Захисника
    if (newDefender.currentStats.health <= 0) {
        moneyEarned += processDeath(defenderLoc, attackerLoc);
    }

    if (deaths.length > 0) {
        // Створюємо фінальний стейт з урахуванням смертей І грошей
        let stateAfterDeath = cloneStateWithUpdates(currentState, updatesForDeath);
        let transitionsPayload = { deaths: [], effects: [] };


        deaths.forEach(death => {
            // Нам треба знайти карту, ЯКА БУЛА перед смертю (з currentState, а не stateAfterDeath)
            const deadCard = currentState[death.owner].board[death.index];

            if (moneyEarned > 0) {
                stateAfterDeath = {
                    ...stateAfterDeath,
                    player: {
                        ...stateAfterDeath.player,
                        money: stateAfterDeath.player.money + moneyEarned
                    }
                };
            }

            // Перевіряємо Deathrattle
            const deathrattles = deadCard.traits.filter(t => t.type === TRAIT_TYPES.DEATHRATTLE);

            deathrattles.forEach(effect => {
                console.log("Triggering Deathrattle:", effect);
                // Запускаємо ефект на стейті, де трупа ВЖЕ немає (stateAfterDeath)
                const res = resolveEffect(stateAfterDeath, effect, deadCard, death.owner);
                stateAfterDeath = res.newState;
            });
        });


        // Запам'ятовуємо, що гравець втратив істоту (для Рятівного Деплою)
        const playerLostCreature = deaths.some(d => d.owner === "player");
        if (playerLostCreature) {
            stateAfterDeath.meta.playerDiedThisTurn = true;
        }

        transitions.push({
            type: EVENTS.DEATH_PROCESS,
            // state: stateAfterDeath,
            payload: { deaths, moneyEarned } // Передаємо інфо про смерть
        });

        currentState = stateAfterDeath;
    }

    const gameResult = checkSmartGameOver(currentState);

    if (gameResult) {
        currentState.phase = "GAME_OVER";
        currentState.meta.gameResult = gameResult;
        transitions.push({
            type: "GAME_OVER",
            state: currentState,
            payload: { result: gameResult }
        });
    }

    return { finalState: currentState, transitions };
}



function applyDamage(card, amount) {
    // Працюємо виключно з currentStats
    const stats = { ...card.currentStats };
    let newTraits = [...card.traits];
    let remainingDamage = amount;

    const glassFrameIndex = newTraits.findIndex(t => t.type === TRAIT_TYPES.GLASS_FRAME);

    // 2. Скло
    if (glassFrameIndex !== -1 && amount > 0) {
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

    return {
        ...card,
        traits: newTraits,
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

function checkSmartGameOver(state) {
    const enemyUnits = state.enemy.board.filter(c => c !== null);
    if (enemyUnits.length === 0) {
        return "VICTORY";
    }

    const playerUnits = state.player.board.filter(c => c !== null);

    if (playerUnits.length === 0) {
        const hand = state.player.hand;
        const money = state.player.money;

        const canDeployAnything = hand.some(card => card.cost <= money);

        if (!canDeployAnything) {
            return "DEFEAT";
        }
    }

    return null;
}