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
