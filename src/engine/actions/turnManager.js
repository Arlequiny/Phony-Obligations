import { TRAIT_TYPES } from "../../data/constants"; // Перевір шляхи до constants
import { EVENTS, PHASES } from "../types.js";
import { resolveEffect } from "../systems/effectSystem";

export function resolveEndPhase(state) {
    const transitions = [];
    let nextPhase;
    let nextTurn = state.meta.turn;
    let resetAttacks = false;
    let newMeta = { ...state.meta };

    // --- 1. ПЕРЕМИКАННЯ ФАЗ ---
    switch (state.phase) {
        case PHASES.DEPLOY_PLAYER:
            nextPhase = PHASES.BATTLE_PLAYER;
            newMeta.playerDiedThisTurn = false;
            break;
        case PHASES.BATTLE_PLAYER:
            nextPhase = PHASES.BATTLE_ENEMY;
            resetAttacks = true;
            break;
        case PHASES.BATTLE_ENEMY:
            if (state.meta.playerDiedThisTurn) {
                nextPhase = PHASES.DEPLOY_PLAYER;
            } else {
                nextPhase = PHASES.DEPLOY_PLAYER;
                nextTurn += 1;
            }
            resetAttacks = true;
            break;
        default:
            nextPhase = state.phase;
    }

    // Базовий новий стейт
    let newState = cloneState({
        ...state,
        phase: nextPhase,
        meta: { ...newMeta, turn: nextTurn }
    });

    // Скидання атак
    const resetBoard = (board) => board.map(slot => slot ? { ...slot, hasAttacked: false, attacksCount: 0 } : null);
    if (resetAttacks) {
        if (nextPhase === PHASES.BATTLE_ENEMY) newState.enemy.board = resetBoard(newState.enemy.board);
        if (nextPhase === PHASES.DEPLOY_PLAYER) newState.player.board = resetBoard(newState.player.board);
    }

    // --- 2. START OF TURN EFFECTS (Battlecry) ---

    // Запам'ятовуємо ХП до початку вакханалії
    const getHealthMap = (s) => {
        const map = {};
        [...s.player.board, ...s.enemy.board].forEach(c => {
            if (c) map[c.instanceId] = c.currentStats.health;
        });
        return map;
    };
    let healthBefore = getHealthMap(newState);

    // Визначаємо, чия черга активувати ефекти
    let activeSideBoard = [];
    let activeOwner = "";

    if (nextPhase === PHASES.BATTLE_PLAYER) {
        activeSideBoard = newState.player.board;
        activeOwner = "player";
    } else if (nextPhase === PHASES.BATTLE_ENEMY) {
        activeSideBoard = newState.enemy.board;
        activeOwner = "enemy";
    }

    // ЗАПУСК ЕФЕКТІВ
    activeSideBoard.forEach((card, index) => {
        if (!card) return;

        // ПЕРЕВІРКА НА "ЩОЙНО ВИСТАВЛЕНИЙ"
        if (card.isJustDeployed) {
            // Знімаємо мітку, але ЕФЕКТ НЕ ЗАПУСКАЄМО
            const cleanCard = { ...card };
            cleanCard.isJustDeployed = undefined;
            delete cleanCard.isJustDeployed;
            newState[activeOwner].board[index] = cleanCard;
            return; // Пропускаємо цей цикл
        }

        // Якщо карта "стара" - запускаємо ефект
        const battlecries = card.traits.filter(t => t.type === TRAIT_TYPES.BATTLECRY);
        battlecries.forEach(effect => {
            // Важливо: передаємо newState і отримуємо оновлений newState
            newState = resolveEffect(newState, effect, card, activeOwner);
        });
    });

    // --- 3. РОЗРАХУНОК НАСЛІДКІВ (Шкода та Хрипи) ---

    // Тут ми використовуємо цикл while, тому що один хрип може викликати іншу смерть
    // (Але для простоти зробимо один прохід + хрипи, як в attack.js)

    const damageHits = [];
    const deaths = [];
    const updatesForDeath = [];

    // А. Рахуємо шкоду
    ["player", "enemy"].forEach(owner => {
        newState[owner].board.forEach((card, index) => {
            if (!card) return;
            const oldHp = healthBefore[card.instanceId];

            // Якщо hp зменшилось
            if (oldHp !== undefined && card.currentStats.health < oldHp) {
                damageHits.push({
                    owner,
                    index,
                    damage: oldHp - card.currentStats.health
                });
            }

            // Якщо помер
            if (card.currentStats.health <= 0) {
                deaths.push({ owner, index });
                updatesForDeath.push({ owner, index, card: null });
            }
        });
    });

    // Б. Подія шкоди
    if (damageHits.length > 0) {
        transitions.push({
            type: EVENTS.DAMAGE_DEALT,
            state: cloneState(newState),
            payload: { hits: damageHits }
        });
    }

    // В. Подія смерті + ХРИПИ
    if (deaths.length > 0) {
        // 1. Спочатку оновлюємо стейт (видаляємо трупи)
        let stateAfterDeath = cloneState(newState);
        updatesForDeath.forEach(u => {
            stateAfterDeath[u.owner].board[u.index] = null;
        });

        // 2. ЗАПУСКАЄМО DEATHRATTLE (Ось чого не вистачало!)
        deaths.forEach(death => {
            // Беремо карту з newState (де вона ще є), щоб прочитати трейти
            const deadCard = newState[death.owner].board[death.index];

            const deathrattles = deadCard.traits.filter(t => t.type === TRAIT_TYPES.DEATHRATTLE);
            deathrattles.forEach(effect => {
                console.log("Triggering Turn-End Deathrattle:", effect);
                // Застосовуємо ефект до "чистого" столу
                stateAfterDeath = resolveEffect(stateAfterDeath, effect, deadCard, death.owner);
            });
        });

        // 3. Оновлюємо метадані
        if (deaths.some(d => d.owner === "player")) {
            stateAfterDeath.meta.playerDiedThisTurn = true;
        }

        transitions.push({
            type: EVENTS.DEATH_PROCESS,
            state: stateAfterDeath,
            payload: { deaths }
        });

        // Фіксуємо фінальний стейт після смертей
        newState = stateAfterDeath;
    }

    transitions.push({
        type: EVENTS.TRANSITION_PHASE,
        state: newState,
        payload: { phase: nextPhase, turn: nextTurn }
    });

    return { finalState: newState, transitions };
}

function cloneState(state) {
    return {
        ...state,
        player: { ...state.player, board: [...state.player.board] },
        enemy: { ...state.enemy, board: [...state.enemy.board] }
    };
}