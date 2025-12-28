import "./Creature.css";

export default function Creature({ creature }) {
    return (
        <div className="creature">
            <div className="creature-image">
                <img src={creature.image} alt={creature.name} />
            </div>

            <div className="stat attack">{creature.attack}</div>
            <div className="stat health">{creature.health}</div>

            {creature.armor > 0 && (
                <div className="stat armor">{creature.armor}</div>
            )}
        </div>
    );
}
