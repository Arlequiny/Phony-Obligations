import { useEffect, useState } from "react";
import "./PhaseBanner.css";
import { EVENTS } from "../../engine/types";
import { useGame } from "../../game/ui/context/GameProvider";

export default function PhaseBanner() {
    const { currentEvent } = useGame();
    const [visible, setVisible] = useState(false);
    const [text, setText] = useState("");

    useEffect(() => {
        if (currentEvent?.type === EVENTS.TRANSITION_PHASE) {
            const phaseName = currentEvent.payload.phase.replace("_", " "); // BATTLE_PLAYER -> BATTLE PLAYER
            setText(phaseName);
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [currentEvent]);

    if (!visible) return null;

    return (
        <div className="phase-banner-overlay">
            <div className="phase-banner-text">
                {text}
            </div>
        </div>
    );
}