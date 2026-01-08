import "./Creature.css";
import {TRAIT_TYPES} from "../../data/constants.js";

const getTextureByUuid = (uuid) => {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash += uuid.charCodeAt(i);
    }
    const TEXTURES = ["texture1", "texture2", "texture3"];
    return TEXTURES[hash % TEXTURES.length];
};

export default function Creature({ creature }) {
    if (!creature) return null;

    const { attack, health, armor } = creature.currentStats;
    const baseStats = creature.stats;

    const textureID = getTextureByUuid(creature.instanceId);

    const traits = creature.traits || [];
    const hasTaunt = traits.some(t => t.type === TRAIT_TYPES.TAUNT);
    const isInsensate = traits.some(t => t.type === TRAIT_TYPES.INSENSATE);
    const hasGlassFrame = traits.some(t => t.type === TRAIT_TYPES.GLASS_FRAME);
    const isStealth = traits.some(t => t.type === TRAIT_TYPES.STEALTH);


    const getStatClass = (current, base) => {
        if (current > base) return "stat-buffed"; // Зелений
        if (current < base) return "stat-damaged"; // Червоний (для атаки це рідкість, але можливо)
        return ""; // Білий
    };

    return (
        <div className={`creature ${hasTaunt ? "taunt" : textureID}`}>
            <div className="creature-image">
                <img src={`${import.meta.env.BASE_URL}${creature.image}`} alt={creature.name} />
            </div>
            {isStealth && <div className="stealth"/>}

            <div className={`stat attack ${getStatClass(attack, baseStats.attack)}`}> {attack} </div>
            <div className={`stat health ${getStatClass(health, baseStats.health)}`}> {health} </div>

            {armor > 0 && (
                <div className="stat armor">{armor}</div>
            )}

            {isInsensate && <div className="stat insensate-icon">💤</div>}
            {hasGlassFrame && <div className="glass-frame"/>}
        </div>
    );
}