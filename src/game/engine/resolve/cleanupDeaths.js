export function cleanupDeaths(board) {
    return board.map(slot => {
        if (!slot) return null;
        if (slot.health <= 0) return null;
        return slot;
    });
}
