import BoardSlot from "../BoardSlot/BoardSlot";
import "./CreaturesRow.css";

export default function CreaturesRow({ slots, owner }) {
    return (
        <div className="creatures-row">
            {slots.map((creature, index) => (
                <BoardSlot
                    key={index}
                    index={index}
                    creature={creature}
                    owner={owner}
                />
            ))}
        </div>
    );
}
