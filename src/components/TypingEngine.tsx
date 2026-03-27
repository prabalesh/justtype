"use client";
import { useEffect, useRef } from 'react';
import { useTypingEngine, TypingEngineConfig } from '../hooks/useTypingEngine';
import { Header } from './common/Header';
import { Footer } from './common/Footer';
import { 
  WordsDisplay, 
  LiveStats, 
  ResultsPanel, 
  SettingsPanel 
} from './typing';

interface TypingEngineProps {
  config?: TypingEngineConfig;
}

export default function TypingEngine({ config }: TypingEngineProps) {
  const {
    timeLimit,
    difficulty,
    includeNumbers,
    includeSymbols,
    gameStarted,
    gameFinished,
    targetText,
    userInput,
    timeElapsed,
    timeRemaining,
    wpm,
    rawWpm,
    accuracy,
    isFocused,
    inputRef,
    isServerControlled,
    handleInputChange,
    resetGame,
    handleTimeLimitChange,
    handleDifficultyChange,
    handleNumbersToggle,
    handleSymbolsToggle,
    setIsFocused,
  } = useTypingEngine(config);

  const wordsDisplayRef = useRef<HTMLDivElement>(null);

  // Auto-scrolling logic for the words display
  useEffect(() => {
    if (wordsDisplayRef.current && gameStarted) {
      const container = wordsDisplayRef.current;
      const activeChar = container.querySelector('.char.current, .current-space');

      if (activeChar) {
        const charRect = activeChar.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const lineHeight = parseFloat(getComputedStyle(container).lineHeight);
        const relativeTop = charRect.top - containerRect.top + container.scrollTop;
        const currentLine = Math.floor(relativeTop / lineHeight);

        if (currentLine > 2) {
          const scrollAmount = (currentLine - 2) * lineHeight;
          container.scrollTop = scrollAmount;
        }
      }
    }
  }, [userInput, gameStarted]);

  // Handle focus behavior
  useEffect(() => {
    inputRef.current?.focus();
    setIsFocused(true);
  }, [inputRef, setIsFocused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputRef]);

  const handleScreenClick = () => inputRef.current?.focus();

  return (
    <div className="app">
      <Header />

      <div className="main-content">
        <div className="typing-section" onClick={handleScreenClick}>
          <div className="typing-container">
            <WordsDisplay 
              ref={wordsDisplayRef}
              targetText={targetText}
              userInput={userInput}
              gameFinished={gameFinished}
            />
          </div>

          {gameStarted && (
            <LiveStats 
              timeRemaining={timeRemaining}
              wpm={wpm}
              resetGame={resetGame}
            />
          )}

          {gameFinished && (
            <ResultsPanel 
              wpm={wpm}
              accuracy={accuracy}
              timeElapsed={timeElapsed}
              rawWpm={rawWpm}
              resetGame={resetGame}
            />
          )}

          {!isFocused && !gameStarted && !gameFinished && (
            <div className="focus-overlay-typing" onClick={handleScreenClick}>
              <div className="focus-message">Click to focus</div>
            </div>
          )}
        </div>

        {!gameStarted && !gameFinished && (
          <SettingsPanel 
            timeLimit={timeLimit}
            difficulty={difficulty}
            includeNumbers={includeNumbers}
            includeSymbols={includeSymbols}
            isFocused={isFocused}
            isServerControlled={isServerControlled}
            onTimeLimitChange={handleTimeLimitChange}
            onDifficultyChange={handleDifficultyChange}
            onNumbersToggle={handleNumbersToggle}
            onSymbolsToggle={handleSymbolsToggle}
          />
        )}

        <input
          ref={inputRef}
          type="text"
          className="hidden-input"
          value={userInput}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={gameFinished}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
        />
      </div>

      <Footer />
    </div>
  );
}
