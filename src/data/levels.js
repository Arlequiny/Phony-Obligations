export const LEVELS = [
    {
        id: "level-1",
        name: "The Battle of the Mill",
        description: "First test. Defeat the rats.",
        initialMoney: 4, // Скільки карбованців даємо на старті
        config: {
            playerHand: {
                type: "fixed", // або "random"
                cardIds: ["c_peasant_01", "c_peasant_01", "c_goblin_02"]
            },
            // Якщо type: "random", то: count: 5
        },
        enemyBoard: [
            { slotIndex: 1, cardId: "c_peasant_01" }, // Ворог вже стоїть тут
            { slotIndex: 3, cardId: "c_goblin_02" },
            { slotIndex: 5, cardId: "c_mole_06" },
            { slotIndex: 6, cardId: "c_mole_06" }
        ]
    },
    // Інші рівні...
];