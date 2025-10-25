import MathGame from "@/app/_components/math-game";
import { GameProvider } from "@/contexts/game-context";

export default function Home() {
  return (
    <GameProvider>
      <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <MathGame />
      </main>
    </GameProvider>
  );
}
