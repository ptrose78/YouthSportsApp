"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentGame } from "../store/features/dataSlice";

export default function Clock() {
    const currentGame = useSelector(selectCurrentGame);
    const gameLength = currentGame?.game_length ?? 1920; // Default to 32:00 minutes in seconds (32 * 60)

    const [timeLeft, setTimeLeft] = useState(gameLength); // Track time in seconds
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime: number) => Math.max(prevTime - 1, 0));
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false); // Stop when it reaches zero
        }

        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    const handleStartPause = () => {
        setIsRunning((prev) => !prev);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(gameLength);
    };

    return (
        <div>
            
        </div>
    );
}
