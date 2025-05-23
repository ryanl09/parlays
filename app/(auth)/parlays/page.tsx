import { getUserParlays } from '@/app/actions/parlays/get-user-parlays';
import { ParlayCard } from '@/app/components/parlays/parlay-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ClipboardList, Coins, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ParlaysPage() {
    const parlays = await getUserParlays();

    const totalWagered = parlays.reduce((sum, parlay) => sum + parlay.coins, 0);
    const activeParlays = parlays.filter(parlay => {
        const maxEndTime = parlay.parlay_props.reduce((maxDate, leg) => {
            const endTime = new Date(leg.prop_options.props.end);
            return endTime > maxDate ? endTime : maxDate;
        }, new Date(0));
        return maxEndTime > new Date();
    });

    const expiredParlays = parlays.filter(parlay => {
        const maxEndTime = parlay.parlay_props.reduce((maxDate, leg) => {
            const endTime = new Date(leg.prop_options.props.end);
            return endTime > maxDate ? endTime : maxDate;
        }, new Date(0));
        return maxEndTime <= new Date();
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">My Parlays</h1>
                            <p className="text-muted-foreground">
                                Track your active bets and betting history
                            </p>
                        </div>
                    </div>
                    
                    <Button asChild>
                        <Link href="/betslip">
                            Create New Parlay
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Parlays</p>
                                <p className="text-2xl font-bold">{parlays.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Parlays</p>
                                <p className="text-2xl font-bold">{activeParlays.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                <Coins className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Wagered</p>
                                <p className="text-2xl font-bold">{totalWagered.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {parlays.length === 0 ? (
                /* Empty State */
                <Card className="py-16">
                    <CardContent className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <ClipboardList className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">No parlays yet</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                You haven't created any parlays yet. Start by adding some props to your betslip and creating your first parlay.
                            </p>
                        </div>
                        <Button asChild className="mt-4">
                            <Link href="/props">
                                Browse Props
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {/* Active Parlays */}
                    {activeParlays.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold">Active Parlays</h2>
                                <Badge variant="default">{activeParlays.length}</Badge>
                            </div>
                            <div className="grid gap-4">
                                {activeParlays.map((parlay) => (
                                    <ParlayCard
                                        key={parlay.id}
                                        parlay={parlay}
                                        className="border-l-4 border-l-green-500"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Separator between active and expired */}
                    {activeParlays.length > 0 && expiredParlays.length > 0 && (
                        <Separator />
                    )}

                    {/* Expired Parlays */}
                    {expiredParlays.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold text-muted-foreground">Expired Parlays</h2>
                                <Badge variant="secondary">{expiredParlays.length}</Badge>
                            </div>
                            <div className="grid gap-4">
                                {expiredParlays.map((parlay) => (
                                    <ParlayCard
                                        key={parlay.id}
                                        parlay={parlay}
                                        className="opacity-75 border-l-4 border-l-gray-400"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}