import { useEffect, useRef } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Creature from "../Creature/Creature";
import { creatureRegistry } from "../../game/ui/CreatureRegistry";
import "./BoardSlot.css";

export default function BoardSlot({ index, creature, owner, phase, onStartAttack, attackUI, setAttackUI, deaths }) {
    const slotKey = `${owner}-${index}`;
    const creatureRef = useRef(null);

    useEffect(() => {
        if (creature && creatureRef.current) {
            creatureRegistry.register(slotKey, creatureRef.current);
            return () => creatureRegistry.unregister(slotKey);
        }
    }, [creature, slotKey]);

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `${owner}-slot-${index}`,
        disabled: owner === "enemy",
    });

    const isDraggable =
        creature &&
        owner === "player" &&
        phase === "DEPLOY_PLAYER";

    const {
        setNodeRef: setDragRef,
        attributes,
        listeners,
        transform
    } = useDraggable({
        id: creature ? creature.id : undefined,
        data: creature
            ? {
                type: "board-creature",
                fromSlotIndex: index,
                owner
            }
            : null,
        disabled: !isDraggable
    });

    const style = {
        transform: CSS.Translate.toString(transform)
    };

    const isDying =
        deaths?.some(
            d => d.target === owner && d.slotIndex === index
        );

    return (
        <div
            ref={setDropRef}
            className={`board-slot ${isOver ? "over" : ""}`}
            data-owner={owner}
            data-index={index}
            onMouseEnter={() => {
                if (owner === "enemy" && creature && attackUI) {
                    setAttackUI(prev => ({
                        ...prev,
                        hoveredEnemySlotIndex: index
                    }));
                }
            }}
            onMouseLeave={() => {
                if (owner === "enemy" && attackUI) {
                    setAttackUI(prev => ({
                        ...prev,
                        hoveredEnemySlotIndex: null
                    }));
                }
            }}
        >
            {creature && (
                <div
                    ref={setDragRef}
                    style={style}
                    {...attributes}
                    {...listeners}
                    onMouseDown={(e) => {
                        if (
                            owner === "player" &&
                            phase === "BATTLE_PLAYER" &&
                            !creature.hasAttacked
                        ) {
                            onStartAttack(index, e);
                        }
                    }}
                >
                    <Creature ref={creatureRef} creature={creature} dying={isDying}/>
                </div>
            )}
        </div>
    );
}
