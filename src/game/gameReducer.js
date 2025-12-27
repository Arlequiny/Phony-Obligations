export function gameReducer(state, action) {
    switch (action.type) {

        case "INIT_HAND": {
            return {
                ...state,
                player: {
                    ...state.player,
                    hand: action.payload,
                },
                phase: "play",
            };
        }

        case "PLAY_CARD": {
            if (state.player.board.length >= state.limits.maxBoard) {
                return state;
            }

            const card = state.player.hand.find(c => c.id === action.cardId);
            if (!card) return state;

            return {
                ...state,
                player: {
                    ...state.player,
                    hand: state.player.hand.filter(c => c.id !== action.cardId),
                    board: [
                        ...state.player.board,
                        {
                            id: crypto.randomUUID(),
                            name: card.name,
                            attack: card.attack,
                            health: card.health,
                            armor: card.armor,
                            image: card.image
                        }
                    ]
                }
            };
        }


        case "END_TURN": {
            return {
                ...state,
                phase: "battle",
                ui: {
                    ...state.ui,
                    battleBannerVisible: true,
                },
            };
        }

        default:
            return state;
    }
}
