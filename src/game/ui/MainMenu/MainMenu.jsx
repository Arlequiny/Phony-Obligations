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
        setShowResetConfirm(!showResetConfirm);
    };

    const confirmReset = () => {
        saveManager.reset();
        setShowResetConfirm(false);
    };

    const traitStyle = {
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(0,0,0,0.2)',
        padding: '10px',
        borderRadius: '6px'
    };

    const iconStyle = {
        fontSize: '1.5rem',
        minWidth: '30px',
        textAlign: 'center'
    };

    return (
        <div className="main-menu-container">
            <div className="mm-background-top" />
            <div className="mm-background" />

            <div className="mm-content">

                <div className="mm-left">
                    {/*<h1 className="game-title">PHONY<br/>OBLIGATIONS</h1>*/}
                    <div className="game-title"/>
                    <div className="version-tag">Alpha</div>
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
                    <div className="tutorial-content" style={{ padding: '0 40px 40px 40px', overflowY: 'auto', color: '#ecf0f1', lineHeight: '1.6' }}>

                        {/* 1. OBJECTIVE */}
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ color: '#f1c40f', borderBottom: '1px solid #7f8c8d', paddingBottom: '10px' }}>
                                🎯 Objective
                            </h3>
                            <p>
                                Defeat all enemy units on the board. If the enemy board is clear, you win.
                                <br/>
                                <strong>Defeat conditions:</strong> You lose if you run out of units on the board AND have no money/cards to deploy reinforcements.
                            </p>
                        </div>

                        {/* 2. GAME FLOW */}
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{ color: '#f1c40f', borderBottom: '1px solid #7f8c8d', paddingBottom: '10px' }}>
                                ⚔️ Game Flow
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '15px' }}>
                                    <strong style={{ color: '#3498db' }}>1. DEPLOY PHASE:</strong><br/>
                                    Drag cards from your hand to the gray slots. Each card costs <strong>Money</strong>.
                                    Strategic placement matters!
                                </li>
                                <li style={{ marginBottom: '15px' }}>
                                    <strong style={{ color: '#e74c3c' }}>2. BATTLE PHASE (Player):</strong><br/>
                                    Your units are ready. Drag on your active unit, then drop on a target to attack.
                                    Some units attack automatically. Killing grands money, that depends on rarity on killed minion.
                                </li>
                                <li>
                                    <strong style={{ color: '#95a5a6' }}>3. ENEMY PHASE:</strong><br/>
                                    The enemy retaliates. Watch out for their special abilities!
                                </li>
                            </ul>
                        </div>

                        {/* 3. KEYWORDS & ICONS */}
                        <div>
                            <h3 style={{ color: '#f1c40f', borderBottom: '1px solid #7f8c8d', paddingBottom: '10px' }}>
                                📖 Keywords & Traits
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={traitStyle}>
                                    <span style={iconStyle}>🛡️</span>
                                    <div>
                                        <strong>Taunt:</strong> Enemies <em>must</em> attack this unit first. Protect your weak damage dealers!
                                    </div>
                                </li>
                                <li style={traitStyle}>
                                    <span style={iconStyle}>🌫️</span>
                                    <div>
                                        <strong>Stealth:</strong> Cannot be targeted by attacks or spells until it deals damage.
                                    </div>
                                </li>
                                <li style={traitStyle}>
                                    <span style={iconStyle}>💠</span>
                                    <div>
                                        <strong>Glass Frame:</strong> The first time this unit takes damage, it is reduced to 0. Great against heavy hitters.
                                    </div>
                                </li>
                                <li style={traitStyle}>
                                    <span style={iconStyle}>⚔️</span>
                                    <div>
                                        <strong>Battlecry:</strong> Triggers an effect immediately when played from your hand (e.g., deal damage, buff allies).
                                    </div>
                                </li>
                                <li style={traitStyle}>
                                    <span style={iconStyle}>☠️</span>
                                    <div>
                                        <strong>Deathrattle:</strong> Triggers an effect when this unit dies.
                                    </div>
                                </li>
                                <li style={traitStyle}>
                                    <span style={iconStyle}>💤</span>
                                    <div>
                                        <strong>Insensate:</strong> This unit cannot attack. Usually has high stats or cheap cost. Use as a wall.
                                    </div>
                                </li>
                                <li style={traitStyle}>
                                    <span style={iconStyle}>🥾</span>
                                    <div>
                                        <strong>Double Attack:</strong> Can attack twice in one turn.
                                    </div>
                                </li>
                                <li style={traitStyle}>
                                    <span style={iconStyle}>⏳</span>
                                    <div>
                                        <strong>Perishing:</strong> Dies automatically after a set number of turns. Use them quickly!
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.9em', color: '#7f8c8d' }}>
                            <em>"War is expensive. Spend wisely."</em>
                        </div>
                    </div>
                </UIModal>
            )}
        </div>
    );
}