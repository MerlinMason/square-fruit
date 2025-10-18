"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type OperationMode = "addition" | "subtraction" | "multiplication" | "all";

type Square = {
	id: number;
	value: number;
	revealed: boolean;
};

type GameBoardProps = {
	mode: OperationMode;
	maxNumber: number;
	boardSize: number;
	onComplete: () => void;
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
	mode: OperationMode,
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
}: GameBoardProps) {
	const [board, setBoard] = useState<Square[]>([]);
	const [selectedSquares, setSelectedSquares] = useState<number[]>([]);
	const [target, setTarget] = useState<number>(0);
	const [currentOperation, setCurrentOperation] = useState<
		"addition" | "subtraction" | "multiplication"
	>("addition");

	const totalSquares = boardSize * boardSize;

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
			onComplete();
			return;
		}

		// Pick two random unrevealed squares
		const idx1 = randomInt(0, availableSquares.length - 1);
		let idx2 = randomInt(0, availableSquares.length - 1);
		while (idx2 === idx1 && availableSquares.length > 1) {
			idx2 = randomInt(0, availableSquares.length - 1);
		}

		const square1 = availableSquares[idx1];
		const square2 = availableSquares[idx2];

		if (!square1 || !square2) return;

		// Determine operation for this turn
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

		setCurrentOperation(operation);
		setTarget(calculateTarget(operation, square1.value, square2.value));
	}, [board, mode, onComplete]);

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

					if (checkAnswer(mode, selectedValues, target, currentOperation)) {
						// Correct answer! Reveal the squares
						setTimeout(() => {
							setBoard((prev) =>
								prev.map((sq) =>
									newSelected.includes(sq.id) ? { ...sq, revealed: true } : sq,
								),
							);
							setSelectedSquares([]);
						}, 500);
					}
				}
			}
		}
	};

	const operationSymbol = {
		addition: "+",
		subtraction: "−",
		multiplication: "×",
	};

	return (
		<div className="container mx-auto max-w-4xl space-y-6 py-8">
			{/* Target Display */}
			<Card className="bg-primary p-6 text-center text-primary-foreground shadow-lg">
				<div className="text-primary-foreground/70 text-sm uppercase tracking-wide">
					Target
				</div>
				<div className="font-bold text-6xl">{target}</div>
				<div className="mt-2 text-primary-foreground/90 text-sm">
					Find two numbers that {currentOperation} to {target} (
					{operationSymbol[currentOperation]})
				</div>
			</Card>

			{/* Game Board */}
			<div className="relative">
				{/* Background image placeholder */}
				<div className="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 shadow-xl" />

				{/* Grid */}
				<div
					className="relative grid gap-1 rounded-lg bg-black/5 p-2"
					style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
				>
					{board.map((square) => (
						<button
							key={square.id}
							onClick={() => handleSquareClick(square.id)}
							disabled={square.revealed}
							className={`
								aspect-square rounded font-bold text-lg transition-all duration-200
								${
									square.revealed
										? "cursor-default border-transparent bg-transparent text-transparent"
										: selectedSquares.includes(square.id)
											? "scale-95 border-2 border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-400"
											: "border-2 border-gray-300 bg-white shadow-sm hover:scale-105 hover:border-blue-400 hover:shadow-md active:scale-95"
								}
							`}
							type="button"
						>
							{!square.revealed && square.value}
						</button>
					))}
				</div>
			</div>

			{/* Instructions */}
			<div className="text-center text-muted-foreground text-sm">
				Click two squares to select them. Find pairs that match the target!
			</div>
		</div>
	);
}
