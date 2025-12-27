import { GAME_PHASES } from "../phases";

export function canMoveCreature(state, fromIndex, toIndex) {
    if (state.phase !== GAME_PHASES.DEPLOY_PLAYER) {
        return false;
    }

    const slots = state.player.board.slots;

    if (
        fromIndex < 0 || fromIndex >= slots.length ||
        toIndex < 0 || toIndex >= slots.length
    ) {
        return false;
    }

    if (slots[fromIndex] === null) {
        return false;
    }

    if (fromIndex === toIndex) {
        return false;
    }

    return true;
}
