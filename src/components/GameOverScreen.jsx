import React from 'react';

/**
 * GameOverScreen Component
 *
 * Displays the final game statistics, highlights high score achievements, and allows the player
 * to either immediately jump back into gameplay or return to the main menu.
 */
export default function GameOverScreen({ score, highScore, onPlayAgain, onMainMenu }) {
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div className="screen game-over-screen">
      <div className="game-card game-over-card">
        <div className="game-over-icon">💥</div>
        <h1 className="game-title game-over-title">Game Over</h1>

        {isNewRecord && (
          <div className="new-record-badge">
            🏆 NEW HIGH SCORE! 🏆
          </div>
        )}

        {/* Statistics Display */}
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Final Score</span>
            <span className="stat-value current-score">{score}</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">Best Record</span>
            <span className="stat-value high-score">{highScore}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button className="btn btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
          <button className="btn btn-secondary" onClick={onMainMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
