import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

type Difficulty = 'easy' | 'medium' | 'hard';

const SAMPLE_TEXTS = {
  easy: "the quick brown fox jumps over lazy dog cat sat on mat love to code every day practice makes perfect stay focused and work hard never give up on your dreams learning is journey keep moving forward believe in yourself always do your best success comes with effort time is precious make it count stay positive motivated reading books expands mind healthy food gives energy morning walk refreshes body good sleep important rest well drink water stay hydrated smile more worry less enjoy simple things life beautiful gift treasure each moment family friends matter most kindness costs nothing spread joy help others when possible take break relax breathe deeply nature heals mind music soothes soul art inspires creativity dance brings happiness laughter medicine adventure awaits courage growth report supply yay happy comet or bamboo lawyer survey in sad or yay advice plasma herbal happy at active marsh editor effect with tide and plasma walrus legend sad knight pirate at lawyer at with on survey penguin summer",
  medium: "technology evolves rapidly requiring constant learning adaptation software development demands logical thinking creative problem solving attention detail modern applications must responsive accessible user friendly collaboration communication essential skills developers understanding algorithms improves code efficiency writing clean helps future maintenance testing ensures reliability debugging critical skill master version control enables team coordination security practices protect data implementing patterns promotes reusability performance optimization enhances experience continuous integration streamlines deployment agile methodology facilitates flexibility documentation crucial knowledge sharing refactoring maintains codebase health monitoring identifies issues proactively scalability accommodates growth architecture decisions impact longevity report supply yay happy comet or bamboo lawyer survey in sad or yay advice plasma herbal happy at active marsh editor effect with tide and plasma walrus legend sad knight pirate at lawyer at with on survey penguin summer",
  hard: "asynchronous programming paradigms facilitate non-blocking operations through event-driven architectures implementing robust error handling mechanisms ensures application resilience against unexpected failures edge cases optimizing database queries significantly improves performance microservices architecture enables scalable distributed systems leveraging caching strategies reduces latency authentication safeguards user data utilizing design patterns promotes maintainable codebases proficiency functional programming enhances declarative capabilities understanding complexity analysis informs algorithmic decisions containerization orchestration streamline deployment processes continuous monitoring observability essential production environments immutable infrastructure promotes consistency idempotent operations guarantee reliability distributed tracing debugs complex interactions service mesh manages inter-service communication circuit breakers prevent cascading failures"
};

function generateText(difficulty: Difficulty, includeNumbers: boolean, includeSymbols: boolean): string {
  let baseText = SAMPLE_TEXTS[difficulty];
  let words = baseText.split(' ');
  
  words = [...words].sort(() => Math.random() - 0.5);
  
  words = words.map(word => {
    let modifiedWord = word;
    
    if (Math.random() > 0.7) {
      modifiedWord = modifiedWord.charAt(0).toUpperCase() + modifiedWord.slice(1);
    }
    if (includeNumbers && Math.random() > 0.85) {
      modifiedWord += Math.floor(Math.random() * 100);
    }
    if (includeSymbols && Math.random() > 0.85) {
      const symbols = ['!', '@', '#', '$', '%'];
      modifiedWord += symbols[Math.floor(Math.random() * symbols.length)];
    }
    return modifiedWord;
  });
  
  return words.join(' ');
}

