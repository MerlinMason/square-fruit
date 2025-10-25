import type { Operation, OperationMode, Square } from "@/contexts/game-context";
import { calculateTarget, randomInt } from "./game-helpers";

type TargetResult = {
  target: number;
  currentOperation: Operation;
  multiplicationTable: number | null;
  multiplicationSwapOrder: boolean;
};

const pickRandom = <T>(arr: T[]): T | undefined => arr[randomInt(0, arr.length - 1)];

const selectOperation = (mode: OperationMode, availableCount: number): Operation => {
  if (mode !== "all") return mode as Operation;

  if (availableCount === 1) return "multiplication";
  if (availableCount === 2) return pickRandom(["addition", "subtraction"]) ?? "addition";
  return pickRandom(["addition", "subtraction", "multiplication"]) ?? "addition";
};

export const generateTarget = (
  board: Square[],
  mode: OperationMode,
  selectedTimesTables: number[],
): TargetResult | null => {
  const availableSquares = board.filter((sq) => !sq.revealed);
  if (availableSquares.length === 0) return null;

  const operation = selectOperation(mode, availableSquares.length);

  if (operation === "multiplication") {
    const square = pickRandom(availableSquares);
    const timesTable = pickRandom(selectedTimesTables);
    if (!square || !timesTable) return null;

    return {
      target: square.value * timesTable,
      currentOperation: operation,
      multiplicationTable: timesTable,
      multiplicationSwapOrder: Math.random() < 0.5,
    };
  }

  if (availableSquares.length < 2) return null;

  const possibleTargets = availableSquares.flatMap((sq1, i) =>
    availableSquares.slice(i + 1).map((sq2) => calculateTarget(operation, sq1.value, sq2.value)),
  );

  const target = pickRandom(possibleTargets);
  if (!target) return null;

  return {
    target,
    currentOperation: operation,
    multiplicationTable: null,
    multiplicationSwapOrder: false,
  };
};
