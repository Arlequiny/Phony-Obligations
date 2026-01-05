import { useState, useEffect } from "react";
import { EVENTS } from "../../../engine/types";

export function useDamageSystem(currentEvent) {
    const [indicators, setIndicators] = useState([]);

    useEffect(() => {
        // Слухаємо тільки події шкоди
        if (!currentEvent || currentEvent.type !== EVENTS.DAMAGE_DEALT) return;

        const { hits } = currentEvent.payload;
        const newIndicators = [];

        hits.forEach((hit) => {
            // Ігноруємо нульову шкоду (наприклад, удар в щит, це окрема історія)
            if (hit.damage <= 0) return;

            // 1. Шукаємо елемент на столі
            // Нам треба знайти слот за owner ("player"|"enemy") та index
            const selector = `[data-slot-owner="${hit.owner}"][data-slot-index="${hit.index}"]`;
            const element = document.querySelector(selector);

            if (element) {
                // 2. Рахуємо координати центру
                const rect = element.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;

                // 3. Створюємо об'єкт індикатора
                const id = Date.now() + Math.random(); // Унікальний ID
                newIndicators.push({
                    id,
                    amount: hit.damage,
                    x,
                    y
                });

                // 4. Таймер на видалення (синхронізовано з CSS анімацією - 1с)
                setTimeout(() => {
                    setIndicators(prev => prev.filter(i => i.id !== id));
                }, 2000);
            }
        });

        if (newIndicators.length > 0) {
            setIndicators(prev => [...prev, ...newIndicators]);
        }

    }, [currentEvent]);

    return indicators;
}