import {useEffect, useReducer, useState} from "react";
import {
    DndContext,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core";

import GameBoard from "./components/GameBoard/GameBoard";
import Hand from "./components/Hand/Hand";
import HandCard from "./components/HandCard/HandCard";

import { gameReducer } from "./game/engine/gameReducer";
import { createGameState } from "./game/init/createGameState";
import { GAME_INTENTS } from "./game/engine/intents";
import Creature from "./Components/Creature/Creature.jsx";

function App() {
    const [state, dispatch] = useReducer(
        gameReducer,
        null,
        () => createGameState("level-1")
    );

    const [activeCard, setActiveCard] = useState(null);
    const [activeCreature, setActiveCreature] = useState(null);

    useEffect(() => {
        dispatch({ type: "__INIT__" });
    }, []);


    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor)
    );

    const onDragStart = (event) => {
        if (event.active.data.current?.type === "hand-card") {
            setActiveCard(event.active.data.current.card);
        }

        if (event.active.data.current?.type === "board-creature") {
            const { fromSlotIndex } = event.active.data.current;
            setActiveCreature(state.player.board.slots[fromSlotIndex]);
        }
    };

    const parseSlotId = (id) => {
        const [, , index] = id.split("-");
        return Number(index);
    };

    const onDragEnd = (event) => {
        setActiveCard(null);
        setActiveCreature(null);

        const { active, over } = event;
        if (!over) return;

        const data = active.data.current;
        const targetSlotIndex = parseSlotId(over.id);

        if (data?.type === "hand-card") {
            if (!over.id.startsWith("player-slot")) return;

            dispatch({
                type: GAME_INTENTS.TRY_PLAY_CARD,
                cardId: active.id,
                targetSlotIndex
            });
        }

        if (data?.type === "board-creature") {
            if (data.fromSlotIndex === targetSlotIndex) return;

            dispatch({
                type: GAME_INTENTS.TRY_MOVE_CREATURE,
                fromSlotIndex: data.fromSlotIndex,
                toSlotIndex: targetSlotIndex
            });
        }
    };


    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <GameBoard
                playerBoard={state.player.board}
                enemyBoard={state.enemy.board}
                phase={state.phase}
            />

            <Hand
                cards={state.player.hand}
                activeId={activeCard?.id}
            />

            <DragOverlay>
                {activeCard && <HandCard card={activeCard} />}
                {activeCreature && <Creature creature={activeCreature} draggable={false} />}
            </DragOverlay>
        </DndContext>
    );
}

export default App;
