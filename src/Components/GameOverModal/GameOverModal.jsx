import "./GameOverModal.css";

export default function GameOverModal({ result, onRestart, onMenu }) {
    const isVictory = result === "VICTORY";

    let imageSrc = null;
    if (result === "VICTORY") imageSrc = "/images/victory.png";
    else if (result === "DEFEAT") imageSrc = "/images/defeat.png";
    else imageSrc = "/images/draw.png";

    return (
        <div className="game-over-overlay">
            <div className={`game-over-card ${isVictory ? "victory" : "defeat"}`}>
                <div className="result-logo" style={{ backgroundImage: `url("${import.meta.env.BASE_URL}${imageSrc}")` }}>
                    {/*<img src={`${import.meta.env.BASE_URL}${imageSrc}`} alt={result} />*/}
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