import HandCard from "../HandCard/HandCard";
import "./Hand.css";

export default function Hand({ cards, activeId }) {
    return (
        <div className="hand">
            {cards.map(card => (
                <HandCard
                    key={card.id}
                    card={card}
                    isDragging={activeId === card.id}
                />
            ))}
        </div>
    );
}
