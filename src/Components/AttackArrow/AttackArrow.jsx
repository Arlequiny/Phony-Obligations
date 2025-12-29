import "./AttackArrow.css";

export default function AttackArrow({ fromX, fromY, toX, toY }) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const headWidth = 32
    const headHigh = 64;

    return (
        <div
            className="attack-arrow"
            style={{
                left: fromX,
                top: fromY,
                width: length,
                transform: `rotate(${angle}deg)`
            }}
        >
            <div className="arrow-body" style={{ width: length - headWidth }} />
            <div className="arrow-head" style={{ width: headWidth, height: headHigh }} />
        </div>
    );
}
