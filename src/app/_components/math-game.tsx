"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import GameBoard from "@/app/_components/game-board";

type OperationMode = "addition" | "subtraction" | "multiplication" | "all";

type GameConfig = {
	mode: OperationMode;
	maxNumber: number;
	boardSize: number;
};

type GameState = "config" | "playing" | "completed";

export default function MathGame() {
	const [gameState, setGameState] = useState<GameState>("config");
	const [config, setConfig] = useState<GameConfig>({
		mode: "addition",
		maxNumber: 12,
		boardSize: 10,
	});

	const handleStartGame = () => {
		setGameState("playing");
	};

	const handleRestart = () => {
		setGameState("config");
	};

	if (gameState === "config") {
		return (
			<div className="container mx-auto flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-2xl">
					<CardHeader>
						<CardTitle className="text-center text-3xl">
							Math Game Setup
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-8">
						{/* Operation Mode Selection */}
						<div className="space-y-4">
							<h3 className="font-semibold text-lg">Choose Operation Mode</h3>
							<div className="grid grid-cols-2 gap-4">
								<Button
									variant={config.mode === "addition" ? "default" : "outline"}
									onClick={() => setConfig({ ...config, mode: "addition" })}
									className="h-20 text-lg"
								>
									Addition (+)
								</Button>
								<Button
									variant={
										config.mode === "subtraction" ? "default" : "outline"
									}
									onClick={() => setConfig({ ...config, mode: "subtraction" })}
									className="h-20 text-lg"
								>
									Subtraction (−)
								</Button>
								<Button
									variant={
										config.mode === "multiplication" ? "default" : "outline"
									}
									onClick={() =>
										setConfig({ ...config, mode: "multiplication" })
									}
									className="h-20 text-lg"
								>
									Multiplication (×)
								</Button>
								<Button
									variant={config.mode === "all" ? "default" : "outline"}
									onClick={() => setConfig({ ...config, mode: "all" })}
									className="h-20 text-lg"
								>
									All Mixed
								</Button>
							</div>
						</div>

						{/* Board Size Selection */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-lg">Board Size</h3>
								<span className="font-bold text-2xl text-primary">
									{config.boardSize} × {config.boardSize}
								</span>
							</div>
							<Slider
								value={[config.boardSize]}
								onValueChange={(value) =>
									setConfig({ ...config, boardSize: value[0] ?? 10 })
								}
								min={3}
								max={10}
								step={1}
								className="w-full"
							/>
							<p className="text-muted-foreground text-sm">
								Grid will be {config.boardSize} × {config.boardSize} (
								{config.boardSize * config.boardSize} squares)
							</p>
						</div>

						{/* Number Range Selection */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-lg">Number Range</h3>
								<span className="font-bold text-2xl text-primary">
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
							<p className="text-muted-foreground text-sm">
								Numbers will be randomly selected between 1 and {config.maxNumber}
							</p>
						</div>

						{/* Start Button */}
						<Button
							onClick={handleStartGame}
							className="h-16 w-full text-xl"
							size="lg"
						>
							Start Game
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (gameState === "playing") {
		return (
			<GameBoard
				mode={config.mode}
				maxNumber={config.maxNumber}
				boardSize={config.boardSize}
				onComplete={() => setGameState("completed")}
			/>
		);
	}

	if (gameState === "completed") {
		return (
			<div className="container mx-auto flex min-h-screen items-center justify-center">
				<Card className="w-full max-w-md text-center">
					<CardHeader>
						<CardTitle className="text-4xl">Congratulations!</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-xl">You completed the game!</p>
						<Button onClick={handleRestart} className="w-full" size="lg">
							Play Again
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return null;
}
