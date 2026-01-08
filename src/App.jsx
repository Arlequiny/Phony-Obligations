import { GameProvider, useGame } from "./game/ui/context/GameProvider";
import GameLayout from "./game/ui/GameLayout";
import MainMenu from "./game/ui/MainMenu/MainMenu";
import "./App.css";

// Внутрішній компонент, який вирішує, що показувати
function AppContent() {
    const { state, startLevel } = useGame();

    // Якщо стейту немає - показуємо меню
    // if (!state) {
    //     return (
    //         <div className="main-menu">
    //             <h1>Phony Obligations</h1>
    //             <div className="level-list">
    //                 {LEVELS.map(level => (
    //                     <div key={level.id} className="level-card">
    //                         <h3>{level.name}</h3>
    //                         <p>{level.description}</p>
    //                         <button onClick={() => startLevel(level.id)}>
    //                             Play
    //                         </button>
    //                     </div>
    //                 ))}
    //             </div>
    //         </div>
    //     );
    // }

    if (!state) {
        return <MainMenu onStartLevel={startLevel} />;
    }

    // Якщо стейт є - показуємо гру
    return <GameLayout />;
}

export default function App() {
    return (
        <GameProvider>
            <AppContent />
        </GameProvider>
    );
}