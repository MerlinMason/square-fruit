"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import GameBoard from "@/app/_components/game-board";
import RewardGallery from "@/app/_components/reward-gallery";

type OperationMode = "addition" | "subtraction" | "multiplication" | "all";

type GameConfig = {
	mode: OperationMode;
	maxNumber: number;
	boardSize: number;
};

type GameState = "config" | "playing" | "completed";

const DEFAULT_CONFIG: GameConfig = {
	mode: "addition",
	maxNumber: 12,
	boardSize: 6,
};

export default function MathGame() {
	const [isMounted, setIsMounted] = useState(false);
	const [gameState, setGameState] = useState<GameState>("config");
	const [config, setConfig] = useLocalStorage<GameConfig>(
		"square-fruit-config",
		DEFAULT_CONFIG,
	);
	const [unlockedImages, setUnlockedImages] = useLocalStorage<number[]>(
		"square-fruit-unlocked",
		[],
	);

	// Only render client-specific content after mounting
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Show loading state during SSR/hydration
	if (!isMounted) {
		return (
			<div className="container mx-auto flex min-h-screen items-center justify-center p-4">
				<Card className="relative w-full max-w-2xl border-4 border-pink-200 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 shadow-2xl">
					<CardHeader className="space-y-2">
						<img
							src="/assets/logo.webp"
							alt="Square Fruit Logo"
							className="mx-auto h-32 w-auto"
						/>
						<div className="space-y-1">
							<CardTitle className="relative text-center font-bold text-7xl">
								<span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent blur-sm">
									Square Fruit
								</span>
								<span
									className="relative animate-pulse bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(219,39,119,0.3)]"
									style={{
										WebkitTextStroke: "3px white",
										paintOrder: "stroke fill",
									}}
								>
									Square Fruit
								</span>
							</CardTitle>
							<p className="text-center font-medium text-lg text-purple-500">
								✨ Magical Maths Game ✨
							</p>
						</div>
						<p className="text-center text-muted-foreground text-sm">
							Loading...
						</p>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const handleStartGame = () => {
		setGameState("playing");
	};

	const handleGameComplete = (completedImage: number) => {
		// Add the completed image to unlocked list if not already there
		if (!unlockedImages.includes(completedImage)) {
			setUnlockedImages([...unlockedImages, completedImage]);
		}
	};

	const handleRestart = () => {
		setGameState("config");
	};

	if (gameState === "config") {
		return (
			<div className="container mx-auto min-h-screen p-4 py-8">
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute top-20 left-10 h-32 w-32 animate-pulse rounded-full bg-pink-300/30 blur-3xl" />
					<div className="animation-delay-1000 absolute right-10 bottom-20 h-40 w-40 animate-pulse rounded-full bg-purple-300/30 blur-3xl" />
					<div className="animation-delay-2000 absolute top-10 left-1/2 h-36 w-36 animate-pulse rounded-full bg-blue-300/30 blur-3xl" />
				</div>

				<div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2">
					<Card className="border-4 border-pink-200 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 shadow-2xl">
						<CardHeader className="space-y-2">
							<img
								src="/assets/logo.webp"
								alt="Square Fruit Logo"
								className="mx-auto h-32 w-auto"
							/>
							<div className="space-y-1">
								<CardTitle className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-center font-bold text-4xl text-transparent">
									Square Fruit
								</CardTitle>
								<p className="text-center font-medium text-lg text-purple-500">
									✨ Magical Maths Game ✨
								</p>
							</div>
						</CardHeader>
						<CardContent className="space-y-8">
							{/* Operation Mode Selection */}
							<div className="space-y-4">
								<h3 className="font-bold text-lg text-pink-600">
									🎀 Choose Your Challenge
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<Button
										variant={config.mode === "addition" ? "default" : "outline"}
										onClick={() => setConfig({ ...config, mode: "addition" })}
										className={`h-20 cursor-pointer font-bold text-lg transition-all ${
											config.mode === "addition"
												? "bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg shadow-pink-300 hover:from-pink-500 hover:to-pink-700"
												: "border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50"
										}`}
									>
										<span className="mr-2">➕</span> Addition
									</Button>
									<Button
										variant={
											config.mode === "subtraction" ? "default" : "outline"
										}
										onClick={() =>
											setConfig({ ...config, mode: "subtraction" })
										}
										className={`h-20 cursor-pointer font-bold text-lg transition-all ${
											config.mode === "subtraction"
												? "bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-300 hover:from-purple-500 hover:to-purple-700"
												: "border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
										}`}
									>
										<span className="mr-2">➖</span> Subtraction
									</Button>
									<Button
										variant={
											config.mode === "multiplication" ? "default" : "outline"
										}
										onClick={() =>
											setConfig({ ...config, mode: "multiplication" })
										}
										className={`h-20 cursor-pointer font-bold text-lg transition-all ${
											config.mode === "multiplication"
												? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-300 shadow-lg hover:from-blue-500 hover:to-blue-700"
												: "border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
										}`}
									>
										<span className="mr-2">✖️</span> Multiply
									</Button>
									<Button
										variant={config.mode === "all" ? "default" : "outline"}
										onClick={() => setConfig({ ...config, mode: "all" })}
										className={`h-20 cursor-pointer font-bold text-lg transition-all ${
											config.mode === "all"
												? "bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 shadow-lg shadow-purple-300 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500"
												: "border-2 border-pink-200 hover:border-pink-400 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50"
										}`}
									>
										<span className="mr-2">🌈</span> All Mixed
									</Button>
								</div>
							</div>

							{/* Board Size Selection */}
							<div className="space-y-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm">
								<div className="flex items-center justify-between">
									<h3 className="font-bold text-lg text-purple-600">
										🎨 Board Size
									</h3>
									<span className="rounded-full bg-gradient-to-r from-purple-400 to-pink-400 px-4 py-2 font-bold text-2xl text-white shadow-lg">
										{config.boardSize} × {config.boardSize}
									</span>
								</div>
								<Slider
									value={[config.boardSize]}
									onValueChange={(value) => {
										const size = value[0] ?? 4;
										// Ensure even number of squares by using even board sizes only
										const evenSize = size % 2 === 0 ? size : size + 1;
										setConfig({ ...config, boardSize: Math.min(evenSize, 10) });
									}}
									min={4}
									max={10}
									step={2}
									className="w-full"
								/>
								<p className="text-center text-purple-600/70 text-sm">
									✨ {config.boardSize * config.boardSize} magical squares ✨
								</p>
							</div>

							{/* Number Range Selection */}
							<div className="space-y-4 rounded-2xl bg-white/60 p-6 backdrop-blur-sm">
								<div className="flex items-center justify-between">
									<h3 className="font-bold text-blue-600 text-lg">
										🔢 Number Range
									</h3>
									<span className="rounded-full bg-gradient-to-r from-blue-400 to-purple-400 px-4 py-2 font-bold text-2xl text-white shadow-lg">
										1 - {config.maxNumber}
									</span>
								</div>
								<Slider
									value={[config.maxNumber]}
									onValueChange={(value) =>
										setConfig({ ...config, maxNumber: value[0] ?? 12 })
									}
									min={1}
									max={100}
									step={1}
									className="w-full"
								/>
								<p className="text-center text-blue-600/70 text-sm">
									✨ Pick numbers from 1 to {config.maxNumber} ✨
								</p>
							</div>

							{/* Start Button */}
							<Button
								onClick={handleStartGame}
								className="h-16 w-full cursor-pointer animate-pulse bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 font-bold text-2xl text-white shadow-xl transition-all hover:scale-105 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 hover:shadow-2xl"
								size="lg"
							>
								<span className="mr-2">🌟</span>
								Start the Magic!
								<span className="ml-2">🌟</span>
							</Button>
						</CardContent>
					</Card>

					{/* Reward Gallery */}
					<RewardGallery unlockedImages={unlockedImages} />
				</div>
			</div>
		);
	}

	if (gameState === "playing") {
		return (
			<GameBoard
				mode={config.mode}
				maxNumber={config.maxNumber}
				boardSize={config.boardSize}
				onComplete={handleGameComplete}
				onRestart={handleRestart}
				onExit={() => setGameState("config")}
				unlockedImages={unlockedImages}
			/>
		);
	}

	return null;
}
