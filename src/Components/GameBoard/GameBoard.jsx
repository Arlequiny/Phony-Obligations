import "./GameBoard.css";
import CreaturesRow from "../CreaturesRow/CreaturesRow";
import DropZone from "../DropZone/DropZone";



export default function GameBoard({
                                      playerCreatures,
                                      enemyCreatures,
                                      canDrop
                                  }) {
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
                            creatures={enemyCreatures}
                            draggable={false}
                        />
                    </div>

                    <DropZone id="player-board" disabled={!canDrop}>
                        <div className="field_user">
                            <CreaturesRow
                                creatures={playerCreatures}
                                draggable={false}
                            />
                        </div>
                    </DropZone>


                </div>

                <div className="bg-bottom" />

                <span className="tl" />
                <span className="tr" />
                <span className="bl" />
                <span className="br" />

                <button className="side-button diamond">
                    <p>End</p>
                </button>

                <span className="side-thing diamond" />
            </div>
        </>
    );
}
