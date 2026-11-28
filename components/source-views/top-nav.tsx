'use client'

import { Bell, Building2 } from 'lucide-react'
import { getAlarms, useBms } from '@/lib/bms/context'
import { SCENARIO_LABEL } from '@/lib/bms/reducer'
import { cn } from '@/lib/utils'
import { TABS, type TabId } from './tabs'

export function TopNav({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  const { state } = useBms()
  const alarms = getAlarms(state)
  const time = state.now
    ? new Date(state.now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--'

  return (
    <header className="sticky top-0 z-30 bg-[#1E293B] text-slate-100 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-sky-600 p-2">
            <Building2 className="size-6 text-white" aria-hidden />
          </span>
          <div>
            <div className="text-lg font-bold leading-tight">BMS / SCADA Simulator</div>
            <div className="text-sm text-slate-300">Trực quan • Chân thực • Tiết kiệm • An toàn</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md border border-slate-600 bg-slate-700/60 px-3 py-1 text-base font-semibold">
            <span className="text-slate-300">Scenario: </span>
            {SCENARIO_LABEL[state.scenario]}
          </span>
          <span
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1 text-base font-bold',
              alarms.length ? 'bms-blink bg-red-600 text-white' : 'bg-green-700 text-white',
            )}
            role="status"
          >
            <Bell className="size-4" aria-hidden />
            {alarms.length ? `${alarms.length} ACTIVE ALARM${alarms.length > 1 ? 'S' : ''}` : 'NO ALARMS'}
          </span>
          <span className="font-mono text-lg font-semibold tabular-nums text-slate-200" aria-label="Current time">
            {time}
          </span>
        </div>
      </div>
      <nav aria-label="BMS modules" className="overflow-x-auto border-t border-slate-700">
        <ul className="flex min-w-max gap-1 px-2 md:px-4">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onChange(t.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 border-b-4 px-4 py-3 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-sky-400',
                    active ? 'border-sky-400 text-white' : 'border-transparent text-slate-300 hover:bg-slate-700/60 hover:text-white',
                  )}
                >
                  <t.icon className="size-5" aria-hidden />
                  {t.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
