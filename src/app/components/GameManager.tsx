"use client";

import { useState, useEffect } from "react";
import Clock from "@/app/components/Clock";
import { useSelector } from "react-redux";
import { selectCurrentGame } from "../store/features/dataSlice";

export default function GameManager() {
    const currentGame = useSelector(selectCurrentGame);
    
    let gameLength = 0;
    console.log(currentGame);
    

    const [timeLeft, setTimeLeft] = useState<number>(gameLength); // Track time in seconds
    const [isRunning, setIsRunning] = useState<boolean>(false);

    useEffect(()=> {
        if (currentGame) {
            gameLength = currentGame[0].game_length * 60 || 1920;
            setTimeLeft(gameLength);
        }
    },[currentGame])

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
        setTimeLeft(gameLength);
    };

    return (
        <div>
            <Clock 
                timeLeft={timeLeft} 
                isRunning={isRunning} 
                onStartPause={handleStartPause} 
                onReset={handleReset} 
            />
        </div>
    );
}
