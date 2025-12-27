import { creatureStub } from "../../data/creatures";

export const LEVELS = {
    "level-1": {
        enemy: [
            creatureStub("e1", "Goblin"),
            creatureStub("e2", "Orc"),
            creatureStub("e3", "Skeleton")
        ],

        playerHand: "RANDOM", // або масив creatureKey
        playerHandSize: 4
    }
};
