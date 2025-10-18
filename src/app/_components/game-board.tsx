"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ALL_REWARD_IMAGES } from "./reward-gallery";

type OperationMode = "addition" | "subtraction" | "multiplication" | "all";

// Constants
const CELEBRATION_DELAY = 600;

type Square = {
  id: number;
  value: number;
  revealed: boolean;
};

type GameBoardProps = {
  mode: OperationMode;
  maxNumber: number;
  boardSize: number;
  selectedTimesTables: number[];
  onComplete: (completedImage: number) => void;
  onRestart: () => void;
  onExit: () => void;
  unlockedImages: number[];
};

// Generate random number between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate target based on operation and two values
function calculateTarget(op: "addition" | "subtraction" | "multiplication", val1: number, val2: number): number {
  switch (op) {
    case "addition":
      return val1 + val2;
    case "subtraction":
      // Always return positive result
      return Math.abs(val1 - val2);
    case "multiplication":
      return val1 * val2;
  }
}

// Check if values match target for given operation
function checkAnswer(
  selectedValues: number[],
  target: number,
  currentOp: "addition" | "subtraction" | "multiplication",
  multiplicationTable: number | null,
): boolean {
  // Multiplication mode: single square selection
  if (currentOp === "multiplication" && multiplicationTable !== null) {
    if (selectedValues.length !== 1) return false;
    const val = selectedValues[0];
    if (val === undefined) return false;
    return val * multiplicationTable === target;
  }

  // Addition/Subtraction mode: two square selection
  if (selectedValues.length !== 2) return false;

  const [val1, val2] = selectedValues;
  if (val1 === undefined || val2 === undefined) return false;

  // For subtraction, check both orderings since we always want positive results
  if (currentOp === "subtraction") {
    return Math.abs(val1 - val2) === target;
  }

  // For addition, order doesn't matter
  return calculateTarget(currentOp, val1, val2) === target;
}

