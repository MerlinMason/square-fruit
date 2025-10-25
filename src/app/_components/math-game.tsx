"use client";

import GameBoard from "@/app/_components/game-board";
import GameConfig from "@/app/_components/game-config";
import RewardGallery from "@/app/_components/reward-gallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameContext } from "@/contexts/game-context";

const MathGame = () => {
  const { state } = useGameContext();
  const { screen } = state;

  if (screen === "config") {
    return (
      <div className="container mx-auto min-h-screen p-4 sm:p-4 sm:py-8">
        <div className="relative grid grid-cols-1 gap-3 sm:gap-12 lg:grid-cols-2">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <img src="/assets/logo.webp" alt="Square Fruit Logo" className="h-16 w-auto flex-shrink-0 sm:h-24" />
                <div className="flex flex-col">
                  <CardTitle className=" font-bold text-2xl text-pink-700/60 sm:text-4xl">Square Fruit</CardTitle>
                  <p className="font-medium text-sm sm:text-lg">
                    ✨ <span className="text-pink-700/60">Magical Maths Game</span> ✨
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:space-y-8 sm:p-6">
              <GameConfig />
            </CardContent>
          </Card>

          {/* Reward Gallery */}
          <RewardGallery />
        </div>
      </div>
    );
  }

  if (screen === "playing") {
    return <GameBoard />;
  }

  return null;
};

export default MathGame;
