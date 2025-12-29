import {useEffect, useReducer, useRef, useState} from "react";
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
import AttackArrow from "./components/AttackArrow/AttackArrow";
import Creature from "./Components/Creature/Creature.jsx";
import "./App.css"

import { gameReducer } from "./game/engine/gameReducer";
import { createGameState } from "./game/init/createGameState";
import { GAME_INTENTS } from "./game/engine/intents";
import { GAME_PHASES } from "./game/engine/phases";
import PhaseBanner from "./Components/PhaseBanner/PhaseBanner.jsx";

function App() {
    const [state, dispatch] = useReducer(
        gameReducer,
        null,
        () => createGameState("level-1")
    );

    const [activeCard, setActiveCard] = useState(null);
    const [activeCreature, setActiveCreature] = useState(null);
    const [attackUI, setAttackUI] = useState(null);
    // attackUI = {
    //   attackerSlotIndex,
    //   startX, startY,
    //   currentX, currentY,
    //   hoveredEnemySlotIndex
    // }
    const prevPhaseRef = useRef(state.phase);
    const [ui, setUI] = useState({
        phaseBannerVisible: false,
        isEnemyTurnAnimating: false,
        isPlayerAttacking: false
    });


    useEffect(() => {
        if (prevPhaseRef.current !== state.phase) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUI(ui => ({ ...ui, phaseBannerVisible: true }));

            const timeout = setTimeout(() => {
                setUI(ui => ({ ...ui, phaseBannerVisible: false }));
            }, 1200);

            prevPhaseRef.current = state.phase;
            return () => clearTimeout(timeout);
        }
    }, [state.phase]);


    useEffect(() => {
        dispatch({ type: "__INIT__" });
    }, []);



    const playerSlots = state.player.board.slots;
    const hasAnyCreature = playerSlots.some(Boolean);

    const allAttacked = playerSlots
        .filter(Boolean)
        .every(c => c.hasAttacked);

    let endButtonState = "disabled";

    if (ui.phaseBannerVisible || ui.isEnemyTurnAnimating || ui.isPlayerAttacking || (state.phase === GAME_PHASES.DEPLOY_PLAYER && !hasAnyCreature)) {
        endButtonState = "disabled";
    } else if (state.phase === GAME_PHASES.DEPLOY_PLAYER && hasAnyCreature) {
        endButtonState = "yellow";
    } else if (state.phase === GAME_PHASES.BATTLE_PLAYER) {
        endButtonState = allAttacked ? "green" : "yellow";
    }



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

    const onEndClick = () => {
        dispatch({ type: GAME_INTENTS.END_PHASE });
    };


    const onStartAttack = (attackerSlotIndex, event) => {
        if (state.phase !== GAME_PHASES.BATTLE_PLAYER) return;

        const rect = event.currentTarget.getBoundingClientRect();

        setAttackUI({
            attackerSlotIndex,
            startX: rect.left + rect.width / 2,
            startY: rect.top + rect.height / 2,
            currentX: event.clientX,
            currentY: event.clientY,
            hoveredEnemySlotIndex: null
        });
    };

    let finishAttack;
    finishAttack = () => {
        if (
            attackUI &&
            attackUI.hoveredEnemySlotIndex !== null
        ) {
            dispatch({
                type: GAME_INTENTS.TRY_ATTACK,
                attackerSlotIndex: attackUI.attackerSlotIndex,
                defenderSlotIndex: attackUI.hoveredEnemySlotIndex
            });
        }

        setAttackUI(null);
    };


    useEffect(() => {
        if (!attackUI) return;

        const onMouseMove = (e) => {
            setAttackUI(prev => ({
                ...prev,
                currentX: e.clientX,
                currentY: e.clientY
            }));
        };

        const onMouseUp = () => {
            finishAttack();
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [attackUI, finishAttack]);



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
                endButtonState={endButtonState}
                onEndClick={onEndClick}
                attackUI={attackUI}
                setAttackUI={setAttackUI}
                onStartAttack={onStartAttack}
            />

            <PhaseBanner
                phase={state.phase}
                visible={ui.phaseBannerVisible}
            />

            <Hand
                cards={state.player.hand}
                activeId={activeCard?.id}
            />

            <DragOverlay>
                {activeCard && <HandCard card={activeCard} />}
                {activeCreature && <Creature creature={activeCreature} draggable={false} />}
            </DragOverlay>

            {attackUI && (
                <>
                    <AttackArrow
                        fromX={attackUI.startX}
                        fromY={attackUI.startY}
                        toX={attackUI.currentX}
                        toY={attackUI.currentY}
                    />

                    {attackUI.hoveredEnemySlotIndex !== null && (
                        <div
                            className="attack-circle"
                            style={{
                                left: attackUI.currentX - 40,
                                top: attackUI.currentY - 40
                            }}
                        />
                    )}
                </>
            )}

        </DndContext>
    );
}

export default App;
