"use client";

import { useState, useEffect } from "react";

const StatsDashboard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch player stats from the API
  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await fetch("/api/stats");
      const data = await response.json();
      setPlayers(data);
    };
    fetchPlayers();
  }, []);

  // Update a player's stat
  const updateStat = async (playerId, stat, change) => {
    setLoading(true);
    const response = await fetch("/api/stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playerId, stat, change }),
    });
    const data = await response.json();

    if (data.success) {
      // Update the local state with the new stats
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === playerId ? { ...player, [stat]: player[stat] + change } : player
        )
      );
    } else {
      console.error(data.error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Stats Dashboard</h1>
        <div className="space-y-4">
          {players.map((player) => (
            <div key={player.id} className="p-4 border rounded-lg bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">{player.name}</h2>
              {["points", "rebounds", "assists"].map((stat) => (
                <div key={stat} className="flex justify-between items-center mb-2">
                  <span className="capitalize font-medium">{stat}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateStat(player.id, stat, -1)}
                      disabled={loading}
                      className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:bg-red-300"
                    >
                      -
                    </button>
                    <span className="text-lg font-bold">{player[stat]}</span>
                    <button
                      onClick={() => updateStat(player.id, stat, 1)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-green-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
