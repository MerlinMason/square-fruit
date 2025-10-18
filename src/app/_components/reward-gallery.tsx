"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RewardGalleryProps = {
	unlockedImages: number[];
};

export default function RewardGallery({ unlockedImages }: RewardGalleryProps) {
	const [selectedImage, setSelectedImage] = useState<number | null>(null);
	const allImages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	return (
		<>
			<Card className="border-4 border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-xl">
				<CardHeader>
					<CardTitle className=" text-center text-3xl">
						🏆{" "}
						<span className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
							Reward Gallery
						</span>
						🏆
					</CardTitle>
					<p className="mb-6 text-center text-purple-600 text-sm">
						{unlockedImages.length} / {allImages.length} collected
					</p>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-3">
						{allImages.map((imageNum) => {
							const isUnlocked = unlockedImages.includes(imageNum);
							return (
								<button
									key={imageNum}
									onClick={() => isUnlocked && setSelectedImage(imageNum)}
									disabled={!isUnlocked}
									className={`relative overflow-hidden rounded-xl border-4 transition-all ${
										isUnlocked
											? "cursor-pointer border-pink-300 bg-white shadow-lg hover:scale-105 hover:shadow-xl"
											: "cursor-not-allowed border-gray-300 bg-gray-200"
									}`}
									style={{ aspectRatio: "19.5/9" }}
									type="button"
								>
									{isUnlocked ? (
										<img
											src={`/assets/${imageNum}.png`}
											alt={`Reward ${imageNum}`}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center text-4xl text-gray-400">
											🔒
										</div>
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
							className="-right-4 -top-4 absolute flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-2xl text-white shadow-2xl transition-all hover:scale-110"
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
