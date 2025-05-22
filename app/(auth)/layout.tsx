import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout ({ children }: { children: React.ReactNode }) {
    const session = await getSession();

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <>
            {children}
        </>
    )
}