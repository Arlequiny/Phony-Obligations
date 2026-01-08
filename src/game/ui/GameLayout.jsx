import { useGame } from "./context/GameProvider";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";

import { DraggableCard } from "./dnd/DraggableCard";
import { DroppableSlot } from "./dnd/DroppableSlot";
import { INTENTS, PHASES } from "../../engine/types.js";
import { TRAIT_TYPES } from "../../data/constants";

// hooks
import { useAttackInput } from "./hooks/useAttackInput";
import { useDamageSystem } from "./hooks/useDamageSystem";
import { useCreatureAnimation } from "./hooks/useCreatureAnimation";

// graphic
import HandCard from "../../Components/HandCard/HandCard";
import Creature from "../../Components/Creature/Creature";
import BoardSlot from "../../Components/BoardSlot/BoardSlot";
import AttackArrow from "../../Components/AttackArrow/AttackArrow";
import PhaseBanner from "../../Components/PhaseBanner/PhaseBanner";
import DamageIndicator from "../../Components/DamageIndicator/DamageIndicator";
import GameOverModal from "../../Components/GameOverModal/GameOverModal";
import "./GameLayout.css";

export default function GameLayout() {
    const { state, exitLevel, startLevel, dispatch, isAnimating, currentEvent } = useGame();
    const [activeDragItem, setActiveDragItem] = useState(null);

    const { attackArrow, isValidTarget, onStartAttack } = useAttackInput({
        gameState: state,
        dispatch,
        isAnimating
    });

    useCreatureAnimation(currentEvent);
    const damageIndicators = useDamageSystem(currentEvent);

    if (!state) return <div>Loading...</div>;
    const { player, enemy } = state;

    const isDeployPhase = state.phase === PHASES.DEPLOY_PLAYER;
    const isBattlePhase = state.phase === PHASES.BATTLE_PLAYER;
    const hasEnemyTaunt = state.enemy.board.some(c =>
        c && c.traits && c.traits.some(t => t.type === TRAIT_TYPES.TAUNT)
    );

    // == end button logik ==
    const getEndButtonState = () => {
        if (isAnimating || state.phase === PHASES.BATTLE_ENEMY) {
            return { cls: "disabled", disabled: true };
        }

        if (isDeployPhase) {
            const hasCreatures = player.board.some(slot => slot !== null);
            return hasCreatures
                ? { cls: "yellow", disabled: false }
                : { cls: "disabled", disabled: true };
        }

        if (isBattlePhase) {
            const activeCreatures = player.board.filter(c => c !== null);
            const hasPendingActions = activeCreatures.some(c => {
                const isInsensate = c.traits && c.traits.some(t => t.type === TRAIT_TYPES.INSENSATE);
                const hasAttackPower = c.currentStats.attack > 0;

                return !c.hasAttacked && !isInsensate && hasAttackPower;
            });

            if (activeCreatures.length > 0 && !hasPendingActions) {
                return { cls: "green", disabled: false };
            }
            return { cls: "yellow", disabled: false };
        }

        return { cls: "disabled", disabled: true };
    };

    const btnState = getEndButtonState();

    // == DND HANDLERS ==
    const handleDragStart = (event) => {
        if (event.active.data.current?.type === "hand-card") {
            setActiveDragItem(event.active.data.current.card);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragItem(null);
        if (!over) return;

        if (active.data.current?.type === "hand-card" && over.id.startsWith("slot-")) {
            dispatch({
                type: INTENTS.DEPLOY_CARD,
                cardInstanceId: active.data.current.card.instanceId,
                targetSlotIndex: over.data.current.index
            });
        }
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} autoScroll={false}>
            <PhaseBanner />

            {damageIndicators.map(ind => (
                <DamageIndicator
                    key={ind.id}
                    amount={ind.amount}
                    x={ind.x}
                    y={ind.y}
                />
            ))}

            {attackArrow && (
                <>
                    <AttackArrow {...attackArrow} />
                    {isValidTarget && (
                        <div
                            className="attack-circle"
                            style={{
                                left: attackArrow.toX - 40, // 80/2
                                top: attackArrow.toY - 40
                            }}
                        />
                    )}
                </>
            )}

            {state.phase === "GAME_OVER" && (
                <GameOverModal
                    result={state.meta.gameResult}
                    onRestart={() => startLevel(state.meta.levelId)}
                    onMenu={exitLevel}
                />
            )}

            <div className={`game-container ${attackArrow ? "attacking-cursor" : ""}`}>

                <header className="game-header">
                    <button onClick={exitLevel}>Menu</button>

                    <div className="turn-timer">

                        <div className="turn-box">
                            <span className="label">TURN</span>
                            <span className="value">{state.phase === PHASES.DEPLOY_PLAYER ? "DEPLOY" : state.meta.turn}</span>
                        </div>

                        <div className="divider" />
                        <div className="timer-box">
                            <span className="value">12:34</span>
                        </div>

                    </div>

                </header>

                <div className="bg-frame">
                    <div className="bg-top" />
                    <div className="bg-center">

                        {/* ENEMY FIELD */}
                        <div className="field_enemy board-row">
                            {enemy.board.map((slot, index) => {
                                const isTaunt = slot && slot.traits.some(t => t.type === TRAIT_TYPES.TAUNT);
                                const isTargetable = slot && (hasEnemyTaunt ? isTaunt : true);

                                const isStealth = slot && slot.traits.some(t => t.type === TRAIT_TYPES.STEALTH);

                                let slotClass = "";
                                if (attackArrow && slot) {
                                    if (isStealth) slotClass = "";
                                    else slotClass = isTargetable ? "highlight-target" : "dimmed-target";
                                }

                                return (
                                    <BoardSlot key={`enemy-${index}`}>
                                        <div
                                            data-slot-type="enemy"
                                            data-card-id={slot?.instanceId}
                                            data-slot-owner="enemy"
                                            data-slot-index={index}
                                            className={slotClass}
                                            style={{width: '100%', height: '100%', position: 'relative', transition: '0.3s'}}
                                        >
                                            {slot && <Creature creature={slot} />}
                                        </div>
                                    </BoardSlot>
                                );
                            })}
                        </div>

                        {/* PLAYER FIELD */}
                        <div className="field_user board-row">
                            {player.board.map((slot, index) => {
                                const isInsensate = slot && slot.traits && slot.traits.some(t => t.type === TRAIT_TYPES.INSENSATE);
                                const hasAttackPower = slot && slot.currentStats.attack > 0;
                                const canAttack = isBattlePhase && slot && !slot.hasAttacked && !isInsensate && hasAttackPower;

                                return (
                                    <div
                                        key={`player-${index}`}
                                        style={{ position: 'relative' }}
                                        data-slot-owner="player"
                                        data-slot-index={index}
                                        className={canAttack ? "slot-active-creature" : ""}
                                    >
                                        <BoardSlot>
                                            {isDeployPhase ? (
                                                <DroppableSlot index={index}>
                                                    {slot && <Creature creature={slot} />}
                                                </DroppableSlot>
                                            ) : (
                                                slot && <Creature creature={slot} />
                                            )}
                                        </BoardSlot>

                                        {canAttack && (
                                            <div
                                                className="interactionLayer"
                                                onPointerDown={(e) => onStartAttack(e, slot, index)}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-bottom" />
                    <span className="tl" /><span className="tr" /><span className="bl" /><span className="br" />

                    <button className={`side-button diamond ${btnState.cls}`}
                            onClick={() => dispatch({ type: INTENTS.END_PHASE })}
                            disabled={btnState.disabled}
                    >
                        <p>End</p>
                    </button>

                    <span className="side-thing diamond" />
                </div>

                <div className="money-display">
                    <span className="money-icon" />
                    <span className="money-value">{player.money}</span>
                </div>

                <div className="player-hand-container">
                    <div className="hand-cards">
                        {player.hand.map((card) => (
                            isDeployPhase ? (
                                <DraggableCard key={card.instanceId} card={card}>
                                    <HandCard card={card} />
                                </DraggableCard>
                            ) : (
                                <div key={card.instanceId} className="disabled-card">
                                    <HandCard card={card} />
                                </div>
                            )
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeDragItem ? (
                        <div style={{ transform: "scale(1.15) rotate(5deg)", transition: "transform 100ms", pointerEvents: "none" }}>
                            <HandCard card={activeDragItem} />
                        </div>
                    ) : null}
                </DragOverlay>

            </div>
        </DndContext>
    );
}