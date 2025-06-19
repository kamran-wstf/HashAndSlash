import React from 'react';
import NavBar from '../components/NavBar';
import { useStatsStore } from '../stores/statsStore';
import { formatTime } from '../utils/timeFormat';
import { Trophy, Clock, Zap, AlertTriangle } from 'lucide-react';

const StatisticsPage: React.FC = () => {
  const { gamesStarted, lastPlayed, stats } = useStatsStore();
  
  const totalGamesCompleted = Object.values(stats).reduce(
    (sum, diffStats) => sum + diffStats.completed, 
    0
  );
  
  const formatLastPlayed = () => {
    if (!lastPlayed) return 'Never';
    
    const date = new Date(lastPlayed);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 max-w-4xl mx-auto py-8 px-4">
        <div className="paper-bg rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Statistics</h1>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-paper-200 p-4 rounded-md flex items-center gap-4">
                <Trophy size={32} className="text-red-600" />
                <div>
                  <p className="text-sm text-ink-800 text-opacity-70">Games Completed</p>
                  <p className="text-2xl font-bold">{totalGamesCompleted}</p>
                </div>
              </div>
              
              <div className="bg-paper-200 p-4 rounded-md flex items-center gap-4">
                <Zap size={32} className="text-indigo-700" />
                <div>
                  <p className="text-sm text-ink-800 text-opacity-70">Games Started</p>
                  <p className="text-2xl font-bold">{gamesStarted}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-paper-200 p-4 rounded-md">
              <p className="text-sm text-ink-800 text-opacity-70">Last Played</p>
              <p className="text-xl">{formatLastPlayed()}</p>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">Performance by Difficulty</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-paper-100 shadow rounded-lg">
                <thead className="bg-paper-200">
                  <tr>
                    <th className="py-3 px-4 text-left">Difficulty</th>
                    <th className="py-3 px-4 text-left">Completed</th>
                    <th className="py-3 px-4 text-left">Best Time</th>
                    <th className="py-3 px-4 text-left">Avg. Time</th>
                    <th className="py-3 px-4 text-left">Avg. Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-200">
                  {(Object.keys(stats) as Array<keyof typeof stats>).map((difficulty) => {
                    const diffStats = stats[difficulty];
                    const avgErrors = diffStats.completed > 0 
                      ? Math.round(diffStats.totalErrors / diffStats.completed) 
                      : 0;
                      
                    return (
                      <tr key={difficulty} className="hover:bg-paper-200">
                        <td className="py-3 px-4 capitalize">{difficulty}</td>
                        <td className="py-3 px-4">{diffStats.completed}</td>
                        <td className="py-3 px-4">
                          {diffStats.bestTime 
                            ? formatTime(diffStats.bestTime) 
                            : '–'}
                        </td>
                        <td className="py-3 px-4">
                          {diffStats.averageTime 
                            ? formatTime(diffStats.averageTime) 
                            : '–'}
                        </td>
                        <td className="py-3 px-4">{avgErrors}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">Best Times</h2>
            
            <div className="space-y-3">
              {Object.entries(stats).map(([difficulty, diffStats]) => {
                if (!diffStats.bestTime) return null;
                
                return (
                  <div key={difficulty} className="bg-paper-200 p-4 rounded-md flex items-center gap-4">
                    <Clock size={24} className="text-red-600" />
                    <div>
                      <p className="text-sm text-ink-800 text-opacity-70 capitalize">{difficulty}</p>
                      <p className="text-xl font-bold">{formatTime(diffStats.bestTime)}</p>
                    </div>
                  </div>
                );
              })}
              
              {!Object.values(stats).some(diffStats => diffStats.bestTime) && (
                <div className="text-center py-4 text-ink-800 text-opacity-70">
                  <AlertTriangle size={24} className="mx-auto mb-2" />
                  <p>Complete games to see your best times here.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StatisticsPage;