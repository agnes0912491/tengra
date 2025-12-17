"use client";

import AnimatedWrapper from "@/components/ui/animated-wrapper";
import Header from "@/components/layout/header";
import { cn } from "@/lib/utils";

type SiteShellProps = {
  children: React.ReactNode;
  disableAnimation?: boolean;
  fullWidth?: boolean;
};

import { CommandMenu } from "@/components/ui/command-menu";

export default function SiteShell({
  children,
  disableAnimation = false,
  fullWidth = false,
}: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <CommandMenu />
      <Header />
      <main
        className={cn(
          "relative flex flex-1 flex-col",
          !fullWidth && "pb-16 pt-24", // Default spacing
          fullWidth && "pb-0 pt-0"     // No spacing for full-width designs (Hero)
        )}
      >
        {disableAnimation ? children : <AnimatedWrapper>{children}</AnimatedWrapper>}
      </main>
    </div>
  );
}
