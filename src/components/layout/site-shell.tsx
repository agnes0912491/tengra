import AnimatedWrapper from "@/components/ui/animated-wrapper";
import Header from "@/components/layout/header";

type SiteShellProps = {
  children: React.ReactNode;
  disableAnimation?: boolean;
};

export default function SiteShell({
  children,
  disableAnimation = false,
}: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="relative flex flex-1 flex-col pb-16 pt-24">
        {disableAnimation ? children : <AnimatedWrapper>{children}</AnimatedWrapper>}
      </main>
    </div>
  );
}
