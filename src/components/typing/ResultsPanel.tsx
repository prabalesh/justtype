"use client";
import React from 'react';

interface ResultsPanelProps {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  rawWpm: number;
  resetGame: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ 
  wpm, 
  accuracy, 
  timeElapsed, 
  rawWpm, 
  resetGame 
}) => {
  return (
    <div className="results-panel" onClick={(e) => e.stopPropagation()}>
      <div className="results-grid">
        <div className="result-item">
          <div className="result-label">wpm</div>
          <div className="result-value">{wpm}</div>
        </div>
        <div className="result-item">
          <div className="result-label">acc</div>
          <div className="result-value">{accuracy}%</div>
        </div>
        <div className="result-item">
          <div className="result-label">time</div>
          <div className="result-value">{timeElapsed.toFixed(1)}s</div>
        </div>
        <div className="result-item">
          <div className="result-label">raw</div>
          <div className="result-value">{rawWpm}</div>
        </div>
      </div>
      <button
        className="next-test-btn"
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          resetGame();
        }}
      >
        next test
      </button>
    </div>
  );
};
