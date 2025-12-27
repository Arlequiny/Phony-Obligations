import { useDroppable } from "@dnd-kit/core";
import "./DropZone.css";

export default function DropZone({ id, disabled, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        disabled
    });

    return (
        <div
            ref={setNodeRef}
            className={[
                "drop-zone",
                isOver && !disabled ? "over" : "",
                disabled ? "disabled" : ""
            ].join(" ")}
        >
            {children}
        </div>
    );
}
