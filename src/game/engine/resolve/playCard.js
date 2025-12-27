export function resolvePlayCard(state, cardId, slotIndex) {
    const card = state.player.hand.find(c => c.id === cardId);
    if (!card) return state;

    const creature = {
        id: card.id,               // КЛЮЧОВО: той самий id
        name: card.name,
        attack: card.attack,
        health: card.health,
        armor: card.armor,
        abilities: card.abilities || [],
        hasAttacked: false
    };

    const newSlots = [...state.player.board.slots];
    newSlots[slotIndex] = creature;

    return {
        ...state,
        player: {
            ...state.player,
            hand: state.player.hand.filter(c => c.id !== cardId),
            board: {
                ...state.player.board,
                slots: newSlots
            }
        }
    };
}
