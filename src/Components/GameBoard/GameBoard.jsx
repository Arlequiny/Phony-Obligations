import "./GameBoard.css";
import CreaturesRow from "../CreaturesRow/CreaturesRow";

export default function GameBoard({ playerBoard, enemyBoard, phase, endButtonState, onEndClick, attackUI, setAttackUI, onStartAttack }) {
    return (
        <>
            <div className="timer-frame">
                <div className="timer-grid">12:34</div>
                <span className="tl" />
                <span className="tr" />
            </div>

            <div className="bg-frame">
                <div className="bg-top" />

                <div className="bg-center">

                    <div className="field_enemy">
                        <CreaturesRow
                            slots={enemyBoard.slots}
                            owner="enemy"
                            attackUI={attackUI}
                            setAttackUI={setAttackUI}
                        />
                    </div>

                    <div className="field_user">
                        <CreaturesRow
                            slots={playerBoard.slots}
                            owner="player"
                            phase={phase}
                            onStartAttack={onStartAttack}
                        />
                    </div>

                </div>

                <div className="bg-bottom" />

                <span className="tl" />
                <span className="tr" />
                <span className="bl" />
                <span className="br" />

                <button
                    className={`side-button diamond ${endButtonState}`}
                    onClick={onEndClick}
                    disabled={endButtonState === "disabled"}
                >
                    <p>End</p>
                </button>

                <span className="side-thing diamond" />
            </div>
        </>
    );
}
