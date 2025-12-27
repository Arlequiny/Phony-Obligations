import { GAME_PHASES } from "../engine/phases";
import { LEVELS } from "./levels";
import { creatureStub } from "../../data/creatures";

const EMPTY_BOARD = () => Array(7).fill(null);

const makeCardFromCreature = (creatureKey, name) => {
    const base = creatureStub(creatureKey, name);

    return {
        id: crypto.randomUUID(),   // МАЙБУТНІЙ ID ІСТОТИ
        creatureKey,
        name,
        attack: base.attack,
        health: base.health,
        armor: base.armor,
        abilities: []
    };
};

export function createGameState(levelId = "level-1") {
    const level = LEVELS[levelId];

    const playerHand =
        level.playerHand === "RANDOM"
            ? Array.from({ length: level.playerHandSize }).map(() =>
                makeCardFromCreature("knight", "Knight")
            )
            : level.playerHand.map(key =>
                makeCardFromCreature(key, key)
            );

    return {
        phase: GAME_PHASES.SETUP,

        timer: {
            startedAt: null,
            elapsed: 0
        },

        levelId,

        player: {
            hand: playerHand,
            board: {
                slots: EMPTY_BOARD()
            }
        },

        enemy: {
            board: {
                slots: [
                    ...level.enemy.map(e => ({
                        ...e,
                        hasAttacked: false
                    })),
                    ...Array(7 - level.enemy.length).fill(null)
                ]
            }
        }
    };
}