export default function GameBoard({
  mode,
  maxNumber,
  boardSize,
  selectedTimesTables,
  onComplete,
  onRestart,
  onExit,
  unlockedImages,
}: GameBoardProps) {
  const [board, setBoard] = useState<Square[]>([]);
  const [selectedSquares, setSelectedSquares] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [currentOperation, setCurrentOperation] = useState<"addition" | "subtraction" | "multiplication">("addition");
  const [celebratingSquares, setCelebratingSquares] = useState<number[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [backgroundImageNumber, setBackgroundImageNumber] = useState<number>(1);
  const [isComplete, setIsComplete] = useState(false);
  // For multiplication mode: track the times table multiplier and whether to swap display order
  const [multiplicationTable, setMultiplicationTable] = useState<number | null>(null);
  const [multiplicationSwapOrder, setMultiplicationSwapOrder] = useState(false);

  const totalSquares = boardSize * boardSize;

  // Select background image on mount - prioritize unseen images
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount to keep image stable
  useEffect(() => {
    const unseenImages = ALL_REWARD_IMAGES.filter((num) => !unlockedImages.includes(num));

    // If there are unseen images, pick one of those. Otherwise pick random.
    const availableImages = unseenImages.length > 0 ? unseenImages : ALL_REWARD_IMAGES;
    const chosenNumber = availableImages[randomInt(0, availableImages.length - 1)] ?? 1;

    setBackgroundImageNumber(chosenNumber);
    setBackgroundImage(`/assets/${chosenNumber}.png`);
  }, []); // Only run once on mount to keep image stable throughout game

  // Initialize board with random numbers
  useEffect(() => {
    const newBoard: Square[] = [];
    for (let i = 0; i < totalSquares; i++) {
      newBoard.push({
        id: i,
        value: randomInt(1, maxNumber),
        revealed: false,
      });
    }
    setBoard(newBoard);
  }, [maxNumber, totalSquares]);

  // Generate new target when board changes or turn completes
  useEffect(() => {
    if (board.length === 0) return;

    const availableSquares = board.filter((sq) => !sq.revealed);
    if (availableSquares.length === 0) {
      setIsComplete(true);
      onComplete(backgroundImageNumber);
      return;
    }

    // Determine operation for this turn first
    let operation: "addition" | "subtraction" | "multiplication";
    if (mode === "all") {
      // Smart operation selection for All Mixed mode
      if (availableSquares.length === 1) {
        // Only 1 square left - must use multiplication
        operation = "multiplication";
      } else if (availableSquares.length === 2) {
        // Only 2 squares left - must use addition or subtraction (not multiplication which only clears 1)
        const ops: ("addition" | "subtraction")[] = ["addition", "subtraction"];
        operation = ops[randomInt(0, 1)] ?? "addition";
      } else {
        // 3+ squares - any operation is fine
        const ops: ("addition" | "subtraction" | "multiplication")[] = ["addition", "subtraction", "multiplication"];
        operation = ops[randomInt(0, 2)] ?? "addition";
      }
    } else {
      operation = mode as "addition" | "subtraction" | "multiplication";
    }

    setCurrentOperation(operation);

    // Handle multiplication mode differently (single square selection)
    if (operation === "multiplication") {
      if (selectedTimesTables.length === 0) return;
      if (availableSquares.length === 0) return;

      // Pick random square from board
      const randomSquare = availableSquares[randomInt(0, availableSquares.length - 1)];
      if (!randomSquare) return;

      // Pick random times table
      const randomTableIndex = randomInt(0, selectedTimesTables.length - 1);
      const timesTable = selectedTimesTables[randomTableIndex];
      if (!timesTable) return;

      // Calculate target
      const targetValue = randomSquare.value * timesTable;

      // Randomly decide order for display
      const swapOrder = Math.random() < 0.5;

      setTarget(targetValue);
      setMultiplicationTable(timesTable);
      setMultiplicationSwapOrder(swapOrder);
    } else {
      // Addition/Subtraction mode (two square selection)
      if (availableSquares.length < 2) return;

      // Build a list of all possible targets from available squares
      const possibleTargets: Array<{
        target: number;
        square1: Square;
        square2: Square;
      }> = [];

      for (let i = 0; i < availableSquares.length; i++) {
        for (let j = i + 1; j < availableSquares.length; j++) {
          const sq1 = availableSquares[i];
          const sq2 = availableSquares[j];
          if (sq1 && sq2) {
            const target = calculateTarget(operation, sq1.value, sq2.value);
            possibleTargets.push({ target, square1: sq1, square2: sq2 });
          }
        }
      }

      if (possibleTargets.length === 0) return;

      // Pick a random valid target from the possibilities
      const chosen = possibleTargets[randomInt(0, possibleTargets.length - 1)];
      if (!chosen) return;

      setTarget(chosen.target);
      setMultiplicationTable(null);
    }
  }, [board, mode, selectedTimesTables, onComplete, backgroundImageNumber]);

  // Handle square click
  const handleSquareClick = (squareId: number) => {
    const square = board.find((sq) => sq.id === squareId);
    if (!square || square.revealed) return;

    // Toggle selection
    if (selectedSquares.includes(squareId)) {
      setSelectedSquares(selectedSquares.filter((id) => id !== squareId));
    } else {
      // Determine max selections based on operation
      const maxSelections = currentOperation === "multiplication" ? 1 : 2;

      // Only allow maxSelections at a time
      if (selectedSquares.length < maxSelections) {
        const newSelected = [...selectedSquares, squareId];
        setSelectedSquares(newSelected);

        // Check answer when correct number of squares are selected
        if (newSelected.length === maxSelections) {
          const selectedValues = newSelected
            .map((id) => board.find((sq) => sq.id === id)?.value)
            .filter((v): v is number => v !== undefined);

          if (checkAnswer(selectedValues, target, currentOperation, multiplicationTable)) {
            // Correct answer! Show celebration effect
            setCelebratingSquares(newSelected);

            setTimeout(() => {
              setBoard((prev) => prev.map((sq) => (newSelected.includes(sq.id) ? { ...sq, revealed: true } : sq)));
              setSelectedSquares([]);
              setCelebratingSquares([]);
            }, CELEBRATION_DELAY);
          }
        }
      }
    }
  };

  const operationSymbol = {
    addition: "➕",
    subtraction: "➖",
    multiplication: "✖️",
  };

  // Get selected values for display
  const selectedValues = selectedSquares.map((id) => board.find((sq) => sq.id === id)?.value);
  const firstValue = selectedValues[0];
  const secondValue = selectedValues[1];

  return (
    <div className="flex h-screen flex-col gap-3 p-4 sm:gap-4 lg:grid lg:grid-cols-9 lg:gap-8 lg:p-8">
      {/* Left Sidebar - Target Display / Completion Message */}
      <Card className="relative flex min-w-0 flex-col overflow-auto border-4 border-pink-300 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-3 text-center shadow-xl sm:p-4 md:self-start lg:col-span-4 lg:flex-1 lg:p-6">
        {isComplete ? (
          <>
            {/* Completion State */}
            <div className="space-y-3 sm:space-y-4">
              <div className="text-6xl sm:text-8xl">🎉</div>
              <div className="animate-pulse bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text font-bold text-3xl text-transparent sm:text-5xl">
                You Did It!
              </div>
              <div className="flex justify-center gap-2 text-3xl sm:text-4xl">
                <span className="animate-bounce">⭐</span>
                <span className="animation-delay-200 animate-bounce">✨</span>
                <span className="animation-delay-400 animate-bounce">🌟</span>
                <span className="animation-delay-600 animate-bounce">💖</span>
                <span className="animation-delay-800 animate-bounce">🦄</span>
              </div>
              <p className="font-bold text-purple-600 text-xl sm:text-2xl">🌈 Amazing work! 🌈</p>
              <Button
                onClick={onRestart}
                className="mt-3 h-14 animate-pulse cursor-pointer bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 font-bold text-lg text-white shadow-xl transition-all hover:scale-105 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 sm:mt-4 sm:h-16 sm:text-xl"
                size="lg"
              >
                <span className="mr-1 sm:mr-2">🎮</span>
                Play Again
                <span className="ml-1 sm:ml-2">🎮</span>
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Normal Game State */}
            {/* Header with Logo and Title */}
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4 sm:gap-4">
              <img src="/assets/logo.webp" alt="Square Fruit Logo" className="h-12 w-auto sm:h-16" />
              <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text font-bold text-2xl text-transparent sm:text-4xl">
                Square Fruit
              </div>
              <Button
                onClick={onExit}
                variant="outline"
                size="sm"
                className="cursor-pointer border-2 border-pink-300 bg-white/80 font-semibold text-pink-600 text-xs hover:border-pink-400 hover:bg-pink-50 sm:ml-4 sm:text-sm"
              >
                Exit
              </Button>
            </div>

            {/* Equation Display */}
            <div className="flex flex-wrap items-center justify-center gap-2 font-black text-4xl sm:gap-3 sm:text-5xl lg:text-6xl">
              {currentOperation === "multiplication" && multiplicationTable !== null ? (
                <>
                  {/* Multiplication Mode - Show times table × board value = target */}
                  {multiplicationSwapOrder ? (
                    <>
                      {/* Times table first */}
                      <span className="min-w-[60px] rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-100 to-cyan-100 px-3 py-1 text-blue-600 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px]">
                        {multiplicationTable}
                      </span>
                      <span className="text-3xl text-purple-500 sm:text-4xl lg:text-5xl">✖️</span>
                      <div className="relative flex items-center gap-1 sm:gap-2">
                        {selectedSquares.length === 0 && (
                          <span className="animate-bounce text-2xl sm:text-3xl lg:text-4xl">👉</span>
                        )}
                        <span
                          className={`min-w-[60px] rounded-xl border-2 px-3 py-1 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px] ${
                            firstValue !== undefined
                              ? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600"
                              : "border-pink-300 border-dashed bg-white/50 text-pink-300"
                          }`}
                        >
                          {firstValue ?? "?"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Board value first */}
                      <div className="relative flex items-center gap-1 sm:gap-2">
                        {selectedSquares.length === 0 && (
                          <span className="animate-bounce text-2xl sm:text-3xl lg:text-4xl">👉</span>
                        )}
                        <span
                          className={`min-w-[60px] rounded-xl border-2 px-3 py-1 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px] ${
                            firstValue !== undefined
                              ? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600"
                              : "border-pink-300 border-dashed bg-white/50 text-pink-300"
                          }`}
                        >
                          {firstValue ?? "?"}
                        </span>
                      </div>
                      <span className="text-3xl text-purple-500 sm:text-4xl lg:text-5xl">✖️</span>
                      <span className="min-w-[60px] rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-100 to-cyan-100 px-3 py-1 text-blue-600 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px]">
                        {multiplicationTable}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Addition/Subtraction Mode - Show two unknowns */}
                  <div className="relative flex items-center gap-1 sm:gap-2">
                    {selectedSquares.length === 0 && (
                      <span className="animate-bounce text-2xl sm:text-3xl lg:text-4xl">👉</span>
                    )}
                    <span
                      className={`min-w-[60px] rounded-xl border-2 px-3 py-1 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px] ${
                        firstValue !== undefined
                          ? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600"
                          : "border-pink-300 border-dashed bg-white/50 text-pink-300"
                      }`}
                    >
                      {firstValue ?? "?"}
                    </span>
                  </div>

                  <span className="text-3xl text-purple-500 sm:text-4xl lg:text-5xl">
                    {operationSymbol[currentOperation]}
                  </span>

                  <div className="relative flex items-center gap-1 sm:gap-2">
                    {selectedSquares.length === 1 && (
                      <span className="animate-bounce text-2xl sm:text-3xl lg:text-4xl">👉</span>
                    )}
                    <span
                      className={`min-w-[60px] rounded-xl border-2 px-3 py-1 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px] ${
                        secondValue !== undefined
                          ? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600"
                          : "border-pink-300 border-dashed bg-white/50 text-pink-300"
                      }`}
                    >
                      {secondValue ?? "?"}
                    </span>
                  </div>
                </>
              )}

              {/* Equals */}
              <span className="text-3xl text-purple-500 sm:text-4xl lg:text-5xl">=</span>

              {/* Target */}
              <span className="min-w-[60px] rounded-xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-100 to-pink-100 px-3 py-1 text-transparent shadow-lg sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px]">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text">{target}</span>
              </span>
            </div>

            <div className="mt-3 font-bold text-purple-600 text-xs sm:mt-4 sm:text-sm">
              {currentOperation === "multiplication"
                ? "Click the square that makes the equation correct!"
                : "Click squares on the board to fill in the ?s"}
            </div>
          </>
        )}
      </Card>

      {/* Right Side - Game Board - Square */}
      <div className="relative aspect-square shrink-0 rounded-2xl p-1 shadow-xl lg:col-span-5">
        {/* Background image that gets revealed */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {backgroundImage && (
            <img src={backgroundImage} alt="Hidden surprise" className="h-full w-full object-cover" />
          )}
        </div>

        {/* Grid */}
        <div
          className="relative grid h-full gap-1"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
          }}
        >
          {board.map((square) => (
            <button
              key={square.id}
              onClick={() => handleSquareClick(square.id)}
              disabled={square.revealed}
              className={`relative rounded-md font-black text-lg transition-all duration-300 sm:rounded-lg sm:text-xl lg:text-2xl ${
                square.revealed
                  ? "cursor-default border-0 bg-transparent text-transparent shadow-none"
                  : celebratingSquares.includes(square.id)
                    ? "z-20 scale-125 animate-bounce border-2 border-yellow-400 bg-yellow-100/90 shadow-xl shadow-yellow-400/50 ring-2 ring-yellow-300 backdrop-blur-sm sm:border-4 sm:shadow-2xl sm:ring-4"
                    : selectedSquares.includes(square.id)
                      ? "z-10 scale-110 border-2 border-pink-400 bg-pink-100/90 shadow-pink-400/50 shadow-xl ring-2 ring-pink-300 backdrop-blur-sm sm:border-4 sm:shadow-2xl sm:ring-4"
                      : "border-2 border-white/80 bg-white/90 shadow-md backdrop-blur-md hover:scale-105 hover:border-pink-300 hover:bg-white/95 hover:shadow-lg hover:shadow-pink-200 active:scale-95 sm:border-4 sm:shadow-lg sm:hover:shadow-xl"
              }`}
              type="button"
            >
              {!square.revealed && (
                <>
                  <span className="bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {square.value}
                  </span>
                  {celebratingSquares.includes(square.id) && (
                    <>
                      <span className="absolute top-0 left-0 animate-ping text-xl sm:text-2xl">✨</span>
                      <span className="absolute right-0 bottom-0 animate-ping text-xl sm:text-2xl">⭐</span>
                    </>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
