import { useGame } from "./context/GameProvider";
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { useState, useRef, useEffect } from "react";

import { DraggableCard } from "./dnd/DraggableCard";
import { DroppableSlot } from "./dnd/DroppableSlot";
import { INTENTS, PHASES, EVENTS } from "../../engine/types.js";
import { TRAIT_TYPES } from "../../data/constants";
import { saveManager } from "../../engine/systems/saveManager";

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
import VFXLayer from "./vfx/VFXLayer";
import TraitList from "./Tooltip/TraitList";
import BigCardTooltip from "./Tooltip/BigCardTooltip";
import "./GameLayout.css";

export default function GameLayout() {
    const { state, exitLevel, startLevel, dispatch, isAnimating, currentEvent } = useGame();
    const [activeDragItem, setActiveDragItem] = useState(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 0,
                tolerance: 5,
                distance: 15,
            },
        })
    );

    // scale resolution shit
    const BASE_WIDTH = 1792;
    const BASE_HEIGHT = 824;

    function useWindowScale() {
        const [scaleData, setScaleData] = useState({ scale: 1, marginLeft: 0, marginTop: 0 });

        useEffect(() => {
            const handleResize = () => {
                const windowW = window.innerWidth;
                const windowH = window.innerHeight;

                const scaleW = windowW / BASE_WIDTH;
                const scaleH = windowH / BASE_HEIGHT;

                const scale = Math.min(scaleW, scaleH);
                                   // Math.min(scaleW, scaleH, 1);

                const marginLeft = (windowW - BASE_WIDTH * scale) / 2;
                const marginTop = (windowH - BASE_HEIGHT * scale) / 2;

                setScaleData({ scale, marginLeft, marginTop });
            };

            window.addEventListener('resize', handleResize);
            handleResize();

            return () => window.removeEventListener('resize', handleResize);
        }, []);

        return scaleData;
    }

    const { scale, marginLeft, marginTop } = useWindowScale();


    // money animation
    const [moneyAnimClass, setMoneyAnimClass] = useState("");
    const prevMoneyRef = useRef(state?.player?.money);

    useEffect(() => {
        if (!state || !state.player) return;

        const currentMoney = state.player.money;
        const prevMoney = prevMoneyRef.current;

        if (currentMoney !== prevMoney) {
            if (currentMoney > prevMoney) {
                setMoneyAnimClass("anim-gain");
            } else if (currentMoney < prevMoney) {
                setMoneyAnimClass("anim-spend");
            }

            prevMoneyRef.current = currentMoney;
            const timer = setTimeout(() => {
                setMoneyAnimClass("");
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [state?.player?.money]);


    // == card tooltips ==
    const [hoverInfo, setHoverInfo] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const hoverTimerRef = useRef(null);

    const handleMouseEnter = (card, type, e) => {
        if (attackArrow) return;
        if (!card) return;

        const target = e.currentTarget;

        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

        hoverTimerRef.current = setTimeout(() => {
            const rect = target.getBoundingClientRect();
            setHoverInfo({
                type,
                card,
                x: rect.right + 64,
                y: rect.top
            });
            setShowTooltip(true);
        }, type === 'hand' ? 500 : 800);
    };

    const handlePointerDown = (card, type, e) => {
        if (attackArrow) return;
        if (!card) return;
        if (e.pointerType === 'mouse') return;

        const targetElement = e.currentTarget;
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

        hoverTimerRef.current = setTimeout(() => {
            const rect = targetElement.getBoundingClientRect();

            setHoverInfo({
                type,
                card,
                x: rect.right + 64,
                y: rect.top
            });

            setShowTooltip(true);
        }, 400);
    };

    const handleInteractionEnd = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setShowTooltip(false);
        setHoverInfo(null);
    };


    // == timer ==
    const [seconds, setSeconds] = useState(0);
    const battleTimerRef = useRef(null);

    useEffect(() => {
        // const isFirstDeploy = state.meta.turn === 1 && state.phase === PHASES.DEPLOY_PLAYER;
        const isGameOver = state.phase === "GAME_OVER";

        // const shouldRun = !isFirstDeploy && !isGameOver;
        const shouldRun =  !isGameOver;

        if (shouldRun) {
            battleTimerRef.current = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            clearInterval(battleTimerRef.current);
        }

        return () => clearInterval(battleTimerRef.current);
    }, [state.phase, state.meta.turn]);

    useEffect(() => {
        if (state.phase === "GAME_OVER" && state.meta.gameResult === "VICTORY") {
            console.log("Saving Best Time:", seconds);
            saveManager.completeLevel(state.meta.levelId, null, { time: seconds });
        }
    }, [state.phase, state.meta.gameResult, state.meta.levelId]);

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };


    // == vfx and animations ==
    const vfxRef = useRef(null);

    const { attackArrow, isValidTarget, onStartAttack } = useAttackInput({
        gameState: state,
        dispatch,
        isAnimating
    });

    useCreatureAnimation(currentEvent);
    const damageIndicators = useDamageSystem(currentEvent);

    useEffect(() => {
        if (!currentEvent) return;
        if (currentEvent.type === EVENTS.DEATH_PROCESS) {
            const { deaths } = currentEvent.payload;
            deaths.forEach(death => {
                if (death.hasDeathrattle) {
                    const el = document.querySelector(
                        `div[data-slot-owner="${death.owner}"][data-slot-index="${death.index}"] .creature`
                    );

                    if (el && vfxRef.current) {
                        const rect = el.getBoundingClientRect();
                        vfxRef.current.spawnSkull(rect);
                    }
                }
            });
        }
        if (currentEvent.type === EVENTS.PROJECTILE_FIRED) {
            const { source, targets, variant } = currentEvent.payload;

            const sourceEl = document.querySelector(
                `div[data-slot-owner="${source.owner}"][data-slot-index="${source.index}"] .creature`
            );

            if (sourceEl && vfxRef.current) {
                const sourceRect = sourceEl.getBoundingClientRect();

                targets.forEach(target => {
                    const targetEl = document.querySelector(
                        `div[data-slot-owner="${target.owner}"][data-slot-index="${target.index}"] .creature`
                    );

                    if (targetEl) {
                        const targetRect = targetEl.getBoundingClientRect();
                        // ПУСК!
                        vfxRef.current.spawnProjectile(sourceRect, targetRect, variant);
                    }
                });
            }
        }
    }, [currentEvent]);


    // loading and phase check
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
        handleInteractionEnd();
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
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} autoScroll={false} >
            <div style={{       // background for black lines of resolution not 16:9
                position: 'fixed', inset: 0, background: '#fff', zIndex: -1
            }} />

            <div
                className="game-scaler"
                style={{
                    width: BASE_WIDTH,
                    height: BASE_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    left: marginLeft,
                    top: marginTop,
                    overflow: 'hidden'
                }}
            >

                <div className={`game-container ${attackArrow ? "attacking-cursor" : ""}`} style={{ width: '100%', height: '100%' }}>

                    <header className="game-header">
                        <button onClick={exitLevel}>Menu</button>

                        <div className="turn-timer">

                            <div className="turn-box">
                                <span className="label">TURN</span>
                                <span className="value">{state.phase === PHASES.DEPLOY_PLAYER ? "DEPLOY" : state.meta.turn}</span>
                            </div>

                            <div className="divider" />
                            <div className="timer-box">
                                <span className="value">{formatTime(seconds)}</span>
                            </div>

                        </div>

                    </header>

                    <div className="bg-frame">
                        <div className="bg-top" />
                        <div className="bg-center">

                            {/* bustards */}
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

                                    const isDying = currentEvent?.type === EVENTS.DEATH_PROCESS &&
                                        currentEvent.payload.deaths.some(d => d.owner === "enemy" && d.index === index);

                                    const isActivating = currentEvent?.type === EVENTS.ABILITY_TRIGGER &&
                                        currentEvent.payload.owner === "enemy" &&
                                        currentEvent.payload.index === index;

                                    const isBuffed = currentEvent?.type === EVENTS.BUFF_APPLIED &&
                                        currentEvent.payload.targets.some(t => t.owner === "enemy" && t.index === index);

                                    return (
                                        <BoardSlot key={`enemy-${index}`}>
                                            <div
                                                data-slot-type="enemy"
                                                data-card-id={slot?.instanceId}
                                                data-slot-owner="enemy"
                                                data-slot-index={index}
                                                className={slotClass}
                                                style={{width: '100%', height: '100%', position: 'relative', transition: '0.3s'}}

                                                onMouseEnter={(e) => slot && handleMouseEnter(slot, 'board', e)}
                                                onMouseLeave={handleInteractionEnd}

                                                onPointerDown={(e) => slot && handlePointerDown(slot, 'board', e)}
                                                onPointerUp={handleInteractionEnd}
                                                onPointerLeave={handleInteractionEnd}
                                                onPointerCancel={handleInteractionEnd}
                                            >
                                                {slot && <Creature creature={slot} isDying={isDying} isActivating={isActivating} isBuffed={isBuffed} />}
                                            </div>
                                        </BoardSlot>
                                    );
                                })}
                            </div>

                            {/* heroes */}
                            <div className="field_user board-row">
                                {player.board.map((slot, index) => {
                                    const isInsensate = slot && slot.traits && slot.traits.some(t => t.type === TRAIT_TYPES.INSENSATE);
                                    const hasAttackPower = slot && slot.currentStats.attack > 0;
                                    const canAttack = isBattlePhase && slot && !slot.hasAttacked && !isInsensate && hasAttackPower;

                                    const isDying = currentEvent?.type === EVENTS.DEATH_PROCESS &&
                                        currentEvent.payload.deaths.some(d => d.owner === "player" && d.index === index);

                                    const isActivating = currentEvent?.type === EVENTS.ABILITY_TRIGGER &&
                                        currentEvent.payload.owner === "player" &&
                                        currentEvent.payload.index === index;

                                    const isBuffed = currentEvent?.type === EVENTS.BUFF_APPLIED &&
                                        currentEvent.payload.targets.some(t => t.owner === "player" && t.index === index);

                                    return (
                                        <div
                                            key={`player-${index}`}
                                            style={{ position: 'relative' }}
                                            data-slot-owner="player"
                                            data-slot-index={index}
                                            className={canAttack ? "slot-active-creature" : ""}

                                            onMouseEnter={(e) => slot && handleMouseEnter(slot, 'board', e)}
                                            onMouseLeave={handleInteractionEnd}

                                            onPointerDown={(e) => slot && handlePointerDown(slot, 'board', e)}
                                            onPointerUp={handleInteractionEnd}
                                            onPointerLeave={handleInteractionEnd}
                                            onPointerCancel={handleInteractionEnd}
                                        >
                                            <BoardSlot>
                                                {isDeployPhase ? (
                                                    <DroppableSlot index={index}>
                                                        {slot && <Creature creature={slot} />}
                                                    </DroppableSlot>
                                                ) : (
                                                    slot && <Creature creature={slot} isDying={isDying} isActivating={isActivating} isBuffed={isBuffed} />
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
                        <span className="tl" />
                        <span className="tr" />
                        <span className="bl" />
                        <span className="br" />

                        <button className={`side-button diamond ${btnState.cls}`}
                                onClick={() => dispatch({ type: INTENTS.END_PHASE })}
                                disabled={btnState.disabled}
                        >
                            <p>End</p>
                        </button>

                        <span className="side-thing diamond" />
                    </div>

                    <div className={`money-display ${moneyAnimClass}`}>
                        <span className="money-icon" />
                        <span className="money-value">{player.money}</span>
                    </div>

                    <div className="player-hand-container">
                        <div className={`hand-cards ${attackArrow ? "hand-dimmed" : ""}`}>
                            {player.hand.map((card) => (
                                <div
                                    key={card.instanceId}

                                    onMouseEnter={(e) => handleMouseEnter(card, 'hand', e)}
                                    onMouseLeave={handleInteractionEnd}

                                    onPointerDown={(e) => handlePointerDown(card, 'hand', e)}
                                    onPointerUp={handleInteractionEnd}
                                    onPointerLeave={handleInteractionEnd}
                                    onPointerCancel={handleInteractionEnd}
                                >

                                    {isDeployPhase ? (
                                        <DraggableCard key={card.instanceId} card={card}>
                                            <HandCard card={card} />
                                        </DraggableCard>
                                    ) : (
                                        <div key={card.instanceId} className="disabled-card">
                                            <HandCard card={card} />
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {state.phase === "GAME_OVER" && (
                <GameOverModal
                    result={state.meta.gameResult}
                    onRestart={() => startLevel(state.meta.levelId)}
                    onMenu={exitLevel}
                />
            )}

            {showTooltip && hoverInfo?.type === 'board' && (
                <BigCardTooltip card={hoverInfo.card} />
            )}

            {showTooltip && hoverInfo?.type === 'hand' && (
                <div style={{ position: 'fixed', top: hoverInfo.y, left: hoverInfo.x, zIndex: 9999 }}>
                    <TraitList traits={hoverInfo.card.traits} />
                </div>
            )}

            <VFXLayer ref={vfxRef} />
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

            <DragOverlay>
                {activeDragItem ? (
                    <div style={{
                        transform: "scale(1.15) rotate(5deg)",
                        transition: "transform 100ms",
                        pointerEvents: "none"
                    }}>
                        <HandCard card={activeDragItem} />
                    </div>
                ) : null}
            </DragOverlay>

        </DndContext>
    );
}