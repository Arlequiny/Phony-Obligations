import BoardSlot from "../BoardSlot/BoardSlot";
import "./CreaturesRow.css";

export default function CreaturesRow({ slots, owner, phase, onStartAttack, attackUI, setAttackUI }) {
    return (
        <div className="creatures-row">
            {slots.map((creature, index) => (
                <BoardSlot
                    key={index}
                    index={index}
                    creature={creature}
                    owner={owner}
                    phase={phase}
                    onStartAttack={onStartAttack}
                    attackUI={attackUI}
                    setAttackUI={setAttackUI}
                />

            ))}
        </div>
    );
}
