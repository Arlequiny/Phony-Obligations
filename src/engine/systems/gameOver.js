import { PHASES } from "../types";

export function checkGameOver(state) {
    const playerAlive = state.player.board.some(slot => slot !== null);
    const enemyAlive = state.enemy.board.some(slot => slot !== null);

    if (!playerAlive && !enemyAlive) return "DRAW";
    if (!playerAlive) return "DEFEAT";
    if (!enemyAlive) return "VICTORY";

    return null; // Гра триває
}