// components/SaveStatsButton.tsx
'use client'

const saveStats = async (playerId: string, gameId: string, stats: object) => {
    try {
      const response = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, gameId, stats }),
      });
  
      if (!response.ok) throw new Error("Failed to save stats");
      const result = await response.json();
      console.log("Stats saved:", result);
    } catch (error) {
      console.error("Error saving stats:", error);
    }
  };
  
  // Example button to log stats
  const SaveStatsButton = () => {
    const handleSave = () => {
      const stats = {
        enter_time: new Date().toISOString(),
        leave_time: new Date(new Date().getTime() + 300000).toISOString(), // +5 min
        points: 5,
        rebounds: 2,
        assists: 3,
      };
  
      saveStats("playerId123", "gameId123", stats);
    };
  
    return <button onClick={handleSave}>Save Stats</button>;
  };
  
  export default SaveStatsButton;
  