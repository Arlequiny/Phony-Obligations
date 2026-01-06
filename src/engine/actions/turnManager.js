import { PHASES, EVENTS } from "../types";

export function resolveEndPhase(state) {
    const transitions = [];
    let nextPhase;
    let nextTurn = state.meta.turn;
    let resetAttacks = false;
    let newMeta = { ...state.meta };

    switch (state.phase) {
        case PHASES.DEPLOY_PLAYER:
            nextPhase = PHASES.BATTLE_PLAYER;
            // Скидаємо лічильник смертей на початку бою
            newMeta.playerDiedThisTurn = false;
            break;

        case PHASES.BATTLE_PLAYER:
            nextPhase = PHASES.BATTLE_ENEMY;
            resetAttacks = true; // Скидаємо ворогів (вони будуть свіжі для свого ходу)
            break;

        case PHASES.BATTLE_ENEMY:
            // Логіка "Рятівного Деплою"
            if (state.meta.playerDiedThisTurn) {
                nextPhase = PHASES.DEPLOY_PLAYER;
                // Хід не збільшуємо, даємо шанс відігратися
            } else {
                nextPhase = PHASES.DEPLOY_PLAYER;
                nextTurn += 1;
            }

            resetAttacks = true; // Скидаємо гравця (щоб ми могли атакувати в наступному ході)
            break;

        default:
            nextPhase = state.phase;
    }

    // Функція скидання атак
    const resetBoard = (board) => board.map(slot => slot ? { ...slot, hasAttacked: false } : null);

    let newState = {
        ...state,
        phase: nextPhase,
        meta: { ...newMeta, turn: nextTurn }
    };

    if (resetAttacks) {
        if (nextPhase === PHASES.BATTLE_ENEMY) {
            newState.enemy.board = resetBoard(newState.enemy.board);
        }
        if (nextPhase === PHASES.DEPLOY_PLAYER) {
            newState.player.board = resetBoard(newState.player.board);
            // Тут можна додати дохід за хід: newState.player.money += 10;
        }
    }

    transitions.push({
        type: EVENTS.TRANSITION_PHASE,
        state: newState,
        payload: { phase: nextPhase, turn: nextTurn }
    });

    return { finalState: newState, transitions };
}