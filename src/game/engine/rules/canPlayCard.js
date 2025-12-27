import { GAME_PHASES } from "../phases";

export function canPlayCard(state, cardId, slotIndex) {
    if (state.phase !== GAME_PHASES.DEPLOY_PLAYER) {
        return false;
    }

    if (slotIndex < 0 || slotIndex >= state.player.board.slots.length) {
        return false;
    }

    if (state.player.board.slots[slotIndex] !== null) {
        return false;
    }

    const cardExists = state.player.hand.some(c => c.id === cardId);
    if (!cardExists) {
        return false;
    }

    return true;
}
