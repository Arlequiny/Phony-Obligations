import { createInitialState } from "./core/GameState";
import { resolveAttack } from "./actions/attack";
import { resolveEndPhase } from "./actions/turnManager";
import {INTENTS, PHASES} from "./types";

export class GameEngine {
    constructor(levelId) {
        this.state = createInitialState(levelId);
        this.history = []; // Для дебагу
    }

    getState() {
        return this.state;
    }

    // Головний метод для зовнішнього світу
    dispatch(intent) {
        // Ми завжди працюємо з копією стейту, або використовуємо методи, що повертають копію
        // Для спрощення тут я буду мутувати this.state, але в ідеалі треба immutable pattern.
        // Оскільки ми просто вчимося - пряма мутація this.state допустима,
        // ЯКЩО ти потім робиш глибоку копію для React (ми це робимо в GameProvider).

        switch (intent.type) {
            case INTENTS.DEPLOY_CARD:
                return this.handleDeploy(intent);

            case INTENTS.ATTACK:
                { if (this.state.phase !== PHASES.BATTLE_PLAYER) {
                    console.warn("Can only attack in BATTLE_PLAYER phase");
                    return [];
                }
                // Тут ми викликаємо чисту функцію і оновлюємо стейт
                const attackResult = resolveAttack(this.state, intent);
                this.state = attackResult.finalState;
                return attackResult.transitions; }

            case INTENTS.END_PHASE:
                { const phaseResult = resolveEndPhase(this.state);
                this.state = phaseResult.finalState;
                return phaseResult.transitions; }
            default:
                console.warn("Unknown intent:", intent.type);
                return [];
        }
    }

    handleDeploy({ cardInstanceId, targetSlotIndex }) {
        const { player } = this.state;

        // 1. Знайти карту в руці
        const cardIndex = player.hand.findIndex(c => c.instanceId === cardInstanceId);
        if (cardIndex === -1) {
            console.error("Card not found in hand");
            return [];
        }
        const card = player.hand[cardIndex];

        // 2. Валідація (Гроші)
        if (player.money < card.cost) {
            console.log("Not enough money!");
            // Тут можна повернути івент { type: 'ERROR', message: 'No money' } для UI
            return [];
        }

        // 3. Валідація (Слот зайнятий?)
        if (player.board[targetSlotIndex] !== null) {
            console.log("Slot is occupied!");
            return [];
        }

        // 4. Виконання (EXECUTION)
        // Віднімаємо гроші
        player.money -= card.cost;

        // Видаляємо з руки
        player.hand.splice(cardIndex, 1);

        // Ставимо на стіл
        player.board[targetSlotIndex] = card;

        // Повертаємо транзакцію для оновлення UI (поки що просто пустий масив, бо стейт оновився)
        return [{ type: "DEPLOY_SUCCESS" }];
    }
}