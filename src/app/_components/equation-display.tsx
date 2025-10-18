"use client";

type OperationMode = "addition" | "subtraction" | "multiplication";

type EquationDisplayProps = {
  currentOperation: OperationMode;
  multiplicationTable: number | null;
  multiplicationSwapOrder: boolean;
  selectedSquaresCount: number;
  firstValue: number | undefined;
  secondValue: number | undefined;
  target: number;
};

const operationSymbol = {
  addition: "➕",
  subtraction: "➖",
  multiplication: "✖️",
};

export default function EquationDisplay({
  currentOperation,
  multiplicationTable,
  multiplicationSwapOrder,
  selectedSquaresCount,
  firstValue,
  secondValue,
  target,
}: EquationDisplayProps) {
  return (
    <>
      {/* Equation Display */}
      <div className="flex flex-wrap items-center justify-center gap-2 font-black text-4xl sm:gap-3 sm:text-5xl lg:text-6xl">
        {currentOperation === "multiplication" && multiplicationTable !== null ? (
          <>
            {/* Multiplication Mode - Show times table × board value = target */}
            {multiplicationSwapOrder ? (
              <>
                {/* Times table first */}
                <span className="min-w-[60px] rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-100 to-cyan-100 px-3 py-1 text-blue-600 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px]">
                  {multiplicationTable}
                </span>
                <span className="text-3xl text-purple-500 sm:text-4xl lg:text-5xl">✖️</span>
                <div className="relative flex items-center gap-1 sm:gap-2">
                  {selectedSquaresCount === 0 && (
                    <span className="animate-bounce text-2xl sm:text-3xl lg:text-4xl">👉</span>
                  )}
                  <span
                    className={`min-w-[60px] rounded-xl border-2 px-3 py-1 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px] ${
                      firstValue !== undefined
                        ? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600"
                        : "border-pink-300 border-dashed bg-white/50 text-pink-300"
                    }`}
                  >
                    {firstValue ?? "?"}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Board value first */}
                <div className="relative flex items-center gap-1 sm:gap-2">
                  {selectedSquaresCount === 0 && (
                    <span className="animate-bounce text-2xl sm:text-3xl lg:text-4xl">👉</span>
                  )}
                  <span
                    className={`min-w-[60px] rounded-xl border-2 px-3 py-1 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px] ${
                      firstValue !== undefined
                        ? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600"
                        : "border-pink-300 border-dashed bg-white/50 text-pink-300"
                    }`}
                  >
                    {firstValue ?? "?"}
                  </span>
                </div>
                <span className="text-3xl text-purple-500 sm:text-4xl lg:text-5xl">✖️</span>
                <span className="min-w-[60px] rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-100 to-cyan-100 px-3 py-1 text-blue-600 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px]">
                  {multiplicationTable}
                </span>
              </>
            )}
          </>
        ) : (
          <>
            {/* Addition/Subtraction Mode - Show two unknowns */}
            <div className="relative flex items-center gap-1 sm:gap-2">
              {selectedSquaresCount === 0 && (
                <span className="animate-bounce text-2xl sm:text-3xl lg:text-4xl">👉</span>
              )}
              <span
                className={`min-w-[60px] rounded-xl border-2 px-3 py-1 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px] ${
                  firstValue !== undefined
                    ? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600"
                    : "border-pink-300 border-dashed bg-white/50 text-pink-300"
                }`}
              >
                {firstValue ?? "?"}
              </span>
            </div>

            <span className="text-3xl text-purple-500 sm:text-4xl lg:text-5xl">
              {operationSymbol[currentOperation]}
            </span>

            <div className="relative flex items-center gap-1 sm:gap-2">
              {selectedSquaresCount === 1 && (
                <span className="animate-bounce text-2xl sm:text-3xl lg:text-4xl">👉</span>
              )}
              <span
                className={`min-w-[60px] rounded-xl border-2 px-3 py-1 transition-all sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px] ${
                  secondValue !== undefined
                    ? "border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 text-purple-600"
                    : "border-pink-300 border-dashed bg-white/50 text-pink-300"
                }`}
              >
                {secondValue ?? "?"}
              </span>
            </div>
          </>
        )}

        {/* Equals */}
        <span className="text-3xl text-purple-500 sm:text-4xl lg:text-5xl">=</span>

        {/* Target */}
        <span className="min-w-[60px] rounded-xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-100 to-pink-100 px-3 py-1 text-transparent shadow-lg sm:min-w-[70px] sm:rounded-2xl sm:border-4 sm:px-4 sm:py-2 lg:min-w-[80px]">
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text">{target}</span>
        </span>
      </div>

      <div className="mt-3 font-bold text-purple-600 text-xs sm:mt-4 sm:text-sm">
        {currentOperation === "multiplication"
          ? "Click the square that makes the equation correct!"
          : "Click squares on the board to fill in the ?s"}
      </div>
    </>
  );
}
