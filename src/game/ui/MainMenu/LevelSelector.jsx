import { useState } from "react";
import { LEVELS } from "../../../data/levels";
import "./LevelSelector.css";

export default function LevelSelector({ saveData, onStartLevel }) {
    // За замовчуванням вибираємо перший рівень або останній відкритий
    const [selectedId, setSelectedId] = useState(LEVELS[0].id);

    const selectedLevel = LEVELS.find(l => l.id === selectedId);

    // Отримуємо статистику для вибраного рівня
    const stats = saveData.levels[selectedId] || { completed: false, attempts: 0 };
    const isCompleted = stats.completed;

    // Перевірка доступності (попередній пройдений)
    const index = LEVELS.findIndex(l => l.id === selectedId);
    const isUnlocked = index === 0 || (saveData.levels[LEVELS[index - 1].id]?.completed);

    return (
        <div className="level-selector-container">
            {/* ЛІВА КОЛОНКА */}
            <div className="ls-sidebar">
                {LEVELS.map((level, idx) => {
                    // ... map content ...
                    // (код без змін, просто переконайся що він всередині ls-sidebar)
                    const lStats = saveData.levels[level.id] || {};
                    const lUnlocked = idx === 0 || (saveData.levels[LEVELS[idx - 1].id]?.completed);
                    return (
                        <div
                            key={level.id}
                            className={`ls-item ${selectedId === level.id ? "active" : ""} ${lUnlocked ? "" : "locked"}`}
                            onClick={() => setSelectedId(level.id)}
                        >
                            <span className="ls-name">{idx + 1}. {lUnlocked ? level.name : "Locked ????"}</span>
                            {lStats.completed && <span className="ls-check">✓</span>}
                            {!lUnlocked && <span className="ls-lock">🔒</span>}
                        </div>
                    )
                })}
            </div>

            {/* ПРАВА КОЛОНКА */}
            <div className="ls-details">
                {/* СКРОЛ ЗОНА */}
                <div className="ls-scroll-content">
                    <div className="ls-info-top">
                        <h1 className="ls-title">{selectedLevel.name}</h1>
                        <p className="ls-desc">{isUnlocked ? selectedLevel.description : "Complete previous level to unlock."}</p>

                        {isUnlocked && (
                            <div className="ls-reward">
                                <span>Reward: {selectedLevel.reward} of pure respect.</span> {/*<span className="coin-icon">💰</span>*/}
                            </div>
                        )}
                    </div>

                    <div className="ls-divider">
                        <div className="ls-divider-line" />
                        <div className="ls-divider-icon">⚔️</div>
                        <div className="ls-divider-line" />
                    </div>

                    <div className="ls-info-bottom">
                        <h3>Statistics</h3>
                        <div className="stats-grid">
                            <div className="stat-row">
                                <span className="stat-label">Status:</span>
                                <span className={`stat-value ${isCompleted ? "green" : "grey"}`}>
                                    {isCompleted ? "Conquered" : "Not Completed"}
                                </span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Attempts:</span>
                                <span className="stat-value">{stats.attempts || 0}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Best Time:</span>
                                <span className="stat-value">--:--</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ФІКСОВАНИЙ ФУТЕР З КНОПКОЮ */}
                <div className="ls-footer">
                    <button
                        className="btn-play-level"
                        disabled={!isUnlocked}
                        onClick={() => onStartLevel(selectedId)}
                    >
                        {isUnlocked ? "FIGHT!" : "LOCKED"}
                    </button>
                </div>
            </div>
        </div>
    );
}