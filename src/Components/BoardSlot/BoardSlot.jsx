import "./BoardSlot.css";

export default function BoardSlot({ children, isOver = false }) {
    return (
        <div className={`board-slot ${isOver ? "over" : ""}`}>
            {children}
        </div>
    );
}
