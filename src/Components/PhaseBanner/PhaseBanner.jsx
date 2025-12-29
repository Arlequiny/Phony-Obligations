import "./PhaseBanner.css";

const PHASE_LABELS = {
    DEPLOY_PLAYER: "Deployment Phase",
    BATTLE_PLAYER: "Your Turn",
    BATTLE_ENEMY: "Enemy Turn",
    BATTLE_RESULT: "Battle Result",
    GAME_END: "Game Over"
};

export default function PhaseBanner({ phase, visible }) {
    if (!visible) return null;

    return (
        <div className="phase-banner-overlay">
            <div className="phase-banner">
                {PHASE_LABELS[phase] ?? phase}
            </div>
        </div>
    );
}
