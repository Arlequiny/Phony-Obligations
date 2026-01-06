import "./GameOverModal.css";

export default function GameOverModal({ result, onRestart, onMenu }) {
    const isVictory = result === "VICTORY";

    return (
        <div className="game-over-overlay">
            <div className={`game-over-card ${isVictory ? "victory" : "defeat"}`}>
                <div className="result-title">
                    {isVictory ? "VICTORY!" : "DEFEAT..."}
                </div>

                <div className="result-content">
                    {isVictory
                        ? "Ви очистили цю землю від зла."
                        : "Ваші герої полягли в бою."}
                </div>

                <div className="button-group">
                    <button onClick={onRestart} className="btn-restart">
                        Спробувати знову
                    </button>
                    <button onClick={onMenu} className="btn-menu">
                        В меню
                    </button>
                </div>
            </div>
        </div>
    );
}