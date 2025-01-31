'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function GameStats() {
  const { game_id } = useParams();
  console.log("game_id:", game_id);
  const [playerDetails, setPlayerDetails] = useState(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (game_id) {
        try {
          console.log("Fetching stats for game:", game_id);
          const response = await fetch(`/api/playersByGame/${game_id}`);
          
          // Log the response to inspect it
          const textResponse = await response.text();
          console.log('Response text:', textResponse);

          // If the response is valid JSON, parse it
          if (response.ok) {
            const data = JSON.parse(textResponse);
            setPlayerDetails(data);
          } else {
            console.error('Failed to fetch game details:', textResponse);
          }
        } catch (error) {
          console.error("Error fetching game details:", error);
        }
      }
    };

    fetchGameDetails();
  }, [game_id]);

  if (!playerDetails) return <p className="text-center text-gray-500">Loading game stats...</p>;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-8">Box Score for Game {game_id}</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white border border-gray-300 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-medium">
              <th className="px-4 py-2 border-b text-center">Name</th>
              <th className="px-4 py-2 border-b text-center">Time Played</th>
              <th className="px-4 py-2 border-b text-center">Points</th>
              <th className="px-4 py-2 border-b text-center">Rebounds</th>
              <th className="px-4 py-2 border-b text-center">Assists</th>
            </tr>
          </thead>

          <tbody>
            {playerDetails.length > 0 ? (
              playerDetails.map((player) => (
                <tr key={player.id} className="text-sm text-gray-700 border-b hover:bg-blue-50">
                  <td className="px-4 py-2 text-center font-semibold">{player.player_name}</td>
                  <td className="px-4 py-2 text-center">{formatTime(player.time_played)}</td>
                  <td className="px-4 py-2 text-center">{player.points}</td>
                  <td className="px-4 py-2 text-center">{player.rebounds}</td>
                  <td className="px-4 py-2 text-center">{player.assists}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-2 text-center text-gray-500">No player stats available for this game.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