function App() {
  const [timeLimit, setTimeLimit] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [targetText, setTargetText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFocused, setIsFocused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [textVersion, setTextVersion] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | null>(null);
  const wordsDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = generateText(difficulty, includeNumbers, includeSymbols);
    setTargetText(text);
  }, []);

  useEffect(() => {
    if (!gameStarted && !gameFinished) {
      const text = generateText(difficulty, includeNumbers, includeSymbols);
      setTargetText(text);
      setTimeRemaining(timeLimit);
    }
  }, [timeLimit, difficulty, includeNumbers, includeSymbols, textVersion, gameStarted, gameFinished]);

  useEffect(() => {
    inputRef.current?.focus();
    setIsFocused(true);
  }, []);

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

  useEffect(() => {
    if (gameStarted && !gameFinished && startTime) {
      intervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setTimeElapsed(elapsed);
        
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeRemaining(remaining);
        
        const minutes = elapsed / 60;
        
        if (minutes > 0) {
          const allCharsTyped = userInput.length;
          const calculatedRawWpm = Math.round((allCharsTyped / 5) / minutes);
          setRawWpm(calculatedRawWpm);
          
          let correctChars = 0;
          for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] === targetText[i]) {
              correctChars++;
            }
          }
          const calculatedWpm = Math.round((correctChars / 5) / minutes);
          setWpm(calculatedWpm);
          
          if (userInput.length > 0) {
            const acc = Math.round((correctChars / userInput.length) * 100);
            setAccuracy(acc);
          }
        }
        
        if (elapsed >= timeLimit) {
          finishGame();
        }
      }, 100);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [gameStarted, gameFinished, startTime, userInput, targetText, timeLimit]);

  useEffect(() => {
    if (gameStarted && !gameFinished && userInput.length >= targetText.length) {
      finishGame();
    }
  }, [userInput, targetText, gameStarted, gameFinished]);

  const finishGame = useCallback(() => {
    setGameFinished(true);
    setGameStarted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (gameFinished) {
      return;
    }
    
    if (!gameStarted && !gameFinished && value.length === 1) {
      setGameStarted(true);
      setStartTime(Date.now());
      setTimeRemaining(timeLimit);
    }
    
    if (value.length <= targetText.length) {
      setUserInput(value);
    }
  };

  const resetGame = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setGameStarted(false);
    setGameFinished(false);
    setUserInput('');
    setTimeElapsed(0);
    setTimeRemaining(timeLimit);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setStartTime(null);
    
    if (wordsDisplayRef.current) {
      wordsDisplayRef.current.scrollTop = 0;
    }
    
    setTextVersion(prev => prev + 1);
    
    setIsFocused(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleScreenClick = () => {
    inputRef.current?.focus();
  };

  const handleTimeLimitChange = (newLimit: number) => {
    if (gameStarted) return;
    setTimeLimit(newLimit);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    if (gameStarted) return;
    setDifficulty(newDifficulty);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleNumbersToggle = () => {
    if (gameStarted) return;
    setIncludeNumbers(!includeNumbers);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleSymbolsToggle = () => {
    if (gameStarted) return;
    setIncludeSymbols(!includeSymbols);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderWords = () => {
    const words = targetText.split(' ');
    let charIndex = 0;

    return words.map((word, wordIndex) => {
      const wordStart = charIndex;
      const wordChars = word.split('');
      
      const wordElements = wordChars.map((char, charIndexInWord) => {
        const absoluteIndex = wordStart + charIndexInWord;
        const isTyped = absoluteIndex < userInput.length;
        const typedChar = userInput[absoluteIndex];
        const isCorrect = typedChar === char;
        const isCurrent = absoluteIndex === userInput.length;

        charIndex++;

        let className = 'char';
        if (isTyped) {
          className += isCorrect ? ' correct' : ' incorrect';
        }
        if (isCurrent && !gameFinished) {
          className += ' current';
        }

        return (
          <span key={charIndexInWord} className={className}>
            {char}
          </span>
        );
      });

      charIndex++;
      
      const spaceIndex = wordStart + word.length;
      const spaceCurrent = userInput.length === spaceIndex;

      return (
        <span key={wordIndex} className="word">
          {wordElements}
          {wordIndex < words.length - 1 && (
            <span className={`char-space ${spaceCurrent && !gameFinished ? 'current-space' : ''}`}> </span>
          )}
        </span>
      );
    });
  };

  return (
    <div className="app">
      <div className="header">
        <h1 className="logo">JustType</h1>
      </div>

      <div className="main-content">
        <div className="typing-section" onClick={handleScreenClick}>

          <div className="typing-container">
            <div className="words-display" style={{textAlign:"center"}} ref={wordsDisplayRef}>
              {renderWords()}
            </div>
          </div>

          {gameStarted && (
            <div className="live-stats">
              <span className="live-stat countdown">{Math.ceil(timeRemaining)}s</span>
              <span className="live-stat">{wpm} WPM</span>
              <button className="reset-icon" onClick={(e) => { e.stopPropagation(); resetGame(); }}>↻</button>
            </div>
          )}

          {gameFinished && (
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
          )}

          {!isFocused && !gameStarted && !gameFinished && (
            <div className="focus-overlay-typing" onClick={handleScreenClick}>
              <div className="focus-message">Click to focus</div>
            </div>
          )}

        </div>

        {!gameStarted && !gameFinished && (
          <div className={`settings-panel ${!isFocused ? 'blurred' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="settings-row">
              <button
                className={timeLimit === 90 ? 'setting-btn active' : 'setting-btn'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleTimeLimitChange(90)}
              >
                90
              </button>
              <button
                className={timeLimit === 60 ? 'setting-btn active' : 'setting-btn'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleTimeLimitChange(60)}
              >
                60
              </button>
              <button
                className={timeLimit === 30 ? 'setting-btn active' : 'setting-btn'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleTimeLimitChange(30)}
              >
                30
              </button>
              <button
                className={timeLimit === 15 ? 'setting-btn active' : 'setting-btn'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleTimeLimitChange(15)}
              >
                15
              </button>
            </div>

            <div className="settings-row">
              <button
                className={difficulty === 'easy' ? 'setting-btn active' : 'setting-btn'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleDifficultyChange('easy')}
              >
                easy
              </button>
              <button
                className={difficulty === 'medium' ? 'setting-btn active' : 'setting-btn'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleDifficultyChange('medium')}
              >
                medium
              </button>
              <button
                className={difficulty === 'hard' ? 'setting-btn active' : 'setting-btn'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleDifficultyChange('hard')}
              >
                hard
              </button>
            </div>

            <div className="settings-row">
              <button
                className={includeNumbers ? 'setting-btn active' : 'setting-btn'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleNumbersToggle}
              >
                numbers
              </button>
              <button
                className={includeSymbols ? 'setting-btn active' : 'setting-btn'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSymbolsToggle}
              >
                symbols
              </button>
            </div>

            <div className="unfocus-hint">
              <button className="esc-btn">esc</button>
              <span className="hint-text">- unfocus</span>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          className="hidden-input"
          value={userInput}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={gameFinished}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <span className="footer-text">just type bro</span>
          </div>
          <div className="footer-divider">·</div>
          <div className="footer-section">
            <a 
              href="https://github.com/prabalesh/justtype" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              github
              <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              justtype
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
