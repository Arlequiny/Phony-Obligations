import { useEffect } from "react";
import { EVENTS } from "../../../engine/types";

export function useCreatureAnimation(currentEvent) {
    useEffect(() => {
        if (!currentEvent) return;

        // --- АТАКА (Hearthstone Style) ---
        if (currentEvent.type === EVENTS.ATTACK_INIT) {
            const { attacker, defender } = currentEvent.payload;
            const attackerEl = getEl(attacker);
            const defenderEl = getEl(defender);

            if (attackerEl && defenderEl) {
                const rectAtt = attackerEl.getBoundingClientRect();
                const rectDef = defenderEl.getBoundingClientRect();
                const dx = rectDef.left - rectAtt.left;
                const dy = rectDef.top - rectAtt.top;

                // Ключові кадри: Набір -> Удар -> Відскок -> Повернення
                attackerEl.animate([
                    { transform: 'translate(0, 0) scale(1)', zIndex: 110, offset: 0 },
                    { transform: 'translate(0, 0) scale(1.1)', zIndex: 110, offset: 0.3 }, // Надувся
                    { transform: `translate(${dx * 0.6}px, ${dy * 0.6}px) scale(1.1)`, zIndex: 110, offset: 0.5 }, // Вдарив
                    { transform: `translate(${dx * 0.4}px, ${dy * 0.4}px) scale(1)`, zIndex: 110, offset: 0.7 }, // Відскочив назад
                    { transform: 'translate(0, 0) scale(1)', zIndex: 110, offset: 1 }
                ], {
                    duration: 600,
                    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
                });

                // Тряска жертви
                setTimeout(() => {
                    defenderEl.animate([
                        { transform: 'translate(0, 0)' },
                        { transform: 'translate(5px, 5px) rotate(2deg)' },
                        { transform: 'translate(-5px, -5px) rotate(-2deg)' },
                        { transform: 'translate(0, 0)' }
                    ], { duration: 200 });
                }, 200);
            }
        }

        // --- СМЕРТЬ (Fade to Void) ---
        if (currentEvent.type === EVENTS.DEATH_PROCESS) {
            const { deaths } = currentEvent.payload;

            deaths.forEach(death => {
                const el = getEl(death);
                if (el) {
                    // Ми анімуємо "душу", що покидає тіло
                    el.animate([
                        { opacity: 1, filter: 'grayscale(0%) blur(0px)', transform: 'scale(1)' },
                        { opacity: 0, filter: 'grayscale(100%) blur(5px)', transform: 'scale(0.8)' }
                    ], {
                        duration: 600, // GameProvider має чекати цей час
                        fill: 'forwards' // Залишаємо елемент невидимим до кінця
                    });
                }
            });
        }

    }, [currentEvent]);
}

// Helper
function getEl({ owner, index }) {
    return document.querySelector(`[data-slot-owner="${owner}"][data-slot-index="${index}"] .creature`);
}