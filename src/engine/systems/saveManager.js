const SAVE_KEY = "PhOb_game_save";

const INITIAL_SAVE = {
    levels: {},
    currentLevelId: "level-1",
    exp: 0                          // Гроші, зароблені між рівнями (на майбутнє, для магазину)
};

export const saveManager = {
    load: () => {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            return raw ? JSON.parse(raw) : INITIAL_SAVE;
        } catch (e) {
            console.error("Save load error.", e);
            return INITIAL_SAVE;
        }
    },

    save: (data) => {
        try {
            const current = saveManager.load();
            // Глибоке злиття даних
            const newData = {
                ...current,
                ...data,
                levels: { ...current.levels, ...(data.levels || {}) }
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(newData));
        } catch (e) {
            console.error("Save write error.", e);
        }
    },

    reset: () => {
        localStorage.removeItem(SAVE_KEY);
        window.location.reload();
    },

    // Хелпер: позначити рівень як пройдений
    completeLevel: (levelId, nextLevelId, stats = {}) => {
        const current = saveManager.load();

        const oldLevelStats = current.levels[levelId] || { completed: false, attempts: 0 };

        const newStats = {
            completed: true,
            attempts: (oldLevelStats.attempts || 0) + 1, // +1 спроба (хоча логіку спроб краще трекати окремо)
            bestTime: stats.time ? Math.min(stats.time, oldLevelStats.bestTime || Infinity) : oldLevelStats.bestTime
        };

        saveManager.save({
            levels: { [levelId]: newStats },
            currentLevelId: nextLevelId || levelId
        });
    }
};