import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/auth/navigation";
import { ParlayResolver } from "@/app/components/parlays/parlay-resolver";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Navigation>
                {children}
            </Navigation>
            <ParlayResolver />
        </div>
    );
}