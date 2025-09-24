export class LRUCache {
    // python lru_cache
    constructor(maxsize = 1000) {
        this.maxsize = maxsize || Infinity;
        this.map = new Map();
    }
    get(key) {
        if (!this.map.has(key)) return undefined;
        const v = this.map.get(key);
        // move to end (most recently used)
        this.map.delete(key);
        this.map.set(key, v);
        return v;
    }
    set(key, value) {
        if (this.map.has(key)) this.map.delete(key);
        this.map.set(key, value);
        while (this.map.size > this.maxsize) {
            // remove oldest
            const firstKey = this.map.keys().next().value;
            this.map.delete(firstKey);
        }
    }
    clear() { this.map.clear(); }
}
