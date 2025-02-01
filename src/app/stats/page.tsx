'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { getGames } from '../store/features/dataSlice';
import Link from 'next/link';

export default function PlayersList() {
  const dispatch = useAppDispatch();
  const { games, loading, error } = useAppSelector((state) => state.data);

  const [selectedGameId, setSelectedGameId] = useState(null); // To track the selected game
  const [playerDetails, setPlayerDetails] = useState(null); // To store player stats for the selected game
  const [selectedOpponentName, setSelectedOpponentName] = useState(''); // To store the opponent's name

  useEffect(() => {
    dispatch(getGames()); // Fetch games when component mounts
  }, [dispatch]);

  useEffect(() => {
    // Fetch game stats if a game is selected
    if (selectedGameId) {
      const fetchGameDetails = async () => {
        try {
          const response = await fetch(`/api/playersByGame/${selectedGameId}`);
          if (response.ok) {
            const data = await response.json();
            setPlayerDetails(data);
          } else {
            console.error('Failed to fetch game details:', response.statusText);
          }
        } catch (error) {
          console.error("Error fetching game details:", error);
        }
      };

      fetchGameDetails();

      // Update the opponent name based on selected game ID
      const selectedGame = games.find((game) => game.id === selectedGameId);
      if (selectedGame) {
        setSelectedOpponentName(selectedGame.opponent_name);
      }
    }
  }, [selectedGameId, games]); // Dependency array ensures the effect runs only when selectedGameId changes

  const formatDateandTime = (date: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) return <p>Loading games...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Games</h1>

      <ul className="mb-8">
        {games.map((game) => (
          <li
            key={game.id}
            onClick={() => setSelectedGameId(game.id)} // Set the selected game ID on click
            className="mb-2 p-2 cursor-pointer hover:bg-gray-200"
          >
            {game.opponent_name} {formatDateandTime(game.created_at)}
          </li>
        ))}
      </ul>

      {selectedGameId && playerDetails ? (
        <div className="overflow-x-auto mt-8">
          <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
            Box Score for Game vs. {selectedOpponentName}
          </h2>
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
                  <td colSpan={5} className="px-4 py-2 text-center text-gray-500">No player stats available for this game.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">Select a game to view stats.</p>
      )}
    </div>
  );
}
