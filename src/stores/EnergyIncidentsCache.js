const cache = new Map();
const TTL_MS = 5 * 60 * 1000;

const EnergyIncidentsCache = {
    get: (key) => {
        const entry = cache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > TTL_MS) {
            cache.delete(key);
            return null;
        }
        return entry.data;
    },

    set: (key, data) => {
        cache.set(key, { data, timestamp: Date.now() });
    },

    buildKey: (dataloggerUuid, start, end) => {
        return `${dataloggerUuid}:${start}:${end}`;
    },

    cleanup: () => {
        const now = Date.now();
        for (const [key, entry] of cache.entries()) {
            if (now - entry.timestamp > TTL_MS) {
                cache.delete(key);
            }
        }
    },

    invalidateAll: () => {
        cache.clear();
    },

    size: () => cache.size
};

setInterval(() => EnergyIncidentsCache.cleanup(), 10 * 60 * 1000);

export default EnergyIncidentsCache;
