import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import Creature from "../Creature/Creature";

import "./CreaturesRow.css"

export default function CreaturesRow({ creatures, draggable, droppableId }) {
    const { setNodeRef } = useDroppable({
        id: droppableId
    });

    return (
        <div ref={setNodeRef} className="creatures-row">
            <SortableContext
                items={creatures.map(c => c.id)}
                strategy={horizontalListSortingStrategy}
            >
                {creatures.map(creature => (
                    <Creature
                        key={creature.id}
                        creature={creature}
                        draggable={draggable}
                    />
                ))}
            </SortableContext>
        </div>
    );
}
