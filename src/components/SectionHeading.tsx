import { type ReactNode } from "react";

interface HeadingProps {
  children: ReactNode;
}

function Heading({ children }: HeadingProps) {
  return (
    <h3 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase">
      {children}
    </h3>
  );
}

export default Heading;
