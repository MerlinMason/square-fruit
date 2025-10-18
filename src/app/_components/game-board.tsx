"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

type OperationMode = "addition" | "subtraction" | "multiplication" | "all";

// Constants
const REWARD_IMAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const CELEBRATION_DELAY = 600;

type Square = {
	id: number;
	value: number;
	revealed: boolean;
};

type GameBoardProps = {
	mode: OperationMode;
	maxNumber: number;
	boardSize: number;
	onComplete: (completedImage: number) => void;
	onRestart: () => void;
	onExit: () => void;
	unlockedImages: number[];
};

// Generate random number between min and max (inclusive)
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate target based on operation and two values
function calculateTarget(
	op: "addition" | "subtraction" | "multiplication",
	val1: number,
	val2: number,
): number {
	switch (op) {
		case "addition":
			return val1 + val2;
		case "subtraction":
			// Always return positive result
			return Math.abs(val1 - val2);
		case "multiplication":
			return val1 * val2;
	}
}

// Check if two values match target for given operation
function checkAnswer(
	selectedValues: number[],
	target: number,
	currentOp: "addition" | "subtraction" | "multiplication",
): boolean {
	if (selectedValues.length !== 2) return false;

	const [val1, val2] = selectedValues;
	if (val1 === undefined || val2 === undefined) return false;

	// For subtraction, check both orderings since we always want positive results
	if (currentOp === "subtraction") {
		return Math.abs(val1 - val2) === target;
	}

	// For addition and multiplication, order doesn't matter
	return calculateTarget(currentOp, val1, val2) === target;
}

