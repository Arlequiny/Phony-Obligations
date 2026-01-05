import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import "./ClotAndCard.css"

export function DraggableCard({ card, children }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `hand-${card.instanceId}`, // Унікальний ID для dnd-kit
        data: { type: "hand-card", card } // Дані, які отримає слот при drop
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : 1, // Карта зникає в руці, поки тягнеться привид
        zIndex: isDragging ? 999 : "auto",
        touchAction: "none",

        transition: "opacity 150ms ease, transform 150ms ease",
        transformOrigin: "center center"
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </div>
    );
}