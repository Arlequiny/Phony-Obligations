import {useEffect, useRef, useState} from "react";
import {INTENTS, PHASES} from "../../../engine/types";
import {TRAIT_TYPES} from "../../../data/constants"; // 1. Імпорт типів

export function useAttackInput({ gameState, dispatch, isAnimating }) {
    const [attackArrow, setAttackArrow] = useState(null);
    const [isValidTarget, setIsValidTarget] = useState(false);

    const dragDataRef = useRef(null);

    const canAttack = !isAnimating && gameState.phase === PHASES.BATTLE_PLAYER;

    // --- 2. НОВА ФУНКЦІЯ ВАЛІДАЦІЇ ---
    const checkTargetValidity = (targetCard) => {
        if (!targetCard) return false;

        // а) Збираємо всіх живих ворогів
        const enemies = gameState.enemy.board.filter(c => c !== null);

        // б) Чи є серед них танк/скло?
        const hasTaunt = enemies.some(c =>
            c.traits && c.traits.some(t => t.type === TRAIT_TYPES.TAUNT)
        );
        const hasStealth = targetCard.traits && targetCard.traits.some(t => t.type === TRAIT_TYPES.STEALTH);

        // в) Логіка
        if (hasTaunt) return targetCard.traits && targetCard.traits.some(t => t.type === TRAIT_TYPES.TAUNT);
        if (hasStealth) return false;

        // Якщо танків/скла немає - можна бити будь-кого
        return true;
    };
    // ---------------------------------

    const onStartAttack = (e, card, slotIndex) => {
        e.stopPropagation();

        // 3. Перевірка: Неживі (INSENSATE) не можуть атакувати
        const isInsensate = card.traits && card.traits.some(t => t.type === TRAIT_TYPES.INSENSATE);

        if (!canAttack || !card || card.hasAttacked || isInsensate) {
            console.log("Attack blocked: conditions not met");
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        console.log("Attack Started from:", card.name);

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

                // --- 4. ОНОВЛЕНИЙ ПОШУК ЦІЛІ ---
                const elements = document.elementsFromPoint(e.clientX, e.clientY);
                const enemySlotDiv = elements.find(el => el.closest && el.closest('[data-slot-type="enemy"]'));
                const slotElement = enemySlotDiv?.closest('[data-slot-type="enemy"]');

                let valid = false;

                if (slotElement) {
                    // Ми читаємо індекс слота, щоб знайти карту в state
                    const slotIndex = parseInt(slotElement.getAttribute("data-slot-index"));
                    const targetCard = gameState.enemy.board[slotIndex];

                    // Перевіряємо валідність через нашу функцію
                    if (targetCard) {
                        valid = checkTargetValidity(targetCard);
                    }
                }

                setIsValidTarget(valid);
            }
        };

        const handleUp = (e) => {
            if (!dragDataRef.current) return;

            const data = dragDataRef.current;

            if (data.hasMoved) {
                console.log("Attack released");
                const elements = document.elementsFromPoint(e.clientX, e.clientY);
                const enemySlotDiv = elements.find(el => el.closest && el.closest('[data-slot-type="enemy"]'));
                const slotElement = enemySlotDiv?.closest('[data-slot-type="enemy"]');

                if (slotElement) {
                    const slotIndex = parseInt(slotElement.getAttribute("data-slot-index"));
                    const targetCard = gameState.enemy.board[slotIndex];
                    const targetId = slotElement.getAttribute("data-card-id"); // або targetCard.instanceId

                    // --- 5. ФІНАЛЬНА ВАЛІДАЦІЯ ПЕРЕД ВІДПРАВКОЮ ---
                    if (targetCard && targetId && checkTargetValidity(targetCard)) {
                        dispatch({
                            type: INTENTS.ATTACK,
                            attackerInstanceId: data.attackerInstanceId,
                            defenderInstanceId: targetId
                        });
                    } else {
                        console.log("Attack blocked by TAUNT or Invalid Target");
                    }
                }
            }

            dragDataRef.current = null;
            setAttackArrow(null);
            setIsValidTarget(false);
        };

        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
        window.addEventListener("pointercancel", handleUp);

        return () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
            window.removeEventListener("pointercancel", handleUp);
        };
    }, [dispatch, gameState]); // gameState важливий, щоб бачити актуальний стіл

    return { attackArrow, isValidTarget, onStartAttack };
}