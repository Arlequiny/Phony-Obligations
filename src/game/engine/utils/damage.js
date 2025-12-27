export function applyDamage(target, amount) {
    let remaining = amount;

    let armor = target.armor || 0;
    let health = target.health;

    if (armor > 0) {
        const absorbed = Math.min(armor, remaining);
        armor -= absorbed;
        remaining -= absorbed;
    }

    if (remaining > 0) {
        health -= remaining;
    }

    return {
        ...target,
        armor,
        health
    };
}
