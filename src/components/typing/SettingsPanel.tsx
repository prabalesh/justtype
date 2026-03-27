"use client";
import React from 'react';
import { Difficulty } from '../../hooks/useTypingEngine';

interface SettingsPanelProps {
  timeLimit: number;
  difficulty: Difficulty;
  includeNumbers: boolean;
  includeSymbols: boolean;
  isFocused: boolean;
  isServerControlled?: boolean;
  onTimeLimitChange: (limit: number) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNumbersToggle: () => void;
  onSymbolsToggle: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  timeLimit,
  difficulty,
  includeNumbers,
  includeSymbols,
  isFocused,
  isServerControlled,
  onTimeLimitChange,
  onDifficultyChange,
  onNumbersToggle,
  onSymbolsToggle
}) => {
  if (isServerControlled) return null;

  return (
    <div className={`settings-panel ${!isFocused ? 'blurred' : ''}`} onClick={(e) => e.stopPropagation()}>
      <div className="settings-row">
        {[90, 60, 30, 15].map((limit) => (
          <button
            key={limit}
            className={timeLimit === limit ? 'setting-btn active' : 'setting-btn'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onTimeLimitChange(limit)}
          >
            {limit}
          </button>
        ))}
      </div>

      <div className="settings-row">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
          <button
            key={diff}
            className={difficulty === diff ? 'setting-btn active' : 'setting-btn'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onDifficultyChange(diff)}
          >
            {diff}
          </button>
        ))}
      </div>

      <div className="settings-row">
        <button
          className={includeNumbers ? 'setting-btn active' : 'setting-btn'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onNumbersToggle}
        >
          numbers
        </button>
        <button
          className={includeSymbols ? 'setting-btn active' : 'setting-btn'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onSymbolsToggle}
        >
          symbols
        </button>
      </div>

      <div className="unfocus-hint">
        <button className="esc-btn">esc</button>
        <span className="hint-text">- unfocus</span>
      </div>
    </div>
  );
};
