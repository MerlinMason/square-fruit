"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoadingState() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <img src="/assets/logo.webp" alt="Square Fruit Logo" className="h-16 w-auto flex-shrink-0 sm:h-24" />
            <div className="flex flex-col">
              <CardTitle className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text font-bold text-2xl text-transparent sm:text-4xl">
                Square Fruit
              </CardTitle>
              <p className="font-medium text-purple-500 text-sm sm:text-lg">✨ Magical Maths Game ✨</p>
            </div>
          </div>
          <p className="mt-4 text-center text-muted-foreground text-xs sm:text-sm">Loading...</p>
        </CardHeader>
      </Card>
    </div>
  );
}
