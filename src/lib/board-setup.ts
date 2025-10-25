import type { Square } from "@/contexts/game-context";
import { randomInt } from "./game-helpers";

export const createBoard = (boardSize: number, maxNumber: number): Square[] => {
  return Array.from({ length: boardSize * boardSize }, (_, id) => ({
    id,
    value: randomInt(1, maxNumber),
    revealed: false,
  }));
};

export const selectBackgroundImage = (
  unlockedImages: number[],
  allRewardImages: number[],
): { imageNumber: number; imageUrl: string } => {
  const unseenImages = allRewardImages.filter((num) => !unlockedImages.includes(num));
  const availableImages = unseenImages.length > 0 ? unseenImages : allRewardImages;
  const chosenNumber = availableImages[randomInt(0, availableImages.length - 1)] ?? 1;

  return {
    imageNumber: chosenNumber,
    imageUrl: `/assets/${chosenNumber}.png`,
  };
};
