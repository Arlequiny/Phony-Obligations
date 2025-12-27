import { creatureStub } from "../data/creatures";

const makeCardFromCreature = (creatureKey, name) => {
    const base = creatureStub(creatureKey, name);

    return {
        id: crypto.randomUUID(),      // ID карти
        creatureKey,                  // тип істоти

        name,
        description: "No description yet",
        rarity: base.rarity,

        image: base.image,

        attack: base.attack,
        health: base.health,
        armor: base.armor
    };
};


export const createInitialGameState = () => ({
    phase: "deploy",

    limits: {
        maxHand: 9,
        maxBoard: 7
    },

    player: {
        hand: [
            makeCardFromCreature("knight", "Knight"),
            makeCardFromCreature("archer", "Archer"),
            makeCardFromCreature("knight", "Knight"),
            makeCardFromCreature("paladin", "Paladin")
        ],
        board: []
    },

    enemy: {
        board: [
            creatureStub("e1", "Goblin"),
            creatureStub("e2", "Orc"),
            creatureStub("e3", "Dildo")
        ]
    }
});
