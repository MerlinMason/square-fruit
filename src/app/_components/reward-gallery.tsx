"use client";

import SectionHeading from "@/app/_components/section-heading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameContext } from "@/contexts/game-context";
import Image from "next/image";
import { useState } from "react";

// Constants
export const ALL_REWARD_IMAGES = Array.from({ length: 12 }, (_, i) => i + 1);
const THUMBNAIL_ASPECT_RATIO = "12.8/9";

export default function RewardGallery() {
  const { state, dispatch } = useGameContext();
  const unlockedImages = state.unlockedImages;
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handleResetProgress = () => {
    dispatch({ type: "RESET_PROGRESS" });
  };

  return (
    <>
      <Card>
        <CardHeader className="space-y-0 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <Image src="/assets/rewards.png" alt="Reward trophy" width={96} height={96} />
              <div className="flex min-w-0 flex-1 flex-col">
                <CardTitle className=" font-bold text-2xl text-pink-700/60 sm:text-4xl">Reward Gallery</CardTitle>
                <p className="font-medium text-pink-700/60 text-sm sm:text-lg">
                  {unlockedImages.length} / {ALL_REWARD_IMAGES.length} collected
                </p>
              </div>
            </div>

            {/* Reset Progress Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 cursor-pointer border-2 border-red-300 text-red-600 text-xs hover:border-red-400 hover:bg-red-50 sm:text-sm"
                >
                  🔄 Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-4 border-pink-300 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl">
                    ⚠️ <span className="text-pink-700/80"> Reset Progress? </span>{" "}
                  </AlertDialogTitle>{" "}
                  <AlertDialogDescription className="text-lg text-pink-700/60">
                    Are you sure you want to reset all progress? You will lose all unlocked rewards and this cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer border-2 border-gray-300 hover:border-gray-400">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetProgress}
                    className="cursor-pointer bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700"
                  >
                    Reset Progress
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-6">
          <SectionHeading emoji="🔑">Can you unlock every one?</SectionHeading>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {ALL_REWARD_IMAGES.map((imageNum) => {
              const isUnlocked = unlockedImages.includes(imageNum);
              return (
                <button
                  key={imageNum}
                  onClick={() => isUnlocked && setSelectedImage(imageNum)}
                  disabled={!isUnlocked}
                  className={`relative overflow-hidden rounded-lg border-1 transition-all sm:rounded-xl sm:border-4 ${
                    isUnlocked
                      ? "cursor-pointer border-pink-300 bg-white shadow-lg hover:scale-105 hover:shadow-xl"
                      : "cursor-not-allowed border-pink-200 bg-pink-50"
                  }`}
                  style={{ aspectRatio: THUMBNAIL_ASPECT_RATIO }}
                  type="button"
                >
                  {isUnlocked ? (
                    <img
                      src={`/assets/${imageNum}.png`}
                      alt={`Reward ${imageNum}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl sm:text-4xl">🔒</div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={() => setSelectedImage(null)}
              className="-right-4 -top-4 absolute flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-2xl text-white shadow-2xl transition-all hover:scale-110"
              type="button"
            >
              ✕
            </button>
            <img
              src={`/assets/${selectedImage}.png`}
              alt={`Reward ${selectedImage}`}
              className="max-h-[90vh] max-w-[90vw] rounded-2xl border-8 border-white shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
