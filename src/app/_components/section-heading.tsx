import type { ReactNode } from "react";

type SectionHeadingProps = {
  emoji: string;
  children: ReactNode;
};

const SectionHeading = ({ emoji, children }: SectionHeadingProps) => {
  return (
    <h3 className="font-bold text-base sm:text-lg">
      {emoji} <span className="text-pink-700/60">{children}</span>
    </h3>
  );
};

export default SectionHeading;
