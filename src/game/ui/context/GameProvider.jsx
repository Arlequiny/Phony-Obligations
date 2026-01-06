import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { GameEngine } from "../../../engine/GameEngine";
import { computeEnemyTurn } from "../../../engine/ai/simpleAI";
import { EVENTS, INTENTS, PHASES } from "../../../engine/types";

const GameContext = createContext(null);

// Час затримок для різних подій (в мс)
const DELAYS = {
    [EVENTS.ATTACK_INIT]: 800,
    [EVENTS.DAMAGE_DEALT]: 800,
    [EVENTS.DEATH_PROCESS]: 700,
    [EVENTS.TRANSITION_PHASE]: 1500,
    [EVENTS.GAME_OVER]: 2000
};

export function GameProvider({ children }) {
    const engineRef = useRef(null);
    const [gameState, setGameState] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);

    // --- ЗАМОК ДЛЯ ШІ ---
    // Це запобігає повторному запуску ходу ворога при кожному чмиху анімації
    const aiProcessingRef = useRef(false);

    const startLevel = useCallback((levelId) => {
        engineRef.current = new GameEngine(levelId);
        setGameState(engineRef.current.getState());
        aiProcessingRef.current = false; // Скидаємо замок
    }, []);

    const exitLevel = useCallback(() => {
        engineRef.current = null;
        setGameState(null);
        aiProcessingRef.current = false;
    }, []);

    const playTransitions = async (transitions) => {
        setIsAnimating(true);

        for (const t of transitions) {
            console.log("Playing transition:", t.type);

            if (t.state) {
                setGameState(t.state);
            }

            setCurrentEvent(t);

            const delay = DELAYS[t.type] || 0;
            if (delay > 0) {
                await new Promise(r => setTimeout(r, delay));
            }

            setCurrentEvent(null);
        }

        setIsAnimating(false);
    };

    const dispatch = useCallback(async (intent) => {
        if (!engineRef.current) return;

        // Ми блокуємо вхід ТІЛЬКИ для дій гравця.
        // AI повинен мати змогу викликати dispatch навіть якщо isAnimating тільки що було true.
        // Тому тут перевірку прибираємо, або робимо розумнішою.
        // Але для безпеки UI кнопок ми використовуємо isAnimating в GameLayout.
        if (isAnimating && intent.type !== INTENTS.ATTACK && intent.type !== INTENTS.END_PHASE) return;

        const transitions = engineRef.current.dispatch(intent);

        if (transitions.length === 0) {
            setGameState({ ...engineRef.current.getState() });
            return;
        }

        await playTransitions(transitions);
        setGameState({ ...engineRef.current.getState() });
    }, [isAnimating]);

    // --- AI LOOP (ВИПРАВЛЕНО) ---
    useEffect(() => {
        // Умови запуску:
        // 1. Є гра
        // 2. Фаза ворога
        // 3. AI ще не зайнятий (aiProcessingRef === false)
        // 4. Не йде анімація (щоб не почати думати, поки ще показується попередній кадр)
        if (
            gameState &&
            gameState.phase === PHASES.BATTLE_ENEMY &&
            !aiProcessingRef.current &&
            !isAnimating
        ) {
            const runEnemyTurn = async () => {
                aiProcessingRef.current = true; // БЛОКУЄМО

                try {
                    console.log(" AI STARTED TURN");
                    await new Promise(r => setTimeout(r, 1000));

                    // Важливо: беремо свіжий стейт з двигуна, а не gameState з ефекту
                    const currentEngineState = engineRef.current.getState();
                    const aiIntents = computeEnemyTurn(currentEngineState);

                    console.log(" AI PLAN:", aiIntents);

                    for (const intent of aiIntents) {
                        // Перериваємо, якщо гра закінчилась
                        if (engineRef.current.getState().phase === PHASES.GAME_OVER) break;

                        await dispatch(intent);

                        if (intent.type === INTENTS.ATTACK) {
                            await new Promise(r => setTimeout(r, 800));
                        }
                    }
                } catch (error) {
                    console.error("AI Error:", error);
                } finally {
                    console.log(" AI FINISHED TURN");
                    // Ми НЕ розблоковуємо тут (aiProcessingRef = false),
                    // тому що фаза зміниться на DEPLOY_PLAYER, і блок зніметься нижче.
                    // Це гарантує, що AI не запуститься двічі за одну фазу.
                }
            };

            runEnemyTurn();
        }

        // СКИДАННЯ ЗАМКА
        // Якщо фаза змінилася і це БІЛЬШЕ НЕ хід ворога -> відкриваємо замок для майбутнього
        if (gameState && gameState.phase !== PHASES.BATTLE_ENEMY) {
            aiProcessingRef.current = false;
        }

    }, [gameState, isAnimating, dispatch]);

    const value = {
        state: gameState,
        isAnimating,
        currentEvent,
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