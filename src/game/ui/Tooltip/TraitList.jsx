import traitData from "../../../data/traitDefinitions.json";
import "./TraitList.css";

export default function TraitList({ traits, style }) {
    if (!traits || traits.length === 0) return null;

    // Фільтруємо унікальні визначення
    const uniqueTypes = [...new Set(traits.map(t => t.type))];
    const definitions = uniqueTypes
        .map(type => traitData[type])
        .filter(Boolean); // Прибираємо undefined

    if (definitions.length === 0) return null;

    return (
        <div className="trait-list-container" style={style}>
            {definitions.map((def, i) => (
                <div key={i} className="trait-box">
                    <h5>{def.title}</h5>
                    <p>{def.description}</p>
                </div>
            ))}
        </div>
    );
}