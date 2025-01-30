"use client"

import { useState, useEffect } from "react";
import Clock from "@/app/components/Clock";
import { useSelector, useDispatch } from "react-redux";
import {
    selectCurrentGame,
    selectGameClock,
    selectIsGameRunning,
    startGameClock,
    stopGameClock,
    resetGameClock,
    incrementGameClock,
} from "../store/features/dataSlice";
import { useAppDispatch } from "@/app/store/hooks"; // Add your dispatch import

export default function GameManager() {
    const dispatch = useAppDispatch();
    const currentGame = useSelector(selectCurrentGame);
    const gameClock = useSelector(selectGameClock);
    const isGameRunning = useSelector(selectIsGameRunning);

    let gameLength = 0;
    if (currentGame) {
        gameLength = currentGame[0].game_length * 60 || 1920;
    }

    const [timeLeft, setTimeLeft] = useState<number>(gameLength); // Track time in seconds

    useEffect(()=> {
        if (currentGame) {
            gameLength = currentGame[0].game_length * 60 || 1920;
            setTimeLeft(gameLength);
        }
    },[currentGame])

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isGameRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime: number) => Math.max(prevTime - 1, 0));
                dispatch(incrementGameClock()); // Update global game clock in Redux store
            }, 1000);
        } else if (timeLeft === 0) {
            dispatch(stopGameClock()); // Stop the game when time is up
        }

        return () => clearInterval(timer); // Cleanup on unmount or when timer stops
    }, [isGameRunning, timeLeft, dispatch]);

    const handleStartPause = () => {
        if (!isGameRunning) {
            dispatch(startGameClock());
        } else {
            dispatch(stopGameClock());
        }
    };

    const handleReset = () => {
        gameLength = currentGame[0].game_length * 60 || 1920;
        setTimeLeft(gameLength);
        dispatch(resetGameClock()); // Reset game clock in Redux store
    };

    return (
        <div>
            <Clock timeLeft={timeLeft} isRunning={isGameRunning} onStartPause={handleStartPause} onReset={handleReset} />
        </div>
    );
}
