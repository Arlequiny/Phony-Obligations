import { createContext, useContext, useState, useRef, useCallback } from "react";
import { GameEngine } from "../../../engine/GameEngine";
import { EVENTS } from "../../../engine/types";

const GameContext = createContext(null);

// Час затримок для різних подій (в мс)
const DELAYS = {
    [EVENTS.ATTACK_INIT]: 600,   // Час на ривок
    [EVENTS.DAMAGE_DEALT]: 800,  // Час на показ цифр
    [EVENTS.DEATH_PROCESS]: 700, // Час на зникнення
    [EVENTS.TRANSITION_PHASE]: 1500 // Час показу банера
};

export function GameProvider({ children }) {
    const engineRef = useRef(null);
    const [gameState, setGameState] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false); // Блокуємо інтерфейс під час анімацій
    const [currentEvent, setCurrentEvent] = useState(null); // Поточна подія для UI (щоб знати, що малювати)

    const startLevel = useCallback((levelId) => {
        engineRef.current = new GameEngine(levelId);
        setGameState(engineRef.current.getState());
    }, []);

    const exitLevel = useCallback(() => {
        engineRef.current = null;
        setGameState(null);
    }, []);

    // --- СЕРЦЕ АНІМАЦІЙ ---
    const playTransitions = async (transitions) => {
        setIsAnimating(true);

        for (const t of transitions) {
            console.log("Playing transition:", t.type);

            // 1. Оновлюємо стейт (якщо транзакція має проміжний стейт)
            if (t.state) {
                setGameState(t.state);
            }

            // 2. Встановлюємо поточну подію (щоб UI міг зреагувати, наприклад, показати банер)
            setCurrentEvent(t);

            // 3. Чекаємо (Затримка для анімації)
            const delay = DELAYS[t.type] || 0;
            if (delay > 0) {
                await new Promise(r => setTimeout(r, delay));
            }

            // 4. Очищаємо подію
            setCurrentEvent(null);
        }

        setIsAnimating(false);
    };

    const dispatch = useCallback(async (intent) => {
        if (!engineRef.current || isAnimating) return; // Не можна клікати під час кіно

        // 1. Отримуємо сценарій від двигуна
        const transitions = engineRef.current.dispatch(intent);

        // 2. Якщо сценарій пустий (помилка або нічого не сталось) - просто оновлюємось
        if (transitions.length === 0) {
            setGameState({ ...engineRef.current.getState() });
            return;
        }

        // 3. Граємо кіно
        await playTransitions(transitions);

        // 4. Фінальна синхронізація (на всяк випадок)
        setGameState({ ...engineRef.current.getState() });
    }, [isAnimating]);

    const value = {
        state: gameState,
        isAnimating,     // Експортуємо, щоб блокувати кнопки
        currentEvent,    // Експортуємо, щоб показувати ефекти
        startLevel,
        exitLevel,
        dispatch
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame error");
    return context;
}