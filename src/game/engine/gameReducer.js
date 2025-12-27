import { GAME_PHASES } from "./phases";
import { GAME_INTENTS } from "./intents";

import { canPlayCard } from "./rules/canPlayCard";
import { resolvePlayCard } from "./resolve/playCard";

import { canMoveCreature } from "./rules/canMoveCreature";
import { resolveMoveCreature } from "./resolve/moveCreature";

import { canAttack } from "./rules/canAttack";
import { resolveAttack } from "./resolve/attack";

import { resolveEnemyTurn } from "./resolve/enemyTurn";
import { resolveBattleResult } from "./resolve/battleResult";

export function gameReducer(state, action) {
    switch (action.type) {

        case "__INIT__": {
            return {
                ...state,
                phase: GAME_PHASES.DEPLOY_PLAYER
            };
        }

        case GAME_INTENTS.TRY_PLAY_CARD: {
            const { cardId, targetSlotIndex } = action;
            if (!canPlayCard(state, cardId, targetSlotIndex)) return state;
            return resolvePlayCard(state, cardId, targetSlotIndex);
        }

        case GAME_INTENTS.TRY_MOVE_CREATURE: {
            const { fromSlotIndex, toSlotIndex } = action;
            if (!canMoveCreature(state, fromSlotIndex, toSlotIndex)) return state;
            return resolveMoveCreature(state, fromSlotIndex, toSlotIndex);
        }

        case GAME_INTENTS.TRY_ATTACK: {
            const { attackerSlotIndex, defenderSlotIndex } = action;
            if (!canAttack(state, attackerSlotIndex, defenderSlotIndex)) return state;
            return resolveAttack(state, attackerSlotIndex, defenderSlotIndex);
        }

        case GAME_INTENTS.END_PHASE: {
            return handleEndPhase(state);
        }

        default:
            return state;
    }
}

function handleEndPhase(state) {
    switch (state.phase) {

        case GAME_PHASES.DEPLOY_PLAYER:
            return {
                ...state,
                phase: GAME_PHASES.BATTLE_PLAYER,
                timer: {
                    startedAt: Date.now(),
                    elapsed: 0
                }
            };

        case GAME_PHASES.BATTLE_PLAYER:
            return {
                ...state,
                phase: GAME_PHASES.BATTLE_ENEMY
            };

        case GAME_PHASES.BATTLE_ENEMY: {
            const afterEnemy = resolveEnemyTurn(state);
            return {
                ...afterEnemy,
                phase: GAME_PHASES.BATTLE_RESULT
            };
        }

        case GAME_PHASES.BATTLE_RESULT: {
            const { result } = resolveBattleResult(state);

            if (result) {
                return {
                    ...state,
                    phase: GAME_PHASES.GAME_END,
                    result,
                    timer: {
                        ...state.timer,
                        elapsed: Date.now() - state.timer.startedAt
                    }
                };
            }

            // новий раунд
            return {
                ...state,
                phase: GAME_PHASES.BATTLE_PLAYER,
                player: {
                    ...state.player,
                    board: {
                        ...state.player.board,
                        slots: state.player.board.slots.map(c =>
                            c ? { ...c, hasAttacked: false } : null
                        )
                    }
                }
            };
        }

        default:
            return state;
    }
}

