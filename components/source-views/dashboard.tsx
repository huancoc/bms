'use client'

import { useState } from 'react'
import { BmsProvider } from '@/lib/bms/context'
import { EventLog } from './event-log'
import type { TabId } from './tabs'
import { TopNav } from './top-nav'
import { AirView } from './views/air-view'
import { ChillerView } from './views/chiller-view'
import { FireView } from './views/fire-view'
import { LightingView } from './views/lighting-view'
import { OverviewView } from './views/overview-view'
import { PowerView } from './views/power-view'
import { SupportView } from './views/support-view'
import { WaterView } from './views/water-view'

export function Dashboard() {
  const [tab, setTab] = useState<TabId>('overview')
  const navigate = (t: TabId) => {
    setTab(t)
    window.scrollTo({ top: 0 })
  }

  return (
    <BmsProvider>
      <div className="min-h-screen bg-slate-200 text-slate-900">
        <TopNav tab={tab} onChange={navigate} />
        <main className="w-full px-3 pt-4 pb-24 md:px-6">
          {tab === 'overview' && <OverviewView onNavigate={navigate} />}
          {tab === 'chiller' && <ChillerView />}
          {tab === 'air' && <AirView />}
          {tab === 'power' && <PowerView />}
          {tab === 'lighting' && <LightingView />}
          {tab === 'fire' && <FireView />}
          {tab === 'water' && <WaterView />}
          {tab === 'support' && <SupportView />}
        </main>
        <EventLog />
      </div>
    </BmsProvider>
  )
}
