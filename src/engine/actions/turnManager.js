import { PHASES, EVENTS } from "../types";

export function resolveEndPhase(state) {
    const transitions = [];
    let nextPhase;

    switch (state.phase) {
        case PHASES.DEPLOY_PLAYER:
            nextPhase = PHASES.BATTLE_PLAYER;
            state.meta.turn = 1;
            break;
        case PHASES.BATTLE_PLAYER:
            nextPhase = PHASES.BATTLE_ENEMY;
            break;
        case PHASES.BATTLE_ENEMY:
            nextPhase = PHASES.BATTLE_PLAYER;
            state.meta.turn ++;
            break;
        default:
            nextPhase = state.phase;
    }

    const newState = {
        ...state,
        phase: nextPhase
    };

    // Тут можна додати логіку скидання hasAttacked = false для всіх істот

    transitions.push({
        type: EVENTS.TRANSITION_PHASE,
        state: newState,
        payload: { phase: nextPhase }
    });

    return { finalState: newState, transitions };
}