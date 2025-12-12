import Link from "next/link";
import { Button } from "@/components/ui/button";
import SiteShell from "@/components/layout/site-shell";

export default function NotFound() {
    return (
        <SiteShell>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-[10rem] font-bold leading-none bg-gradient-to-r from-[var(--color-turkish-blue-400)] via-[var(--color-turkish-blue-600)] to-[var(--color-turkish-blue-400)] bg-clip-text text-transparent opacity-80 animate-pulse font-orbitron select-none">
                    404
                </h1>
                <div className="space-y-4 max-w-lg mt-8">
                    <h2 className="text-2xl font-semibold text-[var(--color-turkish-blue-100)]">
                        Lost in the Void
                    </h2>
                    <p className="text-[var(--color-turkish-blue-200)] text-lg">
                        The artefact you are looking for has been moved, deleted, or never existed in this timeline.
                    </p>
                    <div className="pt-8">
                        <Button asChild size="lg" className="rounded-full">
                            <Link href="/">
                                Return to Base
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </SiteShell>
    );
}
