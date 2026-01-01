export class EffectQueue {
    constructor() {
        this.queue = [];
        this.isRunning = false;
    }

    enqueue(effect) {
        this.queue.push(effect);
    }

    enqueueMany(effects) {
        this.queue.push(...effects);
    }

    clear() {
        this.queue = [];
        this.isRunning = false;
    }

    next() {
        return this.queue.shift() ?? null;
    }

    hasNext() {
        return this.queue.length > 0;
    }

    hasPending() {
        return this.queue.length > 0;
    }

}
