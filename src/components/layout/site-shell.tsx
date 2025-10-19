import AnimatedWrapper from "@/components/ui/animated-wrapper";
import Footer from "@/components/layout/footer";

type SiteShellProps = {
  children: React.ReactNode;
  disableAnimation?: boolean;
};

export default function SiteShell({
  children,
  disableAnimation = false,
}: SiteShellProps) {
  return (
    <>
      <main className="relative flex min-h-screen flex-col pb-32 pt-10">
        {disableAnimation ? children : <AnimatedWrapper>{children}</AnimatedWrapper>}
      </main>
      <Footer />
    </>
  );
}
