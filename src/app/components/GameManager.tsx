"use client";

import { useEffect } from "react";
import Clock from "@/app/components/Clock";
import { useSelector } from "react-redux";
import {
    selectCurrentGame,
    selectTimeLeft,
    selectIsGameRunning,
    startGameClock,
    stopGameClock,
    resetGameClock,
    incrementGameClock,
    decrementTimeLeft, 
    setTimeLeft,       
} from "../store/features/dataSlice";
import { useAppDispatch } from "@/app/store/hooks"; 

export default function GameManager() {
    const dispatch = useAppDispatch();

    // Global state
    const currentGame = useSelector(selectCurrentGame);
    const timeLeft = useSelector(selectTimeLeft);
    const isGameRunning = useSelector(selectIsGameRunning);

    // Set time left
    useEffect(() => {
        if (currentGame) {
            const gameLength = currentGame[0].game_length * 60 || 1920; 
            dispatch(setTimeLeft(gameLength)); 
        }
    }, [currentGame, dispatch]);

    // Start/pause game clock
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isGameRunning && timeLeft > 0) {
            timer = setInterval(() => {
                dispatch(decrementTimeLeft()); 
                dispatch(incrementGameClock()); 
            }, 1000);
        } else if (timeLeft === 0) {
            dispatch(stopGameClock()); 
        }

        return () => clearInterval(timer);
    }, [isGameRunning, timeLeft, dispatch]);

    const handleStartPause = () => {
        if (!isGameRunning) {
            dispatch(startGameClock());
        } else {
            dispatch(stopGameClock());
        }
    };

    const handleReset = () => {
        const gameLength = currentGame[0].game_length * 60 || 1920;
        dispatch(setTimeLeft(gameLength)); 
        dispatch(resetGameClock()); 
    };

    // Render
    return (
        <div>
            <Clock timeLeft={timeLeft} isRunning={isGameRunning} onStartPause={handleStartPause} onReset={handleReset} />
        </div>
    );
}
