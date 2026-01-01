// UI-only registry: slot -> HTMLElement
// НЕ state, НЕ reducer, НЕ engine

class CreatureRegistry {
    constructor() {
        this.map = new Map();
    }

    register(key, el) {
        if (el) {
            this.map.set(key, el);
        }
    }

    unregister(key) {
        this.map.delete(key);
    }

    get(key) {
        return this.map.get(key) || null;
    }

    getCenter(key) {
        const el = this.get(key);
        if (!el) return null;

        const rect = el.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    clear() {
        this.map.clear();
    }
}

export const creatureRegistry = new CreatureRegistry();