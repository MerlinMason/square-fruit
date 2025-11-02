"use client";

import { GameBoard } from "@/app/_components/game-board";
import { GameConfig } from "@/app/_components/game-config";
import { RewardGallery } from "@/app/_components/reward-gallery";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGameContext } from "@/contexts/game-context";
import { GameHeader } from "./game-header";

export const MathGame = () => {
  const { state } = useGameContext();
  const { screen } = state;

  if (screen === "config") {
    return (
      <div className="container mx-auto min-h-screen p-4 sm:p-4 sm:py-8">
        <div className="relative grid grid-cols-1 gap-3 sm:gap-12 lg:grid-cols-2">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <GameHeader />
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:space-y-8 sm:p-6">
              <GameConfig />
            </CardContent>
          </Card>

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
