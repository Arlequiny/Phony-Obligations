export function applyDamage(creature, incomingDamage) {
    let armor = creature.armor ?? 0;
    let health = creature.health;

    let remainingDamage = incomingDamage;
    let absorbedByArmor = 0;

    if (armor > 0 && remainingDamage > 0) {
        absorbedByArmor = Math.min(armor, remainingDamage);
        armor -= absorbedByArmor;
        remainingDamage -= absorbedByArmor;
    }

    let damageToHealth = 0;
    if (remainingDamage > 0) {
        damageToHealth = Math.min(health, remainingDamage);
        health -= damageToHealth;
    }

    const actualDamage = absorbedByArmor + damageToHealth;

    return {
        creature: {
            ...creature,
            armor,
            health
        },
        damage: actualDamage
    };
}
