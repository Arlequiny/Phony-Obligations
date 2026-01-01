import AttackArrow from "../../../components/AttackArrow/AttackArrow";

export default function AttackArrowLayer({ attack }) {
    if (!attack) return null;

    const {
        status,
        startX,
        startY,
        currentX,
        currentY,
        defenderSlotIndex
    } = attack;

    // стрілка малюється тільки в режимі наведення
    if (status !== "aiming") return null;

    return (
        <>
            <AttackArrow
                fromX={startX}
                fromY={startY}
                toX={currentX}
                toY={currentY}
            />

            {defenderSlotIndex !== null && (
                <div
                    className="attack-circle"
                    style={{
                        left: currentX - 40,
                        top: currentY - 40
                    }}
                />
            )}
        </>
    );
}
