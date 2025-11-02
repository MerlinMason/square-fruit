import type { Operation, OperationMode, Square } from "@/contexts/game-context";

// (1, 10) => 7
export const randomNumberFromRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// [1,2,3] => 2
export const randomItemFromArray = <T>(arr: T[]): T => arr[randomNumberFromRange(0, arr.length - 1)] as T;

// Determines the target number for each move and operation type based on the remaining squares
export const generateTarget = (
  board: Square[],
  mode: OperationMode,
  selectedTimesTables: number[],
): {
  target: number;
  currentOperation: Operation;
  multiplicationTable: number | null;
  multiplicationSwapOrder: boolean;
} | null => {
  const availableSquares = board.filter((sq) => !sq.revealed);
  if (availableSquares.length === 0) return null;

  const operation: Operation =
    mode !== "all"
      ? mode
      : availableSquares.length === 1
        ? "multiplication"
        : availableSquares.length === 2
          ? randomItemFromArray(["addition", "subtraction"])
          : randomItemFromArray(["addition", "subtraction", "multiplication"]);

  if (operation === "multiplication") {
    const square = randomItemFromArray(availableSquares);
    const timesTable = randomItemFromArray(selectedTimesTables);
    if (!square || !timesTable) return null;

    return {
      target: square.value * timesTable,
      currentOperation: operation,
      multiplicationTable: timesTable,
      multiplicationSwapOrder: Math.random() < 0.5,
    };
  }

  if (availableSquares.length < 2) return null;

  const calculateTarget = (op: "addition" | "subtraction" | "multiplication", val1: number, val2: number): number => {
    if (op === "addition") return val1 + val2;
    if (op === "subtraction") return Math.abs(val1 - val2);
    return val1 * val2;
  };

  const possibleTargets = availableSquares.flatMap((sq1, i) =>
    availableSquares.slice(i + 1).map((sq2) => calculateTarget(operation, sq1.value, sq2.value)),
  );

  const target = randomItemFromArray(possibleTargets);

  return {
    target,
    currentOperation: operation,
    multiplicationTable: null,
    multiplicationSwapOrder: false,
  };
};

export const checkAnswer = (
  selectedValues: number[],
  target: number,
  currentOp: "addition" | "subtraction" | "multiplication",
  multiplicationTable: number | null,
): boolean => {
  // Multiplication mode: single value * table
  if (currentOp === "multiplication" && multiplicationTable !== null) {
    return (
      selectedValues.length === 1 &&
      selectedValues[0] !== undefined &&
      selectedValues[0] * multiplicationTable === target
    );
  }

  // Addition/Subtraction: need exactly 2 values
  const [val1, val2] = selectedValues;
  if (selectedValues.length !== 2 || val1 === undefined || val2 === undefined) return false;

  return currentOp === "subtraction" ? Math.abs(val1 - val2) === target : val1 + val2 === target;
};

export const createBoard = (boardSize: number, maxNumber: number): Square[] => {
  const board = Array.from({ length: boardSize * boardSize }, (_, id) => ({
    id,
    value: randomNumberFromRange(1, maxNumber),
    revealed: false,
  }));

  // for complex games, sort the squares to make finding numbers easier easier
  return boardSize > 6 && maxNumber > 12 ? board.sort((a, b) => a.value - b.value) : board;
};
