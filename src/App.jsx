import { useState } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import './styles/App.css';

const HIGH_SCORE_STORAGE_KEY = 'fruitSlicerHighScore';

/**
 * App Component - Root State Coordinator
 *
 * Why we lift state (gameState, score, highScore, onGameOver, onExit) up to App.jsx:
 * 1. Single Source of Truth: In React, state belongs in the closest common parent component that
 *    needs to share data across multiple sibling screens.
 * 2. Cross-Screen Communication: `GameScreen` produces the final score, but `GameOverScreen` needs
 *    to read and display it. If the score remained trapped inside `GameScreen`, `GameOverScreen`
 *    would have no way to access it once `GameScreen` unmounts.
 * 3. Persistence & Clean Resets: Storing `highScore` at the top level allows us to persist it across
 *    sessions in `localStorage`, and exiting or restarting a game unmounts the old `GameScreen` and
 *    mounts a clean, brand-new instance with freshly initialized physics.
 */
export default function App() {
  // Navigation State: 'START' | 'PLAYING' | 'GAME_OVER'
  const [gameState, setGameState] = useState('START');

  // Score Tracking
  const [score, setScore] = useState(0);

  // High Score loaded from localStorage
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Called when the player hits a bomb or runs out of lives
  const handleGameOver = (finalScore) => {
    setScore(finalScore);

    // Check and save new high score to localStorage
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem(HIGH_SCORE_STORAGE_KEY, finalScore.toString());
      } catch (err) {
        console.error('Failed to save high score to localStorage', err);
      }
    }

    setGameState('GAME_OVER');
  };

  // Called when player clicks the Exit button during active gameplay
  const handleExit = () => {
    setScore(0);
    setGameState('START');
  };

  // Restarts the game immediately without going back to menu
  const handlePlayAgain = () => {
    setScore(0);
    setGameState('PLAYING');
  };

  // Returns back to the main start screen from Game Over
  const handleMainMenu = () => {
    setScore(0);
    setGameState('START');
  };

  return (
    <main className="app-container">
      {gameState === 'START' && (
        <StartScreen onPlay={() => setGameState('PLAYING')} />
      )}

      {gameState === 'PLAYING' && (
        <GameScreen onGameOver={handleGameOver} onExit={handleExit} />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          onPlayAgain={handlePlayAgain}
          onMainMenu={handleMainMenu}
        />
      )}
    </main>
  );
}
