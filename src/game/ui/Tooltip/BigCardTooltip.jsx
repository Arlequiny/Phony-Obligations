import HandCard from "../../../Components/HandCard/HandCard";
import TraitList from "./TraitList";
import "./BigCardTooltip.css";

export default function BigCardTooltip({ card }) {
    if (!card) return null;

    return (
        <div className="big-tooltip-container">
            <div className="big-card-scale-wrapper">
                {/* Передаємо прапорець isTooltip */}
                <HandCard card={card} isTooltip={true} />
            </div>

            <div className="big-tooltip-traits">
                <TraitList traits={card.traits} />
            </div>
        </div>
    );
}