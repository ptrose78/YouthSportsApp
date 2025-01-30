"use client";

import { useState, useEffect } from "react";
import Clock from "@/app/components/Clock";
import ActivePlayers from "@/app/components/ActivePlayers";
import { useSelector } from "react-redux";
import { selectCurrentGame } from "../store/features/dataSlice";


export default function GameManager() {
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
            setIsRunning(false);
        }

        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const handleStartPause = () => {
        setIsRunning((prev) => !prev);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(1920);
    };

    return (
        <div>
            <Clock 
                timeLeft={timeLeft.toString()} 
                isRunning={isRunning} 
                onStartPause={handleStartPause} 
                onReset={handleReset} 
            />
            <ActivePlayers players={[]} isRunning={isRunning} />
        </div>
    );
}
