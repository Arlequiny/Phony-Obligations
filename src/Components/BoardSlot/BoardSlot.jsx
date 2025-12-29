import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Creature from "../Creature/Creature";
import "./BoardSlot.css";

export default function BoardSlot({ index, creature, owner, phase, onStartAttack, attackUI, setAttackUI}) {
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

    return (
        <div
            ref={setDropRef}
            className={`board-slot ${isOver ? "over" : ""}`}
            onMouseEnter={() => {
                if (
                    owner === "enemy" &&
                    creature &&
                    attackUI
                ) {
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
                    <Creature
                        creature={creature}
                        draggable={owner === "player"}
                    />
                </div>
            )}
        </div>
    );
}
