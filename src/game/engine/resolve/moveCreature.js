export function resolveMoveCreature(state, fromIndex, toIndex) {
    const slots = state.player.board.slots;
    const creature = slots[fromIndex];

    if (!creature) return state;

    // 1. Забираємо істоту
    const withoutCreature = slots.filter((_, idx) => idx !== fromIndex);

    // 2. Вставляємо в нову позицію
    const newSlots = [...withoutCreature];
    newSlots.splice(toIndex, 0, creature);

    // 3. Гарантуємо довжину 7
    while (newSlots.length < 7) {
        newSlots.push(null);
    }
    if (newSlots.length > 7) {
        newSlots.length = 7;
    }

    return {
        ...state,
        player: {
            ...state.player,
            board: {
                ...state.player.board,
                slots: newSlots
            }
        }
    };
}
