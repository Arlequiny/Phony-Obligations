import { useState, useEffect } from "react";
import { saveManager } from "../../../engine/systems/saveManager";
import UIModal from "./UIModal";
import LevelSelector from "./LevelSelector";
import "./MainMenu.css";

export default function MainMenu({ onStartLevel }) {
    const [saveData, setSaveData] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'play' | 'tutorial' | null
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        setSaveData(saveManager.load());
    }, []);

    if (!saveData) return null;

    const handleResetClick = () => {
        // Якщо вже відкрито - закриваємо, якщо ні - відкриваємо
        setShowResetConfirm(!showResetConfirm);
    };

    const confirmReset = () => {
        saveManager.reset();
        setShowResetConfirm(false);
    };

    return (
        <div className="main-menu-container">
            <div className="mm-background-top" />
            <div className="mm-background" />

            <div className="mm-content">

                <div className="mm-left">
                    <h1 className="game-title">PHONY<br/>OBLIGATIONS</h1>
                    <div className="version-tag">Alpha v0.6</div>
                </div>

                <div className="mm-right">
                    <div className="menu-buttons">
                        <button className="mm-btn primary" onClick={() => setActiveModal('play')}>
                            PLAY
                        </button>
                        <button className="mm-btn secondary" onClick={() => setActiveModal('tutorial')}>
                            HOW TO PLAY
                        </button>

                        <div className="reset-wrapper">
                            <button
                                className={`mm-btn small ${showResetConfirm ? "active" : ""}`}
                                onClick={handleResetClick}
                            >
                                {showResetConfirm ? "Cancel Reset" : "Reset Data"}
                            </button>

                            <div className={`reset-confirmation ${showResetConfirm ? "visible" : ""}`}>
                                <p>Are you sure?</p>
                                <div className="confirm-actions">
                                    <button className="btn-yes" onClick={confirmReset}>YES</button>
                                    <button className="btn-no" onClick={() => setShowResetConfirm(false)}>NO</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {activeModal === 'play' && (
                <UIModal title="Select Campaign" onClose={() => setActiveModal(null)}>
                    <LevelSelector
                        saveData={saveData}
                        onStartLevel={onStartLevel}
                    />
                </UIModal>
            )}

            {activeModal === 'tutorial' && (
                <UIModal title="Field Manual" onClose={() => setActiveModal(null)}>
                    <div className="tutorial-content" style={{ padding: '30px', overflowY: 'auto', color: '#ecf0f1' }}>
                        <h3>Basics</h3>
                        <p>Drag cards from your hand to the board. Cards cost money.</p>
                        <br/>
                        <h3>Combat</h3>
                        <p>Units fight automatically. Use your turn to deploy reinforcements or cast spells.</p>
                        <br/>
                        <h3>Traits</h3>
                        <ul>
                            <li><strong>Taunt (Shield):</strong> Must be attacked first.</li>
                            <li><strong>Stealth:</strong> Cannot be targeted.</li>
                            <li><strong>Glass:</strong> Ignores first damage instance.</li>
                        </ul>
                        <br/>
                        <p><em>(Тут можна додати скріншоти пізніше)</em></p>
                    </div>
                </UIModal>
            )}
        </div>
    );
}