export const creatureStub = (id, name) => ({
    id,
    name,
    attack: Math.floor(Math.random() * 5) + 1,
    health: Math.floor(Math.random() * 8) + 5,
    armor: Math.random() > 0.6 ? 2 : 0,
    rarity: "common", // common | rare | epic
    image: "https://picsum.photos/id/40/96/128"
});
