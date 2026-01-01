import { forwardRef } from "react";
import "./Creature.css";

const Creature = forwardRef(function Creature({ creature, dying }, ref) {
    const isDying = creature.health > 0 && dying;

    return (
        <div className="creature" ref={ref}>
            <div className="creature-image">
                <img src={creature.image} alt={creature.name} />
            </div>

            <div className="stat attack">{creature.attack}</div>
            <div className="stat health">{isDying ? 0 : creature.health}</div>

            {creature.armor > 0 && (
                <div className="stat armor">{creature.armor}</div>
            )}
        </div>
    );
});

export default Creature;
