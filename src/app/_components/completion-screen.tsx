"use client";

import { Button } from "@/components/ui/button";
import { useGameContext } from "@/contexts/game-context";

export const CompletionScreen = () => {
  const { dispatch } = useGameContext();
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="text-6xl sm:text-8xl">🎉</div>
      <div className="animate-pulse bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text font-bold text-3xl text-transparent sm:text-5xl">
        You Did It!
      </div>
      <div className="flex justify-center gap-2 text-3xl sm:text-4xl">
        <span className="animate-bounce">⭐</span>
        <span className="animate-bounce delay-[200ms]">✨</span>
        <span className="animate-bounce delay-[400ms]">🌟</span>
        <span className="animate-bounce delay-[600ms]">💖</span>
        <span className="animate-bounce delay-[800ms]">🦄</span>
      </div>
      <p className="font-bold text-purple-600 text-xl sm:text-2xl">🌈 Amazing work! 🌈</p>
      <Button
        onClick={() => dispatch({ type: "EXIT_TO_CONFIG" })}
        className="mt-3 h-14 animate-pulse cursor-pointer bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 font-bold text-lg text-white shadow-xl transition-all hover:scale-105 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 sm:mt-4 sm:h-16 sm:text-xl"
        size="lg"
      >
        <span className="mr-1 sm:mr-2">🎮</span>
        Play Again
        <span className="ml-1 sm:ml-2">🎮</span>
      </Button>
    </div>
  );
};
