import { useState, useEffect, useRef, useCallback } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

export const SAMPLE_TEXTS = {
    easy: "the quick brown fox jumps over lazy dog cat sat on mat love to code every day practice makes perfect stay focused and work hard never give up on your dreams learning is journey keep moving forward believe in yourself always do your best success comes with effort time is precious make it count stay positive motivated reading books expands mind healthy food gives energy morning walk refreshes body good sleep important rest well drink water stay hydrated smile more worry less enjoy simple things life beautiful gift treasure each moment family friends matter most kindness costs nothing spread joy help others when possible take break relax breathe deeply nature heals mind music soothes soul art inspires creativity dance brings happiness laughter medicine adventure awaits courage growth report supply yay happy comet or bamboo lawyer survey in sad or yay advice plasma herbal happy at active marsh editor effect with tide and plasma walrus legend sad knight pirate at lawyer at with on survey penguin summer",
    medium: "technology evolves rapidly requiring constant learning adaptation software development demands logical thinking creative problem solving attention detail modern applications must responsive accessible user friendly collaboration communication essential skills developers understanding algorithms improves code efficiency writing clean helps future maintenance testing ensures reliability debugging critical skill master version control enables team coordination security practices protect data implementing patterns promotes reusability performance optimization enhances experience continuous integration streamlines deployment agile methodology facilitates flexibility documentation crucial knowledge sharing refactoring maintains codebase health monitoring identifies issues proactively scalability accommodates growth architecture decisions impact longevity report supply yay happy comet or bamboo lawyer survey in sad or yay advice plasma herbal happy at active marsh editor effect with tide and plasma walrus legend sad knight pirate at lawyer at with on survey penguin summer",
    hard: "asynchronous programming paradigms facilitate non-blocking operations through event-driven architectures implementing robust error handling mechanisms ensures application resilience against unexpected failures edge cases optimizing database queries significantly improves performance microservices architecture enables scalable distributed systems leveraging caching strategies reduces latency authentication safeguards user data utilizing design patterns promotes maintainable codebases proficiency functional programming enhances declarative capabilities understanding complexity analysis informs algorithmic decisions containerization orchestration streamline deployment processes continuous monitoring observability essential production environments immutable infrastructure promotes consistency idempotent operations guarantee reliability distributed tracing debugs complex interactions service mesh manages inter-service communication circuit breakers prevent cascading failures"
};

export function generateText(difficulty: Difficulty, includeNumbers: boolean, includeSymbols: boolean): string {
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

export interface TypingEngineConfig {
    initialTimeLimit?: number;
    initialDifficulty?: Difficulty;
    initialIncludeNumbers?: boolean;
    initialIncludeSymbols?: boolean;
    externalTargetText?: string;
    isServerControlled?: boolean;
}

export function useTypingEngine(config: TypingEngineConfig = {}) {
    const {
        initialTimeLimit = 60,
        initialDifficulty = 'medium',
        initialIncludeNumbers = false,
        initialIncludeSymbols = false,
        externalTargetText,
        isServerControlled = false
    } = config;

    // Use initial values but allow them to be updated if NOT in-game
    const [timeLimit, setTimeLimit] = useState(initialTimeLimit);
    const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
    const [includeNumbers, setIncludeNumbers] = useState(initialIncludeNumbers);
    const [includeSymbols, setIncludeSymbols] = useState(initialIncludeSymbols);

    const [gameStarted, setGameStarted] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [targetText, setTargetText] = useState(externalTargetText || '');
    const [userInput, setUserInput] = useState('');
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(initialTimeLimit);
    const [wpm, setWpm] = useState(0);
    const [rawWpm, setRawWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFocused, setIsFocused] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [textVersion, setTextVersion] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const intervalRef = useRef<number | null>(null);

    const resetGame = useCallback((refocus = true) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        setGameStarted(false);
        setGameFinished(false);
        setUserInput('');
        setTimeElapsed(0);
        setTimeRemaining(timeLimit);
        setWpm(0);
        setRawWpm(0);
        setAccuracy(100);
        setStartTime(null);

        if (!isServerControlled && !externalTargetText) {
            setTextVersion(prev => prev + 1);
        }

        if (refocus) {
            setIsFocused(true);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [timeLimit, isServerControlled, externalTargetText]);

    // Sync with external config changes if it's server controlled
    useEffect(() => {
        if (isServerControlled && externalTargetText) {
            setTargetText(externalTargetText);
            resetGame(false); // Silent reset if text changes from server
        }
    }, [externalTargetText, isServerControlled, resetGame]);

    // Handle initial text generation or external text
    useEffect(() => {
        if (externalTargetText) {
            setTargetText(externalTargetText);
        } else if (!targetText && !isServerControlled) {
            const text = generateText(difficulty, includeNumbers, includeSymbols);
            setTargetText(text);
        }
    }, [externalTargetText, isServerControlled, difficulty, includeNumbers, includeSymbols, targetText]);

    // Update text when settings change (local mode only)
    useEffect(() => {
        if (!gameStarted && !gameFinished && !isServerControlled && !externalTargetText) {
            const text = generateText(difficulty, includeNumbers, includeSymbols);
            setTargetText(text);
            setTimeRemaining(timeLimit);
        }
    }, [timeLimit, difficulty, includeNumbers, includeSymbols, textVersion, gameStarted, gameFinished, isServerControlled, externalTargetText]);

    // Timer logic and stat calculation
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
                    setGameFinished(true);
                    setGameStarted(false);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                }
            }, 100);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }
    }, [gameStarted, gameFinished, startTime, userInput, targetText, timeLimit]);

    // Completion check
    useEffect(() => {
        if (gameStarted && !gameFinished && userInput.length >= targetText.length && targetText.length > 0) {
            setGameFinished(true);
            setGameStarted(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [userInput, targetText, gameStarted, gameFinished]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (gameFinished) return;
        const value = e.target.value;

        if (!gameStarted && !gameFinished && value.length === 1) {
            setGameStarted(true);
            setStartTime(Date.now());
            setTimeRemaining(timeLimit);
        }

        if (value.length <= targetText.length) {
            setUserInput(value);
        }
    };

    const handleTimeLimitChange = (newLimit: number) => {
        if (gameStarted || isServerControlled) return;
        setTimeLimit(newLimit);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleDifficultyChange = (newDifficulty: Difficulty) => {
        if (gameStarted || isServerControlled) return;
        setDifficulty(newDifficulty);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleNumbersToggle = () => {
        if (gameStarted || isServerControlled) return;
        setIncludeNumbers(prev => !prev);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleSymbolsToggle = () => {
        if (gameStarted || isServerControlled) return;
        setIncludeSymbols(prev => !prev);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    return {
        // State
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

        // Actions
        handleInputChange,
        resetGame,
        handleTimeLimitChange,
        handleDifficultyChange,
        handleNumbersToggle,
        handleSymbolsToggle,
        setIsFocused,
        finishGame: () => {
            setGameFinished(true);
            setGameStarted(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    };
}
