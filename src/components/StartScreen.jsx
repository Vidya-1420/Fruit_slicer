import React from 'react';

export default function StartScreen({ onPlay }) {
  return (
    <div className="screen start-screen">
      <div className="game-card">
        <div className="fruit-badge">🍉 🍌 🍓 🍍</div>
        <h1 className="game-title">Fruit Slicer</h1>
        <p className="game-subtitle">Slice the fruits, avoid the bombs!</p>
        <button className="btn btn-primary" onClick={onPlay}>
          Play Game
        </button>
      </div>
    </div>
  );
}
