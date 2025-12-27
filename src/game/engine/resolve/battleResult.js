export function resolveBattleResult(state) {
    const playerAlive =
        state.player.board.slots.some(c => c !== null);

    const enemyAlive =
        state.enemy.board.slots.some(c => c !== null);

    if (!playerAlive && !enemyAlive) {
        return { result: "draw" };
    }

    if (!enemyAlive) {
        return { result: "win" };
    }

    if (!playerAlive) {
        return { result: "lose" };
    }

    return { result: null };
}
