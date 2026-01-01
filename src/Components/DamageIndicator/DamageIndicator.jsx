import "./DamageIndicator.css";

export default function DamageIndicator({ amount, x, y }) {
    return (
        <div
            className="damage-indicator"
            style={{
                left: x - 46,   // половина 92px
                top: y - 46
            }}
        >
            {amount}
        </div>
    );
}
