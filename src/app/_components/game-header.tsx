import { CardTitle } from "@/components/ui/card";

export const GameHeader = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <img src="/assets/logo.webp" alt="Square Fruit Logo" className="h-16 w-auto flex-shrink-0 sm:h-24" />
      <div className="flex flex-col">
        <CardTitle className=" font-bold text-2xl text-pink-700/60 sm:text-4xl">Square Fruit</CardTitle>
        <p className="font-medium text-sm sm:text-lg">
          ✨ <span className="text-pink-700/60">Magical Maths Game</span> ✨
        </p>
      </div>
    </div>
  );
};
