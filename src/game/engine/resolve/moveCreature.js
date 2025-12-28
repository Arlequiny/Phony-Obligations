export function resolveMoveCreature(state, fromIndex, toIndex) {
    const slots = [...state.player.board.slots];

    const creature = slots[fromIndex];
    if (!creature) return state;

    slots[fromIndex] = null;
    slots[toIndex] = creature;

    return {
        ...state,
        player: {
            ...state.player,
            board: {
                ...state.player.board,
                slots
            }
        }
    };
}
