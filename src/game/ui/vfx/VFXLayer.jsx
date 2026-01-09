import { useState, useImperativeHandle, forwardRef } from "react";
import "./VFXLayer.css";

const VFXLayer = forwardRef((props, ref) => {
    const [effects, setEffects] = useState([]);

    // Метод, який ми викликатимемо ззовні, щоб додати ефект
    useImperativeHandle(ref, () => ({
        spawnProjectile: (fromRect, toRect, type = "cannonball") => {
            const id = Date.now() + Math.random();
            const startX = fromRect.left + fromRect.width / 2;
            const startY = fromRect.top + fromRect.height / 2;
            const endX = toRect.left + toRect.width / 2;
            const endY = toRect.top + toRect.height / 2;

            const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
            const dist = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

            addEffect({
                id,
                type: "projectile",
                variant: type,
                style: {
                    left: startX,
                    top: startY,
                    '--angle': `${angle}deg`,
                    '--travel-dist': `${dist}px`
                },
                duration: 500 // Час польоту
            });
        },

        // Черепок: з'являється і летить вгору
        spawnSkull: (rect) => {
            const id = Date.now() + Math.random();
            addEffect({
                id,
                type: "skull",
                content: "☠️",
                style: {
                    left: rect.left + rect.width / 2,
                    top: rect.top + rect.height / 2
                },
                duration: 1500
            });
        }
    }));

    const addEffect = (effect) => {
        setEffects(prev => [...prev, effect]);
        // Автоматичне видалення після закінчення анімації
        setTimeout(() => {
            setEffects(prev => prev.filter(e => e.id !== effect.id));
        }, effect.duration);
    };

    return (
        <div className="vfx-layer">
            {effects.map(fx => (
                <div key={fx.id} className={`vfx-item vfx-${fx.type} ${fx.variant || ""}`} style={fx.style}>
                    {fx.content}
                </div>
            ))}
        </div>
    );
});

export default VFXLayer;