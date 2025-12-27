export const cardStub = (id, name) => ({
    id,
    name,
    attack: Math.floor(Math.random() * 5) + 1,
    health: Math.floor(Math.random() * 8) + 5,
    armor: Math.random() > 0.7 ? 2 : 0,
    rarity: "common",
    image: "https://picsum.photos/id/40/200/300"
});
