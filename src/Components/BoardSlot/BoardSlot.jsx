import { useDroppable } from "@dnd-kit/core";
import Creature from "../Creature/Creature";
import "./BoardSlot.css";

export default function BoardSlot({
                                      slotIndex,
                                      creature,
                                      disabled
                                  }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `board-slot-${slotIndex}`,
        data: {
            slotIndex
        },
        disabled
    });

    return (
        <div
            ref={setNodeRef}
            className={[
                "board-slot",
                isOver && !disabled ? "over" : "",
                disabled ? "disabled" : ""
            ].join(" ")}
        >
            {creature && (
                <Creature
                    creature={creature}
                    draggable={!disabled}
                    slotIndex={slotIndex}
                />
            )}
        </div>
    );
}
