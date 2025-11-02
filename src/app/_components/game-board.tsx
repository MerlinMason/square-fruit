"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CELEBRATION_DELAY, useGameContext } from "@/contexts/game-context";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { CompletionScreen } from "./completion-screen";
import { EquationDisplay } from "./equation-display";

export const GameBoard = () => {
  const { state, dispatch } = useGameContext();
  const { game, config } = state;

  if (!game) return null;

  const { board, selectedSquares, celebratingSquares, backgroundImage, isComplete } = game;
  const boardSize = config.boardSize;

  // Handle celebration animation timing - dispatch REVEAL_SQUARES after delay
  useEffect(() => {
    if (celebratingSquares.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: "REVEAL_SQUARES" });
      }, CELEBRATION_DELAY);
      return () => clearTimeout(timer);
    }
  }, [celebratingSquares, dispatch]);

  return (
    <div className="container mx-auto flex flex-col gap-4 p-4 md:flex-row md:items-start md:gap-6 md:p-8">
      {/* Left Sidebar - Target Display / Completion Message - 2/5 width on medium+ screens */}
      <Card className="relative flex min-w-0 flex-col p-4 text-center md:w-2/5 md:shrink-0 md:p-6">
        {isComplete ? (
          <CompletionScreen />
        ) : (
          <>
            {/* Normal Game State */}
            {/* Header with Logo and Title */}
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4 sm:gap-4">
              <img src="/assets/logo.webp" alt="Square Fruit Logo" className="h-12 w-auto sm:h-16" />
              <div className="font-bold text-2xl text-pink-700/60 sm:text-4xl">Square Fruit</div>
              <Button
                onClick={() => dispatch({ type: "EXIT_TO_CONFIG" })}
                variant="outline"
                size="sm"
                className="cursor-pointer border-2 border-pink-300 bg-white/80 font-semibold text-pink-600 text-xs hover:border-pink-400 hover:bg-pink-50 sm:ml-4 sm:text-sm"
              >
                Exit
              </Button>
            </div>

            <EquationDisplay />
          </>
        )}
      </Card>

      {/* Right Side - Game Board - 3/5 width on medium+ screens */}
      <div className="relative p-1.5 md:w-3/5">
        {/* Background image that gets revealed */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {backgroundImage && (
            <img src={backgroundImage} alt="Hidden surprise" className="h-full w-full object-cover" />
          )}
        </div>

        {/* Grid */}
        <div
          className="relative grid h-full gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
          }}
        >
          {board.map((square) => {
            const isCelebrating = celebratingSquares.includes(square.id);
            const isSelected = selectedSquares.includes(square.id);

            return (
              <button
                key={square.id}
                onClick={() => dispatch({ type: "TOGGLE_SQUARE", squareId: square.id })}
                disabled={square.revealed}
                className={cn(
                  "relative aspect-square select-none rounded-md font-black text-lg transition-all duration-300 sm:text-xl lg:text-2xl",
                  {
                    "cursor-default border-0 bg-transparent text-transparent shadow-none": square.revealed,
                    "z-20 scale-105 animate-bounce border-2 border-yellow-400 bg-yellow-100/90 shadow-xl shadow-yellow-400/50 ring-2 ring-yellow-300 backdrop-blur-sm sm:border-4 sm:shadow-2xl sm:ring-4":
                      !square.revealed && isCelebrating,
                    "z-10 scale-105 border-2 border-pink-400 bg-pink-100/90 shadow-pink-400/50 shadow-xl ring-2 ring-pink-300 backdrop-blur-sm sm:border-4 sm:shadow-2xl sm:ring-4":
                      !square.revealed && !isCelebrating && isSelected,
                    "border-2 border-white/80 bg-white/90 shadow-md backdrop-blur-md hover:z-10 hover:scale-105 hover:border-pink-300 hover:bg-white/95 hover:shadow-lg hover:shadow-pink-200 active:scale-95 sm:border-4 sm:shadow-lg sm:hover:shadow-xl":
                      !square.revealed && !isCelebrating && !isSelected,
                  },
                )}
                type="button"
              >
                {!square.revealed && (
                  <>
                    <span className="text-pink-700/60">{square.value}</span>
                    {isCelebrating && (
                      <>
                        <span className="absolute top-0 left-0 animate-ping text-xl sm:text-2xl">✨</span>
                        <span className="absolute right-0 bottom-0 animate-ping text-xl sm:text-2xl">⭐</span>
                      </>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
