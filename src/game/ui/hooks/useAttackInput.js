import { useState, useRef, useEffect } from "react";
import { INTENTS, PHASES } from "../../../engine/types";

export function useAttackInput({ gameState, dispatch, isAnimating }) {
    const [attackArrow, setAttackArrow] = useState(null);
    const [isValidTarget, setIsValidTarget] = useState(false);

    // Використовуємо ref для даних, щоб уникнути closures в event listeners
    const dragDataRef = useRef(null);

    const canAttack = !isAnimating && gameState.phase === PHASES.BATTLE_PLAYER;

    const onStartAttack = (e, card, slotIndex) => {
        // 1. Блокуємо спливання і нативну поведінку
        e.stopPropagation();
        // e.preventDefault(); // (Може блокувати скрол на мобільних, обережно)

        if (!canAttack) {
            console.log("Attack blocked: Wrong phase or animating");
            return;
        }
        if (!card) return;
        if (card.hasAttacked) {
            console.log("Creature already attacked");
            return;
        }

        // 2. Отримуємо чіткі координати центру слота
        // Важливо: e.currentTarget має бути тим елементом, на який ми повісили listener
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        console.log("Attack Started from:", card.name, { x: centerX, y: centerY });

        dragDataRef.current = {
            attackerInstanceId: card.instanceId,
            originX: centerX,
            originY: centerY,
            startX: e.clientX,
            startY: e.clientY,
            hasMoved: false
        };
    };

    useEffect(() => {
        const handleMove = (e) => {
            if (!dragDataRef.current) return;

            const data = dragDataRef.current;
            const dx = e.clientX - data.startX;
            const dy = e.clientY - data.startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Поріг чутливості 10px
            if (!data.hasMoved && dist > 10) {
                data.hasMoved = true;
            }

            if (data.hasMoved) {
                setAttackArrow({
                    fromX: data.originX,
                    fromY: data.originY,
                    toX: e.clientX,
                    toY: e.clientY
                });

                const elements = document.elementsFromPoint(e.clientX, e.clientY);

                const enemySlot = elements.find(el => el.closest && el.closest('[data-slot-type="enemy"]'));

                const slotElement = enemySlot?.closest('[data-slot-type="enemy"]');
                const cardId = slotElement?.getAttribute("data-card-id");

                setIsValidTarget(!!cardId);
            }
        };

        const handleUp = (e) => {
            if (!dragDataRef.current) return;

            const data = dragDataRef.current;

            if (data.hasMoved) {
                console.log("Attack released");
                const elements = document.elementsFromPoint(e.clientX, e.clientY);
                // Використовуємо .closest для надійності
                const targetWrapper = elements.find(el => el.closest && el.closest('[data-slot-type="enemy"]'));
                const targetEl = targetWrapper?.closest('[data-slot-type="enemy"]');

                if (targetEl) {
                    const targetId = targetEl.getAttribute("data-card-id");
                    console.log("Target found:", targetId);

                    if (targetId) {
                        dispatch({
                            type: INTENTS.ATTACK,
                            attackerInstanceId: data.attackerInstanceId,
                            defenderInstanceId: targetId
                        });
                    }
                }
            }

            // Clean up
            dragDataRef.current = null;
            setAttackArrow(null);
            setIsValidTarget(false);
        };

        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
        // Також слухаємо cancel/leave на випадок альт-табу
        window.addEventListener("pointercancel", handleUp);

        return () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
            window.removeEventListener("pointercancel", handleUp);
        };
    }, [dispatch]);

    return { attackArrow, isValidTarget, onStartAttack };
}