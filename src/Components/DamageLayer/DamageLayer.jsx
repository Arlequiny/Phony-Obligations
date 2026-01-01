import { useEffect, useRef, useState } from "react";
import DamageIndicator from "../../../Components/DamageIndicator/DamageIndicator.jsx";

let uid = 0;

export default function DamageLayer({ damageEvents }) {
    const [indicators, setIndicators] = useState([]);
    const prevEventsRef = useRef([]);

    useEffect(() => {
        if (!damageEvents || damageEvents.length === 0) return;

        // захист від повторної обробки тих самих івентів
        if (damageEvents === prevEventsRef.current) return;
        prevEventsRef.current = damageEvents;

        const created = damageEvents
            .map((e) => {
                const el = document.querySelector(
                    `.board-slot[data-owner="${e.target}"][data-index="${e.slotIndex}"]`
                );

                if (!el) return null;

                const rect = el.getBoundingClientRect();

                return {
                    id: `dmg-${Date.now()}-${uid++}`,
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    amount: e.amount
                };
            })
            .filter(Boolean);

        if (created.length === 0) return;

        setIndicators(prev => [...prev, ...created]);
    }, [damageEvents]);

    const remove = (id) => {
        setIndicators(prev => prev.filter(i => i.id !== id));
    };

    return (
        <>
            {indicators.map(i => (
                <DamageIndicator
                    key={i.id}
                    amount={i.amount}
                    x={i.x}
                    y={i.y}
                    onDone={() => remove(i.id)}
                />
            ))}
        </>
    );
}
