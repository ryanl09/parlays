import { getUserParlaysById } from '@/app/actions/parlays/get-user-parlays-by-id';
import { PrivacyParlayCard } from '@/app/components/parlays/privacy-parlay-card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, TrendingUp, Coins } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function UserPage({ params }: { params: { userId: string } }) {
  const { userId } = await params;
  const { parlays, currentUserId } = await getUserParlaysById(userId);

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
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Parlays Section */}
      {parlays.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No parlays yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                This user hasn't created any parlays yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              Active
              <Badge variant="secondary">{activeParlays.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="inactive" className="flex items-center gap-2">
              Inactive
              <Badge variant="secondary">{expiredParlays.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4 mt-6">
            {activeParlays.length === 0 ? (
              <Card className="py-12">
                <CardContent className="text-center space-y-2">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No active parlays</h3>
                  <p className="text-muted-foreground">
                    This user doesn't have any active parlays right now.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeParlays.map((parlay) => (
                  <PrivacyParlayCard
                    key={parlay.id}
                    parlay={parlay}
                    currentUserId={currentUserId}
                    className="border-l-4 border-l-green-500"
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="inactive" className="space-y-4 mt-6">
            {expiredParlays.length === 0 ? (
              <Card className="py-12">
                <CardContent className="text-center space-y-2">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No inactive parlays</h3>
                  <p className="text-muted-foreground">
                    This user doesn't have any inactive parlays.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {expiredParlays.map((parlay) => (
                  <PrivacyParlayCard
                    key={parlay.id}
                    parlay={parlay}
                    currentUserId={currentUserId}
                    className="opacity-75 border-l-4 border-l-gray-400"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}