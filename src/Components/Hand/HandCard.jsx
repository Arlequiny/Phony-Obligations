// HandCard.jsx
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import "./HandCard.css";

export default function HandCard({ card, baseTransform, zIndex }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({ id: String(card.id) });

    const dragTranslate = transform ? CSS.Translate.toString(transform) : "";

    const transformStyle = isDragging
        ?
        `${extractTranslate(baseTransform)} rotate(0deg) ${extractScale(baseTransform)} ${dragTranslate}`
        : baseTransform + (dragTranslate ? ` ${dragTranslate}` : "");

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`hand-card ${isDragging ? "dragging" : ""}`}
            style={{
                transform: transformStyle,
                zIndex: isDragging ? 1000 : zIndex,
                transition: isDragging ? "none" : undefined
            }}
        >
            <img src={card.image} alt={card.name} />
            <div className="card-name">{card.name}</div>
        </div>
    );
}

function extractTranslate(base) {
    const m = base.match(/translate3?d?\([^)]*\)/);
    return m ? m[0] : "";
}
function extractScale(base) {
    const m = base.match(/scale\([^)]*\)/);
    return m ? m[0] : "";
}
