import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./Creature.css";

export default function Creature({ creature, draggable }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: creature.id,
        disabled: !draggable
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div
            ref={setNodeRef}
            {...(draggable ? attributes : {})}
            {...(draggable ? listeners : {})}
            style={style}
            className={`creature ${!draggable ? "enemy" : ""}`}
        >
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
