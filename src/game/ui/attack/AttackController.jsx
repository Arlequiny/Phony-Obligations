import { useEffect, useRef, useState } from "react";
import { GAME_PHASES } from "../../engine/phases";

export function useAttackController({ phase, playerBoard }) {
    const [attack, setAttack] = useState(null);
    // attack = {
    //   status: "aiming" | "animating",
    //   attackerSlotIndex,
    //   defenderSlotIndex,
    //   startX, startY,
    //   currentX, currentY
    // }

    const attackRef = useRef(null);

    /* ================= cursor ================= */

    useEffect(() => {
        if (!attack) {
            document.body.style.cursor = "default";
            return;
        }

        if (attack.status === "aiming") {
            document.body.style.cursor = "crosshair";
        } else if (attack.status === "animating") {
            document.body.style.cursor = "progress";
        }

        return () => {
            document.body.style.cursor = "default";
        };
    }, [attack]);

    /* ================= public API ================= */

    function startAttack(attackerSlotIndex, startX, startY) {
        if (phase !== GAME_PHASES.BATTLE_PLAYER) return;

        const attacker = playerBoard.slots[attackerSlotIndex];
        if (!attacker || attacker.hasAttacked) return;

        const next = {
            status: "aiming",
            attackerSlotIndex,
            defenderSlotIndex: null,
            startX,
            startY,
            currentX: startX,
            currentY: startY
        };

        attackRef.current = next;
        setAttack(next);
    }

    function updatePointer(x, y) {
        if (!attackRef.current || attackRef.current.status !== "aiming") return;

        attackRef.current = {
            ...attackRef.current,
            currentX: x,
            currentY: y
        };

        setAttack(attackRef.current);
    }

    function hoverEnemy(defenderSlotIndex) {
        if (!attackRef.current || attackRef.current.status !== "aiming") return;

        attackRef.current = {
            ...attackRef.current,
            defenderSlotIndex
        };

        setAttack(attackRef.current);
    }

    function leaveEnemy() {
        if (!attackRef.current || attackRef.current.status !== "aiming") return;

        attackRef.current = {
            ...attackRef.current,
            defenderSlotIndex: null
        };

        setAttack(attackRef.current);
    }

    function cancelAttack() {
        attackRef.current = null;
        setAttack(null);
    }

    function finishAttack() {
        if (!attackRef.current) return null;

        const { attackerSlotIndex, defenderSlotIndex } = attackRef.current;

        if (defenderSlotIndex == null) {
            cancelAttack();
            return null;
        }

        const result = { attackerSlotIndex, defenderSlotIndex };

        attackRef.current = {
            ...attackRef.current,
            status: "animating"
        };

        setAttack(attackRef.current);
        return result;
    }

    function endAnimation() {
        attackRef.current = null;
        setAttack(null);
    }

    return {
        attack,
        startAttack,
        updatePointer,
        hoverEnemy,
        leaveEnemy,
        finishAttack,
        cancelAttack,
        endAnimation
    };
}
