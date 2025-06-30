"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

function App() {
  const GRID_SIZE = 20; // Size of each grid cell in pixels
  const BOARD_SIZE = 400; // Total board size in pixels (20 * 20)
  const INITIAL_SNAKE = [{ x: 10, y: 10 }]; // Initial snake position
  const INITIAL_DIRECTION = 'RIGHT';
  const GAME_SPEED = 150; // Milliseconds per frame

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 }); // Initial food position
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const gameInterval = useRef<NodeJS.Timeout | null>(null); // Ref to hold the interval ID
  const lastDirection = useRef(INITIAL_DIRECTION); // Ref to prevent immediate reverse

  // Function to generate random food position
  const generateFood = useCallback(() => {
    let newFood: { x: number; y: number };
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (BOARD_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (BOARD_SIZE / GRID_SIZE)),
      };
      // Ensure food does not spawn on the snake
      const collisionWithSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!collisionWithSnake) {
        break;
      }
    }
    return newFood;
  }, [snake]);

  // Game start/reset logic
  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    lastDirection.current = INITIAL_DIRECTION;
    setFood(generateFood()); // Generate new food for the new game
    setScore(0);
    setGameOver(false);
    setGameStarted(true);

    // Clear any existing interval before starting a new one
    if (gameInterval.current) {
      clearInterval(gameInterval.current);
    }
  };

  // Game logic for movement and collision detection
  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (gameInterval.current) {
        clearInterval(gameInterval.current);
      }
      return;
    }

    gameInterval.current = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] }; // Current head position
        let newHead = { ...head }; // Next head position

        // Update newHead based on current direction
        switch (direction) {
          case 'UP':
            newHead.y -= 1;
            break;
          case 'DOWN':
            newHead.y += 1;
            break;
          case 'LEFT':
            newHead.x -= 1;
            break;
          case 'RIGHT':
            newHead.x += 1;
            break;
          default:
            break;
        }

        // Check for wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE / GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE / GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake; // Return current snake to prevent further movement
        }

        // Check for self-collision
        const isSelfCollision = prevSnake.some(
          (segment, index) =>
            index !== 0 && segment.x === newHead.x && segment.y === newHead.y
        );

        if (isSelfCollision) {
          setGameOver(true);
          return prevSnake; // Return current snake to prevent further movement
        }

        // Create new snake array with the new head
        const newSnake = [newHead, ...prevSnake];

        // Check if food is eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(prevScore => prevScore + 1);
          setFood(generateFood()); // Generate new food
          // Snake grows, so don't remove tail
        } else {
          // Snake moves, remove tail
          newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    // Cleanup function: clear interval when component unmounts or dependencies change
    return () => {
      if (gameInterval.current) {
        clearInterval(gameInterval.current);
      }
    };
  }, [gameStarted, gameOver, direction, food, generateFood]); // Re-run effect if these change

  // Keyboard input handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameStarted || gameOver) return;

    const currentDirection = lastDirection.current;

    switch (e.key) {
      case 'ArrowUp':
        if (currentDirection !== 'DOWN') {
          setDirection('UP');
          lastDirection.current = 'UP';
        }
        break;
      case 'ArrowDown':
        if (currentDirection !== 'UP') {
          setDirection('DOWN');
          lastDirection.current = 'DOWN';
        }
        break;
      case 'ArrowLeft':
        if (currentDirection !== 'RIGHT') {
          setDirection('LEFT');
          lastDirection.current = 'LEFT';
        }
        break;
      case 'ArrowRight':
        if (currentDirection !== 'LEFT') {
          setDirection('RIGHT');
          lastDirection.current = 'RIGHT';
        }
        break;
      default:
        break;
    }
  }, [gameStarted, gameOver]);

  // Add and remove keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // Re-attach listener if handleKeyDown changes (which it won't due to useCallback)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-green-400">React Snake</h1>
      <div className="mb-4 text-xl font-semibold">Score: {score}</div>
      <div
        className="relative border-4 border-gray-700 bg-gray-800 rounded-lg overflow-hidden"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
      >
        {/* Render Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute rounded-sm ${index === 0 ? 'bg-green-500' : 'bg-green-600'}`}
            style={{
              left: segment.x * GRID_SIZE,
              top: segment.y * GRID_SIZE,
              width: GRID_SIZE,
              height: GRID_SIZE,
            }}
          ></div>
        ))}

        {/* Render Food */}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            left: food.x * GRID_SIZE,
            top: food.y * GRID_SIZE,
            width: GRID_SIZE,
            height: GRID_SIZE,
          }}
        ></div>

        {/* Game Over / Start Screen Overlay */}
        {(!gameStarted || gameOver) && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center rounded-lg z-10">
            {gameOver && (
              <p className="text-4xl font-bold text-red-500 mb-4 animate-bounce">Game Over!</p>
            )}
            <button
              onClick={startGame}
              className="px-6 py-3 bg-green-500 text-white text-xl font-semibold rounded-lg shadow-lg hover:bg-green-600 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
            >
              {gameOver ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>
      <p className="mt-6 text-sm text-gray-400">Use Arrow Keys to control the snake.</p>
    </div>
  );
}export default App;

