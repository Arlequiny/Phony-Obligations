import "./Creature.css";

export default function Creature({ creature }) {
    if (!creature) return null;

    const { attack, health, armor } = creature.currentStats;
    const baseStats = creature.stats;

    const getStatClass = (current, base) => {
        if (current > base) return "stat-buffed"; // Зелений
        if (current < base) return "stat-damaged"; // Червоний (для атаки це рідкість, але можливо)
        return ""; // Білий
    };

    return (
        <div className="creature">
            <div className="creature-image">
                <img src={`${import.meta.env.BASE_URL}${creature.image}`} alt={creature.name} />
            </div>

            <div className={`stat attack ${getStatClass(attack, baseStats.attack)}`}> {attack} </div>
            <div className={`stat health ${health < baseStats.health ? "stat-damaged" : ""}`}> {health} </div>

            {armor > 0 && (
                <div className="stat armor">{armor}</div>
            )}
        </div>
    );
}