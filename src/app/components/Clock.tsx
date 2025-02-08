"use client";

interface ClockProps {
  timeLeft: number;
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
}

const Clock = ({ timeLeft, isRunning, onStartPause, onReset }: ClockProps) => {
  // Format the time in mm:ss format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Render
  return (
    <div className="flex flex-col items-center mt-2 mb-2">
        <h1 className="text-3xl font-bold text-gray-700 mb-2">Game Clock</h1>
      <div className="text-6xl font-bold">{formatTime(timeLeft)}</div>
      <div className="mt-4 flex gap-4">
        <button
          onClick={onStartPause}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
            isRunning ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Clock;
