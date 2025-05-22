import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { userId: string };
}) {
  const user = await prisma.users.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      username: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6 -m-4">
      <header className="w-full">
        <div className="px-4 py-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-[100px] w-[100px] text-4xl">
              <AvatarFallback className="bg-muted text-muted-foreground">
                {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-lg text-muted-foreground">@{user.username}</p>
            </div>
          </div>
        </div>
        <Separator />
      </header>
      <main className="px-4">
        {children}
      </main>
    </div>
  );
} 