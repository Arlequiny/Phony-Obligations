import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import "./HandCard.css";

export default function HandCard({ card, isDragging }) {
    const { attributes, listeners, setNodeRef, transform } =
        useDraggable({
            id: card.id,
            data: {
                type: "hand-card",
                card
            }
        });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : 1
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="hand-card"
        >
            <div className="image" />
            <div className="name">{card.name}</div>
        </div>
    );
}
