import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Creature from "../Creature/Creature";
import "./BoardSlot.css";

export default function BoardSlot({ index, creature, owner }) {
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `${owner}-slot-${index}`,
        disabled: owner === "enemy",
    });

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
        disabled: !creature || owner !== "player"
    });

    const style = {
        transform: CSS.Translate.toString(transform)
    };

    return (
        <div
            ref={setDropRef}
            className={`board-slot ${isOver ? "over" : ""}`}
        >
            {creature && (
                <div
                    ref={setDragRef}
                    style={style}
                    {...attributes}
                    {...listeners}
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
