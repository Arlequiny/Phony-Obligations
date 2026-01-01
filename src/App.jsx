import { useEffect, useReducer, useState, useCallback } from "react";
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";

import GameBoard from "./components/GameBoard/GameBoard";
import Hand from "./components/Hand/Hand";
import HandCard from "./components/HandCard/HandCard";
import AttackArrow from "./components/AttackArrow/AttackArrow";
import Creature from "./Components/Creature/Creature.jsx";
import PhaseBanner from "./Components/PhaseBanner/PhaseBanner.jsx";
import DamageIndicator from "./Components/DamageIndicator/DamageIndicator.jsx";
import "./App.css"

import { gameReducer } from "./game/engine/gameReducer";
import { createGameState } from "./game/init/createGameState";
import { GAME_INTENTS } from "./game/engine/intents";
import { GAME_PHASES } from "./game/engine/phases";

import { creatureRegistry } from "./game/ui/CreatureRegistry.js";
import { EffectQueue } from "./game/ui/effects/EffectQueue";
import { useEffectQueue } from "./game/ui/effects/useEffectQueue";
import { EFFECT_TYPES } from "./game/ui/effects/effectTypes.js";

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
    const [ui, setUI] = useState({
        phaseBannerVisible: false,
        isEnemyTurnAnimating: false,
        isPlayerAttacking: false
    });
    const [damageUI, setDamageUI] = useState([]);
    // [{ id, x, y, amount }]
    const [pendingDamage, setPendingDamage] = useState([]);
    const [displayBoard, setDisplayBoard] = useState(null);
    const [effectQueue] = useState(() => new EffectQueue());
    const [handledAttackId, setHandledAttackId] = useState(null);


    useEffect(() => {
        setUI(ui => ({ ...ui, phaseBannerVisible: true }));

        const timeout = setTimeout(() => {
            setUI(ui => ({ ...ui, phaseBannerVisible: false }));
        }, 1200);

        return () => clearTimeout(timeout);
    }, [state.phase]);


    useEffectQueue(effectQueue, {
        setUI,
        onDamagePop: (events) => {
            setPendingDamage(events || []);
        },
        onSnapshotRelease: () => {
            setDisplayBoard(null);
        }
    });


    useEffect(() => {
        if (pendingDamage.length === 0) return;

        const indicators = pendingDamage
            .map((e, i) => {
                const key = `${e.target}-${e.slotIndex}`;
                const pos = creatureRegistry.getCenter(key);
                if (!pos) return null;

                return {
                    id: `${Date.now()}-${i}`,
                    x: pos.x,
                    y: pos.y,
                    amount: e.amount
                };
            })
            .filter(Boolean);

        if (indicators.length === 0) return;

        setDamageUI(prev => [...prev, ...indicators]);

        const timeout = setTimeout(() => {
            setDamageUI(prev =>
                prev.filter(d => !indicators.some(i => i.id === d.id))
            );
        }, 2000);

        return () => clearTimeout(timeout);
    }, [pendingDamage]);



    useEffect(() => {
        if (!state.lastAttack) return;
        if (state.lastAttack.id === handledAttackId) return;

        const { id, attacker, defender } = state.lastAttack;

        setHandledAttackId(id);

        effectQueue.enqueue({
            type: EFFECT_TYPES.ATTACK_ANIMATION,
            attackerKey: `player-${attacker}`,
            defenderKey: `enemy-${defender}`,
            onImpact: () => {
                effectQueue.enqueue({
                    type: EFFECT_TYPES.DAMAGE_POP,
                    events: state.damageEvents || []
                });

                effectQueue.enqueue({
                    type: EFFECT_TYPES.WAIT,
                    ms: 80
                });

                (state.deaths || []).forEach(d => {
                    effectQueue.enqueue({
                        type: EFFECT_TYPES.DEATH_ANIMATION,
                        targetKey: `${d.target}-${d.slotIndex}`
                    });
                });

                effectQueue.enqueue({
                    type: EFFECT_TYPES.SNAPSHOT_RELEASE
                });

            }
        });
    }, [state.lastAttack, handledAttackId]);



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

    // нам треба така затримка, тому:
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const finishAttack = useCallback(() => {
        if (
            !attackUI ||
            attackUI.hoveredEnemySlotIndex === null
        ) {
            setAttackUI(null);
            return;
        }

        setDisplayBoard({
            player: state.player.board,
            enemy: state.enemy.board
        });

        dispatch({
            type: GAME_INTENTS.TRY_ATTACK,
            attackerSlotIndex: attackUI.attackerSlotIndex,
            defenderSlotIndex: attackUI.hoveredEnemySlotIndex
        });

        setAttackUI(null);
    }, [attackUI, dispatch]);



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
                playerBoard={displayBoard?.player ?? state.player.board}
                enemyBoard={displayBoard?.enemy ?? state.enemy.board}
                phase={state.phase}
                deaths={state.deaths}
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

            {damageUI.map(d => (
                <DamageIndicator
                    key={d.id}
                    amount={d.amount}
                    x={d.x}
                    y={d.y}
                />
            ))}

        </DndContext>
    );
}

export default App;
