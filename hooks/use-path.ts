import { usePathname, useSearchParams } from "next/navigation";

export const usePath = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    return `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
}