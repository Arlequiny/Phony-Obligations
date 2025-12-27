import { useReducer, useState } from "react";
import {
    DndContext,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
    closestCenter
} from "@dnd-kit/core";

import GameBoard from "./components/GameBoard/GameBoard";
import Hand from "./components/Hand/Hand";
import HandCard from "./components/HandCard/HandCard";

import { gameReducer } from "./game/gameReducer";
import { createInitialGameState } from "./game/gameInit";

function App() {
    const [state, dispatch] = useReducer(
        gameReducer,
        null,
        createInitialGameState
    );

    const [activeCard, setActiveCard] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        }),
        useSensor(TouchSensor)
    );

    const onDragStart = (event) => {
        if (event.active.data.current?.type === "hand-card") {
            setActiveCard(event.active.data.current.card);
        }
    };

    const onDragEnd = (event) => {
        setActiveCard(null);

        const { active, over } = event;
        if (!over) return;

        if (over.id === "player-board") {
            dispatch({
                type: "PLAY_CARD",
                cardId: active.id
            });
        }
    };


    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <GameBoard
                playerCreatures={state.player.board}
                enemyCreatures={state.enemy.board}
                canDrop={state.player.board.length < state.limits.maxBoard}
            />

            <Hand
                cards={state.player.hand}
                activeId={activeCard?.id}
            />

            <DragOverlay>
                {activeCard ? (
                    <HandCard card={activeCard} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default App;
