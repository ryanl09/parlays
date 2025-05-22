import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg border border-border">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Parlays</h1>
          <p className="text-muted-foreground">Sign in to access your account</p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/auth/login">
              Sign In
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/auth/register">
              Create Account
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
