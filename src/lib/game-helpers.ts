export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const calculateTarget = (
  op: "addition" | "subtraction" | "multiplication",
  val1: number,
  val2: number,
): number => {
  if (op === "addition") return val1 + val2;
  if (op === "subtraction") return Math.abs(val1 - val2);
  return val1 * val2;
};
