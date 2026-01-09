import {EFFECT_ACTIONS, TARGET_TYPES, TRAIT_TYPES} from "../data/constants";
import {getCardById} from "../data/cards";

export function generateCardDescription(card) {
    if (!card) return "";

    // Якщо у карти є хардкод-опис (наприклад, художній текст), і немає трейтів - повертаємо його
    if ((!card.traits || card.traits.length === 0) && card.description) {
        return card.description;
    }

    let parts = [];

    // 1. Пасивні трейти (Taunt, Stealth...)
    const passiveTraits = card.traits
        .filter(t => [TRAIT_TYPES.TAUNT, TRAIT_TYPES.STEALTH, TRAIT_TYPES.GLASS_FRAME, TRAIT_TYPES.INSENSATE, TRAIT_TYPES.DOUBLE_ATTACK].includes(t.type))
        .map(t => {
            // Форматуємо назву (TAUNT -> Taunt)
            return t.type.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        });

    if (passiveTraits.length > 0) {
        parts.push(passiveTraits.join(", ") + ".");
    }

    // 2. Скриптові трейти (Battlecry, Deathrattle)
    card.traits.forEach(trait => {
        if (trait.type === TRAIT_TYPES.BATTLECRY || trait.type === TRAIT_TYPES.DEATHRATTLE) {
            const prefix = trait.type === TRAIT_TYPES.BATTLECRY ? "Battlecry" : "Deathrattle";
            const effectText = generateEffectText(trait);
            parts.push(`${prefix}: ${effectText}`);
        }
        if (trait.type === TRAIT_TYPES.PERISHING) {
            parts.push(`Perishing: Dies in ${trait.value} turns.`);
        }
    });

    return parts.join("\n");
}

function generateEffectText(trait) {
    const { action, payload } = trait;

    let target = "target";
    if (payload.targetType === TARGET_TYPES.RANDOM_ENEMY) target = "random enemy";
    if (payload.targetType === TARGET_TYPES.ALL_ENEMIES) target = "all enemies";
    if (payload.targetType === TARGET_TYPES.RANDOM_ALLY) target = "random ally";
    if (payload.targetType === TARGET_TYPES.ALL_ALLIES) target = "all allies";

    if (payload.count && payload.count > 1) {
        target = `${payload.count} ${target.replace("enemy", "enemies").replace("ally", "allies")}`;
    }

    switch (action) {
        case EFFECT_ACTIONS.DAMAGE:
            return `Deal ${payload.amount} damage to ${target}.`;
        case EFFECT_ACTIONS.BUFF_STATS:
            return `Give ${target} +${payload.attack}/+${payload.health}.`;
        case EFFECT_ACTIONS.SUMMON: {
            const summoned = getCardById(payload.cardId);
            const name = summoned ? summoned.name : "Minion";
            return `Summon ${payload.count || 1} ${name}.`;
        }
        default:
            return "Do something.";
    }
}