import { useEffect, useRef } from "react";
import { EFFECT_TYPES } from "./effectTypes";
import { animateCreatureAttack } from "../animations/attackAnimation";
import { creatureRegistry } from "../CreatureRegistry";

export function useEffectQueue(queue, { setUI, onDamagePop, onSnapshotRelease }) {
    const runningRef = useRef(false);

    useEffect(() => {
        if (runningRef.current) return;
        if (!queue.hasPending()) return;

        runningRef.current = true;

        const run = async () => {
            while (queue.hasNext()) {
                const effect = queue.next();

                switch (effect.type) {
                    case EFFECT_TYPES.ATTACK_ANIMATION: {
                        const { attackerKey, defenderKey, onImpact } = effect;

                        const attackerEl = creatureRegistry.get(attackerKey);
                        const defenderEl = creatureRegistry.get(defenderKey);

                        if (attackerEl && defenderEl) {
                            setUI(u => ({ ...u, isPlayerAttacking: true }));

                            await animateCreatureAttack({
                                attackerEl,
                                defenderEl,
                                onImpact
                            });

                            setUI(u => ({ ...u, isPlayerAttacking: false }));
                        }
                        break;
                    }

                    case EFFECT_TYPES.DAMAGE_POP: {
                        onDamagePop(effect.events, {
                            releaseSnapshot: effect.releaseSnapshot
                        });
                        break;
                    }

                    case EFFECT_TYPES.DEATH_ANIMATION: {
                        const el = creatureRegistry.get(effect.targetKey);
                        if (!el) break;

                        await el.animate(
                            [
                                { opacity: 1, transform: "scale(1)" },
                                { opacity: 0, transform: "scale(0.5)" }
                            ],
                            { duration: 300, easing: "ease-in", fill: "forwards" }
                        ).finished;

                        break;
                    }

                    case EFFECT_TYPES.WAIT: {
                        await new Promise(r => setTimeout(r, effect.ms));
                        break;
                    }

                    case EFFECT_TYPES.SNAPSHOT_RELEASE: {
                        onSnapshotRelease?.();
                        break;
                    }

                    default:
                        break;
                }
            }

            runningRef.current = false;
        };

        run();
    }, [queue, setUI, onDamagePop, onSnapshotRelease]);
}
