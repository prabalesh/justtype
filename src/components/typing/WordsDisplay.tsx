"use client";
import React, { forwardRef } from 'react';

interface WordsDisplayProps {
  targetText: string;
  userInput: string;
  gameFinished: boolean;
}

export const WordsDisplay = forwardRef<HTMLDivElement, WordsDisplayProps>(
  ({ targetText, userInput, gameFinished }, ref) => {
    const renderWords = () => {
      const words = targetText.split(' ');
      let charCount = 0;

      return words.map((word, wordIndex) => {
        const wordStart = charCount;
        const wordChars = word.split('');

        const wordElements = wordChars.map((char, charIndexInWord) => {
          const absoluteIndex = wordStart + charIndexInWord;
          const isTyped = absoluteIndex < userInput.length;
          const typedChar = userInput[absoluteIndex];
          const isCorrect = typedChar === char;
          const isCurrent = absoluteIndex === userInput.length;

          charCount++;

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

        // Add space after word
        charCount++;

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
      <div className="words-display" style={{ textAlign: "center" }} ref={ref}>
        {renderWords()}
      </div>
    );
  }
);

WordsDisplay.displayName = 'WordsDisplay';
