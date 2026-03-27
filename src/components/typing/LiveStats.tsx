"use client";
import React from 'react';

interface LiveStatsProps {
  timeRemaining: number;
  wpm: number;
  resetGame: () => void;
}

export const LiveStats: React.FC<LiveStatsProps> = ({ timeRemaining, wpm, resetGame }) => {
  return (
    <div className="live-stats">
      <span className="live-stat countdown">{Math.ceil(timeRemaining)}s</span>
      <span className="live-stat">{wpm} WPM</span>
      <button 
        className="reset-icon" 
        onClick={(e) => { 
          e.stopPropagation(); 
          resetGame(); 
        }}
      >
        ↻
      </button>
    </div>
  );
};
