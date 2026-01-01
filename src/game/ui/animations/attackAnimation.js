/**
 * @param {HTMLElement} attackerEl
 * @param {HTMLElement} defenderEl
 * @param {Function} onImpact
 */

export async function animateCreatureAttack({ attackerEl, defenderEl, onImpact}) {
    if (!attackerEl || !defenderEl) return;

    const attackerRect = attackerEl.getBoundingClientRect();
    const defenderRect = defenderEl.getBoundingClientRect();

    const dx =
        defenderRect.left + defenderRect.width / 2
        - (attackerRect.left + attackerRect.width / 2);

    const dy =
        defenderRect.top + defenderRect.height / 2
        - (attackerRect.top + attackerRect.height / 2);

    /* scale up */
    await animate(attackerEl, [
        { transform: "scale(1)" },
        { transform: "scale(1.12)" }
    ], {
        duration: 120,
        easing: "ease-out",
        fill: "forwards"
    });

    /* dash */
    await animate(attackerEl, [
        { transform: "translate(0,0) scale(1.12)" },
        {
            transform: `translate(${dx * 0.7}px, ${dy * 0.7}px) scale(1.12)`
        }
    ], {
        duration: 140,
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "forwards"
    });

    /* damage */
    // await delay(60);
    onImpact?.();

    // тряска
    animate(defenderEl, [
        { transform: "translate(0,0)" },
        { transform: "translate(-4px, 2px)" },
        { transform: "translate(4px, -2px)" },
        { transform: "translate(0,0)" }
    ], {
        duration: 160,
        easing: "ease-out"
    });


    /* dash back */
    await animate(attackerEl, [
        {
            transform: `translate(${dx * 0.7}px, ${dy * 0.7}px) scale(1.12)`
        },
        { transform: "translate(0,0) scale(1.12)" }
    ], {
        duration: 180,
        easing: "cubic-bezier(.4,0,.2,1)",
        fill: "forwards"
    });

    /* scale back */
    await animate(attackerEl, [
        { transform: "scale(1.12)" },
        { transform: "scale(1)" }
    ], {
        duration: 120,
        easing: "ease-in",
        fill: "forwards"
    });
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function animate(el, keyframes, options) {
    const animation = el.animate(keyframes, options);
    return animation.finished;
}