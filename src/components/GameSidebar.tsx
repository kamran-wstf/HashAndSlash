import React from 'react';
import { useGameStore } from '../stores/gameStore';

const GameSidebar: React.FC<{ onEndGame: () => void }> = ({ onEndGame }) => {
    const { points, activityLog } = useGameStore();
    console.log("endgame sidebar")

    return (
        <div className="w-72 bg-paper-100 p-4 rounded shadow flex flex-col gap-4 index-100">
            <div>
                <h2 className="font-bold text-lg mb-2">Points</h2>
                <div className="text-2xl">{points}</div>
            </div>
            <div>
                <h2 className="font-bold text-lg mb-2">Activity</h2>
                <ul className="max-h-64 overflow-y-auto text-sm">
                    {activityLog.slice().reverse().map((act, idx) => (
                        <li key={idx} className={act.correct ? "text-green-700" : "text-red-600"}>
                            [{new Date(act.timestamp).toLocaleTimeString()}] Cell ({act.row + 1},{act.col + 1}) → {act.value} {act.correct ? "✓" : "✗"}
                        </li>
                    ))}
                </ul>
            </div>
            <button className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 mt-auto"

                onClick={async () => {

                    await onEndGame();

                }}>End Game</button>

        </div>
    );
};

export default GameSidebar;