import { GAME_PHASES } from "../phases";

export function canAttack(state, attackerIndex, defenderIndex) {
    if (state.phase !== GAME_PHASES.BATTLE_PLAYER) {
        return false;
    }

    const attacker = state.player.board.slots[attackerIndex];
    const defender = state.enemy.board.slots[defenderIndex];

    if (!attacker || !defender) {
        return false;
    }

    if (attacker.hasAttacked) {
        return false;
    }

    return true;
}
