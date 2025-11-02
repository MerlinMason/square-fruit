import { randomNumberFromRange } from "./game-helpers";

export const selectBackgroundImage = (
  unlockedImages: number[],
  allRewardImages: number[],
): { imageNumber: number; imageUrl: string } => {
  const unseenImages = allRewardImages.filter((num) => !unlockedImages.includes(num));
  const availableImages = unseenImages.length > 0 ? unseenImages : allRewardImages;
  const chosenNumber = availableImages[randomNumberFromRange(0, availableImages.length - 1)] ?? 1;

  return {
    imageNumber: chosenNumber,
    imageUrl: `/assets/${chosenNumber}.png`,
  };
};
