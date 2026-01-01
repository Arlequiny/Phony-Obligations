import { useEffect } from "react";
import { animateCreatureAttack } from "./animations/attackAnimation";
import { creatureRegistry } from "./CreatureRegistry";

export function useAttackEffect(state, setUI, onAttackImpact) {
    useEffect(() => {
        if (!state.lastAttack) return;

        const { attacker, defender } = state.lastAttack;

        const attackerEl =
            creatureRegistry.get(`player-${attacker}`);
        const defenderEl =
            creatureRegistry.get(`enemy-${defender}`);

        if (!attackerEl || !defenderEl) return;

        (async () => {
            setUI(u => ({ ...u, isPlayerAttacking: true }));

            await animateCreatureAttack({
                attackerEl,
                defenderEl,
                onImpact: () => {
                    onAttackImpact(state.damageEvents);
                }
            });

            setUI(u => ({ ...u, isPlayerAttacking: false }));
        })();
    }, [state.lastAttack]);
}
