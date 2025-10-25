"use client";

import SectionHeading from "@/app/_components/section-heading";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  BOARD_SIZE_MAX,
  BOARD_SIZE_MIN,
  BOARD_SIZE_STEP,
  NUMBER_RANGE_MAX,
  NUMBER_RANGE_MIN,
  TIMES_TABLES,
  useGameContext,
} from "@/contexts/game-context";
import { toast } from "sonner";

const GameConfig = () => {
  const { state, dispatch } = useGameContext();
  const { config } = state;

  const handleStartGame = () => {
    const needsTimesTables = config.mode === "multiplication" || config.mode === "all";
    if (needsTimesTables && config.selectedTimesTables.length === 0) {
      toast.error("Please select at least one times table to practice! 🌈");
      return;
    }
    dispatch({ type: "START_GAME" });
  };

  return (
    <>
      {/* Operation Mode Selection */}
      <div className="space-y-3 sm:space-y-4">
        <SectionHeading emoji="🎀">Choose Your Challenge</SectionHeading>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Button
            variant={config.mode === "addition" ? "default" : "outline"}
            onClick={() => dispatch({ type: "SET_MODE", mode: "addition" })}
            className={`h-16 cursor-pointer font-bold text-base transition-all sm:h-20 sm:text-lg ${
              config.mode === "addition"
                ? "bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700"
                : "border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50"
            }`}
          >
            <span className="mr-1 sm:mr-2">➕</span> Addition
          </Button>
          <Button
            variant={config.mode === "subtraction" ? "default" : "outline"}
            onClick={() => dispatch({ type: "SET_MODE", mode: "subtraction" })}
            className={`h-16 cursor-pointer font-bold text-base transition-all sm:h-20 sm:text-lg ${
              config.mode === "subtraction"
                ? "bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700"
                : "border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
            }`}
          >
            <span className="mr-1 sm:mr-2">➖</span> Subtraction
          </Button>
          <Button
            variant={config.mode === "multiplication" ? "default" : "outline"}
            onClick={() => dispatch({ type: "SET_MODE", mode: "multiplication" })}
            className={`h-16 cursor-pointer font-bold text-base transition-all sm:h-20 sm:text-lg ${
              config.mode === "multiplication"
                ? "bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
                : "border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <span className="mr-1 sm:mr-2">✖️</span> Multiply
          </Button>
          <Button
            variant={config.mode === "all" ? "default" : "outline"}
            onClick={() => dispatch({ type: "SET_MODE", mode: "all" })}
            className={`h-16 cursor-pointer font-bold text-base transition-all sm:h-20 sm:text-lg ${
              config.mode === "all"
                ? "bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500"
                : "border-2 border-pink-200 hover:border-pink-400 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50"
            }`}
          >
            <span className="mr-1 sm:mr-2">🌈</span> All Mixed
          </Button>
        </div>
      </div>

      {/* Times Tables Selection - Only show for multiplication modes */}
      {(config.mode === "multiplication" || config.mode === "all") && (
        <div className="space-y-3 rounded-2xl bg-white/60 p-4 backdrop-blur-sm sm:space-y-4 sm:p-6">
          <h3 className="font-bold text-base sm:text-lg">
            ✖️ <span className="text-pink-700/60">Times Tables to Practice</span>
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
            {TIMES_TABLES.map((num) => {
              const isSelected = config.selectedTimesTables?.includes(num) ?? false;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    const timesTables = config.selectedTimesTables || [];
                    if (isSelected) {
                      dispatch({
                        type: "SET_TIMES_TABLES",
                        timesTables: timesTables.filter((n) => n !== num),
                      });
                    } else {
                      dispatch({
                        type: "SET_TIMES_TABLES",
                        timesTables: [...timesTables, num].sort((a, b) => a - b),
                      });
                    }
                  }}
                  className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 p-3 font-bold text-base transition-all duration-200 sm:p-4 sm:text-lg ${
                    isSelected
                      ? "scale-105 border-pink-200 bg-pink-200 text-pink-700/60"
                      : "border-pink-200/50 bg-white/90 text-pink-700/40 hover:scale-105 hover:border-pink-300 hover:shadow-md"
                  }`}
                >
                  <span className="relative">{num}×</span>
                </button>
              );
            })}
          </div>
          <p className="text-center text-pink-700/60 text-xs sm:text-sm">
            ✨{" "}
            {(config.selectedTimesTables?.length ?? 0) > 0
              ? `Practicing: ${config.selectedTimesTables?.join(", ")}`
              : "Select times tables to practice"}{" "}
            ✨
          </p>
        </div>
      )}

      {/* Board Size Selection */}
      <div className="space-y-4 rounded-2xl bg-white/60 p-4 backdrop-blur-sm sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <SectionHeading emoji="🎨">Board Size</SectionHeading>
          <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-pink-200 px-3 py-1 font-bold text-lg text-pink-700/60 sm:px-4 sm:py-2 sm:text-2xl">
            {config.boardSize} × {config.boardSize}
          </span>
        </div>
        <Slider
          value={[config.boardSize]}
          onValueChange={(value) => {
            const size = value[0] ?? BOARD_SIZE_MIN;
            // Ensure even number of squares by using even board sizes only
            const evenSize = size % 2 === 0 ? size : size + 1;
            dispatch({
              type: "SET_BOARD_SIZE",
              boardSize: Math.min(evenSize, BOARD_SIZE_MAX),
            });
          }}
          min={BOARD_SIZE_MIN}
          max={BOARD_SIZE_MAX}
          step={BOARD_SIZE_STEP}
          className="w-full"
        />
        <p className="text-center text-pink-700/60 text-xs sm:text-sm">
          ✨ {config.boardSize * config.boardSize} magical squares ✨
        </p>
      </div>

      {/* Number Range Selection */}
      <div className="space-y-4 rounded-2xl bg-white/60 p-4 backdrop-blur-sm sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <SectionHeading emoji="🔢">Numbers</SectionHeading>
          <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-pink-200 px-3 py-1 font-bold text-lg text-pink-700/60 sm:px-4 sm:py-2 sm:text-2xl">
            1 - {config.maxNumber}
          </span>
        </div>
        <Slider
          value={[config.maxNumber]}
          onValueChange={(value) =>
            dispatch({
              type: "SET_MAX_NUMBER",
              maxNumber: value[0] ?? 12,
            })
          }
          min={NUMBER_RANGE_MIN}
          max={NUMBER_RANGE_MAX}
          step={1}
          className="w-full"
        />
        <p className="text-center text-pink-700/60 text-xs sm:text-sm">
          ✨ Play with numbers from 1 to {config.maxNumber} ✨
        </p>
      </div>

      {/* Start Button */}
      <Button
        onClick={handleStartGame}
        className="h-14 w-full cursor-pointer bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 font-bold text-white text-xl transition-all hover:scale-103 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 hover:shadow-xl sm:h-16 sm:text-2xl"
        size="lg"
      >
        <span className="mr-1 sm:mr-2">🌟</span>
        Start the Magic!
        <span className="ml-1 sm:ml-2">🌟</span>
      </Button>
    </>
  );
};

export default GameConfig;
