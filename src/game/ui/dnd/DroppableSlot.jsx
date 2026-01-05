import { useDroppable } from "@dnd-kit/core";
import "./ClotAndCard.css"

export function DroppableSlot({ index, children }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${index}`,
        data: { index }
    });

    // const style = {
    //     boxShadow: isOver ? "0 0 10px 2px gold" : "none",
    //     background: isOver ? "radial-gradient(circle, rgba(255,255,0,0) 40%, rgba(255,215,0,0.6) 100%)" : "none",
    //     transition: "background 750ms ease, box-shadow 750ms ease",
    //     borderRadius: "12px"
    // };

    const style={
        position: "absolute",
        width: "8px",
        height: "16px"
    }

    return (
        <div className={`slot-outer ${isOver ? "over" : ""}`}>
            <div ref={setNodeRef} style={style}/>
            {children}
        </div>
    );
}