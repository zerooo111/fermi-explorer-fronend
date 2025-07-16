import { RecentTicks } from '@/components/RecentTicks'
import { LiveTicks } from '@/components/LiveTicks'
import { ChainStatus } from '@/components/ChainStatus'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Homepage() {
  return (
    <div className="space-y-8 p-6 container mx-auto max-w-screen-lg">
      <h1 className="text-3xl font-bold">Continuum Sequencer Status</h1>

      <ChainStatus enableRealTime={true} showPerformanceMetrics={true} />

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="live">Live Stream</TabsTrigger>
          <TabsTrigger value="recent">Recent Ticks</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          <LiveTicks limit={20} showTransactions={true} />
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <RecentTicks limit={50} showAge={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