export default function GameBoard({
	mode,
	maxNumber,
	boardSize,
	onComplete,
	onRestart,
	onExit,
	unlockedImages,
}: GameBoardProps) {
	const [board, setBoard] = useState<Square[]>([]);
	const [selectedSquares, setSelectedSquares] = useState<number[]>([]);
	const [target, setTarget] = useState<number>(0);
	const [currentOperation, setCurrentOperation] = useState<
		"addition" | "subtraction" | "multiplication"
	>("addition");
	const [celebratingSquares, setCelebratingSquares] = useState<number[]>([]);
	const [backgroundImage, setBackgroundImage] = useState<string>("");
	const [backgroundImageNumber, setBackgroundImageNumber] = useState<number>(1);
	const [isComplete, setIsComplete] = useState(false);

	const totalSquares = boardSize * boardSize;

	// Select background image on mount - prioritize unseen images
	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run once on mount to keep image stable
	useEffect(() => {
		const unseenImages = REWARD_IMAGES.filter(
			(num) => !unlockedImages.includes(num),
		);

		// If there are unseen images, pick one of those. Otherwise pick random.
		const availableImages =
			unseenImages.length > 0 ? unseenImages : REWARD_IMAGES;
		const chosenNumber =
			availableImages[randomInt(0, availableImages.length - 1)] ?? 1;

		setBackgroundImageNumber(chosenNumber);
		setBackgroundImage(`/assets/${chosenNumber}.png`);
	}, []); // Only run once on mount to keep image stable throughout game

	// Initialize board with random numbers
	useEffect(() => {
		const newBoard: Square[] = [];
		for (let i = 0; i < totalSquares; i++) {
			newBoard.push({
				id: i,
				value: randomInt(1, maxNumber),
				revealed: false,
			});
		}
		setBoard(newBoard);
	}, [maxNumber, totalSquares]);

	// Generate new target when board changes or turn completes
	useEffect(() => {
		if (board.length === 0) return;

		const availableSquares = board.filter((sq) => !sq.revealed);
		if (availableSquares.length === 0) {
			setIsComplete(true);
			onComplete(backgroundImageNumber);
			return;
		}

		if (availableSquares.length < 2) return;

		// Determine operation for this turn first
		let operation: "addition" | "subtraction" | "multiplication";
		if (mode === "all") {
			const ops: ("addition" | "subtraction" | "multiplication")[] = [
				"addition",
				"subtraction",
				"multiplication",
			];
			operation = ops[randomInt(0, 2)] ?? "addition";
		} else {
			operation = mode as "addition" | "subtraction" | "multiplication";
		}

		// Build a list of all possible targets from available squares
		const possibleTargets: Array<{
			target: number;
			square1: Square;
			square2: Square;
		}> = [];

		for (let i = 0; i < availableSquares.length; i++) {
			for (let j = i + 1; j < availableSquares.length; j++) {
				const sq1 = availableSquares[i];
				const sq2 = availableSquares[j];
				if (sq1 && sq2) {
					const target = calculateTarget(operation, sq1.value, sq2.value);
					possibleTargets.push({ target, square1: sq1, square2: sq2 });
				}
			}
		}

		if (possibleTargets.length === 0) return;

		// Pick a random valid target from the possibilities
		const chosen = possibleTargets[randomInt(0, possibleTargets.length - 1)];
		if (!chosen) return;

		setCurrentOperation(operation);
		setTarget(chosen.target);
	}, [board, mode, onComplete, backgroundImageNumber]);

	// Handle square click
	const handleSquareClick = (squareId: number) => {
		const square = board.find((sq) => sq.id === squareId);
		if (!square || square.revealed) return;

		// Toggle selection
		if (selectedSquares.includes(squareId)) {
			setSelectedSquares(selectedSquares.filter((id) => id !== squareId));
		} else {
			// Only allow 2 selections at a time
			if (selectedSquares.length < 2) {
				const newSelected = [...selectedSquares, squareId];
				setSelectedSquares(newSelected);

				// Check answer when 2 squares are selected
				if (newSelected.length === 2) {
					const selectedValues = newSelected
						.map((id) => board.find((sq) => sq.id === id)?.value)
						.filter((v): v is number => v !== undefined);

					if (checkAnswer(selectedValues, target, currentOperation)) {
						// Correct answer! Show celebration effect
						setCelebratingSquares(newSelected);

						setTimeout(() => {
							setBoard((prev) =>
								prev.map((sq) =>
									newSelected.includes(sq.id) ? { ...sq, revealed: true } : sq,
								),
							);
							setSelectedSquares([]);
							setCelebratingSquares([]);
						}, CELEBRATION_DELAY);
					}
				}
			}
		}
	};

	const operationSymbol = {
		addition: "➕",
		subtraction: "➖",
		multiplication: "✖️",
	};

	const operationEmoji = {
		addition: "🌸",
		subtraction: "🦋",
		multiplication: "⭐",
	};

	// Get selected values for display
	const selectedValues = selectedSquares.map(
		(id) => board.find((sq) => sq.id === id)?.value,
	);
	const firstValue = selectedValues[0];
	const secondValue = selectedValues[1];

	return (
		<div className="grid grid-cols-9 gap-14 overflow-hidden p-8">
			{/* Left Sidebar - Target Display / Completion Message */}
			<Card className="relative col-span-4 flex min-w-0 flex-1 flex-col overflow-auto border-4 border-pink-300 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6 text-center shadow-xl">
				{isComplete ? (
					<>
						{/* Completion State */}
						<div className="space-y-4">
							<div className="text-8xl">🎉</div>
							<div className="animate-pulse bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text font-bold text-5xl text-transparent">
								You Did It!
							</div>
							<div className="flex justify-center gap-2 text-4xl">
								<span className="animate-bounce">⭐</span>
								<span className="animation-delay-200 animate-bounce">✨</span>
								<span className="animation-delay-400 animate-bounce">🌟</span>
								<span className="animation-delay-600 animate-bounce">💖</span>
								<span className="animation-delay-800 animate-bounce">🦄</span>
							</div>
							<p className="font-bold text-2xl text-purple-600">
								Amazing work, Math Genius! 🌈
							</p>
							<Button
								onClick={onRestart}
								className="mt-4 h-16 animate-pulse cursor-pointer bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 font-bold text-white text-xl shadow-xl transition-all hover:scale-105 hover:from-pink-500 hover:via-purple-500 hover:to-blue-500"
								size="lg"
							>
								<span className="mr-2">🎮</span>
								Play Again
								<span className="ml-2">🎮</span>
							</Button>
						</div>
					</>
				) : (
					<>
						{/* Normal Game State */}
						{/* Header with Logo and Title */}
						<div className="mb-4 flex items-center justify-center gap-4">
							<img
								src="/assets/logo.webp"
								alt="Square Fruit Logo"
								className="h-16 w-auto"
							/>
							<div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text font-bold text-4xl text-transparent">
								Square Fruit
							</div>
							<Button
								onClick={onExit}
								variant="outline"
								size="sm"
								className="ml-4 cursor-pointer border-2 border-pink-300 bg-white/80 font-semibold text-pink-600 hover:border-pink-400 hover:bg-pink-50"
							>
								Exit
							</Button>
						</div>

						{/* Equation Display */}
						<div className="flex items-center justify-center gap-4 font-black text-6xl">
							{/* First Number */}
							<div className="relative flex items-center gap-2">
								{selectedSquares.length === 0 && (
									<span className="animate-bounce text-4xl">👉</span>
								)}
								<span
									className={`min-w-[80px] rounded-2xl border-4 px-4 py-2 transition-all ${
										firstValue !== undefined
											? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600"
											: "border-pink-300 border-dashed bg-white/50 text-pink-300"
									}`}
								>
									{firstValue ?? "?"}
								</span>
							</div>

							{/* Operator */}
							<span className="text-5xl text-purple-500">
								{operationSymbol[currentOperation]}
							</span>

							{/* Second Number */}
							<div className="relative flex items-center gap-2">
								{selectedSquares.length === 1 && (
									<span className="animate-bounce text-4xl">👉</span>
								)}
								<span
									className={`min-w-[80px] rounded-2xl border-4 px-4 py-2 transition-all ${
										secondValue !== undefined
											? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600"
											: "border-pink-300 border-dashed bg-white/50 text-pink-300"
									}`}
								>
									{secondValue ?? "?"}
								</span>
							</div>

							{/* Equals */}
							<span className="text-5xl text-purple-500">=</span>

							{/* Target */}
							<span className="min-w-[80px] rounded-2xl border-4 border-yellow-400 bg-gradient-to-br from-yellow-100 to-pink-100 px-4 py-2 text-transparent shadow-lg">
								<span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text">
									{target}
								</span>
							</span>
						</div>

						<div className="mt-4 font-bold text-purple-600 text-sm">
							Click squares on the board to fill in the ?s
						</div>
					</>
				)}
			</Card>

			{/* Right Side - Game Board - Square */}
			<div className="relative col-span-5 aspect-square h-[full]shrink-0 rounded-2xl p-1 shadow-xl">
				{/* Background image that gets revealed */}
				<div className="absolute inset-0 overflow-hidden rounded-2xl">
					{backgroundImage && (
						<img
							src={backgroundImage}
							alt="Hidden surprise"
							className="h-full w-full object-cover"
						/>
					)}
				</div>

				{/* Grid */}
				<div
					className="relative grid h-full gap-1"
					style={{
						gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
						gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
					}}
				>
					{board.map((square) => (
						<button
							key={square.id}
							onClick={() => handleSquareClick(square.id)}
							disabled={square.revealed}
							className={`relative rounded-lg font-black text-2xl transition-all duration-300 ${
								square.revealed
									? "cursor-default border-0 bg-transparent text-transparent shadow-none"
									: celebratingSquares.includes(square.id)
										? "z-20 scale-125 animate-bounce border-4 border-yellow-400 bg-yellow-100/90 shadow-2xl shadow-yellow-400/50 ring-4 ring-yellow-300 backdrop-blur-sm"
										: selectedSquares.includes(square.id)
											? "z-10 scale-110 border-4 border-pink-400 bg-pink-100/90 shadow-2xl shadow-pink-400/50 ring-4 ring-pink-300 backdrop-blur-sm"
											: "border-4 border-white/80 bg-white/90 shadow-lg backdrop-blur-md hover:scale-105 hover:border-pink-300 hover:bg-white/95 hover:shadow-pink-200 hover:shadow-xl active:scale-95"
							}`}
							type="button"
						>
							{!square.revealed && (
								<>
									<span className="bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
										{square.value}
									</span>
									{celebratingSquares.includes(square.id) && (
										<>
											<span className="absolute top-0 left-0 animate-ping text-2xl">
												✨
											</span>
											<span className="absolute right-0 bottom-0 animate-ping text-2xl">
												⭐
											</span>
										</>
									)}
								</>
							)}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
