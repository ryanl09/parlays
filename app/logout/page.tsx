'use client';

import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {

    useEffect(() => {
        const handleLogout = async () => {
            await signOut({
                redirect: true,
                callbackUrl: '/auth/login'
            });
        }

        handleLogout();
    }, []);
}