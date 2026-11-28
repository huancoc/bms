'use client'

import {
  Activity,
  BatteryCharging,
  Droplets,
  Eye,
  Flame,
  Leaf,
  Lightbulb,
  Moon,
  ShieldCheck,
  Snowflake,
  Sun,
  ThermometerSun,
  Wind,
  Zap,
  Atom,
  type LucideIcon,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getAlarms, useBms } from '@/lib/bms/context'
import { busLive } from '@/lib/bms/reducer'
import type { Scenario } from '@/lib/bms/types'
import { cn } from '@/lib/utils'
import { Panel, Pill } from '../ui'
import type { TabId } from '../tabs'

const SCENARIOS: { id: Scenario; label: string; desc: string; icon: LucideIcon; tone: string }[] = [
  { id: 'normal', label: 'Normal Optimal Load (50%)', desc: '1 chiller, VFDs optimized', icon: Sun, tone: 'border-green-600 bg-green-50 text-green-900' },
  { id: 'peak', label: 'Peak Afternoon Heatwave', desc: '95% load • stages 2nd chiller', icon: ThermometerSun, tone: 'border-orange-500 bg-orange-50 text-orange-900' },
  { id: 'night', label: 'Night Energy-Saving Mode', desc: 'VFD slowdown & lighting schedule', icon: Moon, tone: 'border-indigo-500 bg-indigo-50 text-indigo-900' },
  { id: 'outage', label: 'Grid Power Outage', desc: 'Generator start & ATS transfer', icon: Zap, tone: 'border-amber-500 bg-amber-50 text-amber-900' },
  { id: 'fire', label: 'Fire Alarm Test (Floor 2)', desc: 'HVAC shutdown & emergency lights', icon: Flame, tone: 'border-red-600 bg-red-50 text-red-900' },
]

export function OverviewView({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const { state, send } = useBms()
  const alarms = getAlarms(state)
  const live = busLive(state)
  const c = state.chiller

  const pillars = [
    {
      vi: 'Trực quan',
      en: 'Visual Clarity',
      icon: Eye,
      desc: 'Live P&ID schematics with animated flows, fans and valves — every operator sees the plant state at a glance.',
      kpiLabel: 'Total Building Power',
      kpi: `${state.totalKw}`,
      unit: 'kW',
      color: 'text-sky-700',
      ring: 'border-t-sky-600',
    },
    {
      vi: 'Chân thực',
      en: 'Realistic Physics',
      icon: Atom,
      desc: 'PID loops, VFD affinity laws, staging logic and thermal inertia simulate real plant behavior.',
      kpiLabel: 'Plant Efficiency',
      kpi: c.kwPerTon > 0 ? c.kwPerTon.toFixed(2) : '—',
      unit: 'kW/TR',
      color: 'text-indigo-700',
      ring: 'border-t-indigo-600',
    },
    {
      vi: 'Tiết kiệm',
      en: 'Energy Savings',
      icon: Leaf,
      desc: 'VFD optimization, CO₂ demand-controlled ventilation and lighting schedules vs. a conventional building.',
      kpiLabel: 'Estimated Energy Saved',
      kpi: `~${Math.round(state.savedPct)}`,
      unit: '% (kWh)',
      color: 'text-green-700',
      ring: 'border-t-green-600',
    },
    {
      vi: 'An toàn',
      en: 'Life Safety & Reliability',
      icon: ShieldCheck,
      desc: 'Automatic standby changeover, generator/ATS transfer and fire interlocks — read-only FACP integration.',
      kpiLabel: 'Active Alarms',
      kpi: `${alarms.length}`,
      unit: alarms.length === 1 ? 'alarm' : 'alarms',
      color: alarms.length ? 'text-red-700' : 'text-green-700',
      ring: alarms.length ? 'border-t-red-600' : 'border-t-green-600',
    },
  ]

  const systems: { tab: TabId; label: string; icon: LucideIcon; value: string; status: string; tone: 'ok' | 'warn' | 'alarm' | 'neutral' }[] = [
    {
      tab: 'chiller',
      label: 'Chiller Plant',
      icon: Snowflake,
      value: `${c.chws.toFixed(1)} °C CHWS`,
      status: `${c.chillers.filter((x) => x.on).length}/2 chillers`,
      tone: c.chwp.some((p) => p.tripped) ? 'alarm' : c.chillers.some((x) => x.on) ? 'ok' : 'warn',
    },
    {
      tab: 'air',
      label: 'Air Side HVAC',
      icon: Wind,
      value: `${state.ahus[0].sat.toFixed(1)} °C SAT`,
      status: `${state.ahus.filter((a) => a.on).length + (state.pau.on ? 1 : 0)}/3 units`,
      tone: state.fire.active ? 'alarm' : state.ahus.some((a) => a.filterAlarm) ? 'warn' : 'ok',
    },
    {
      tab: 'power',
      label: 'Power & Generator',
      icon: BatteryCharging,
      value: `${state.power.kw} kW`,
      status: state.power.ats === 'gen' ? 'On generator' : live ? 'On utility' : 'Bus dead',
      tone: !live ? 'alarm' : state.power.ats === 'gen' ? 'warn' : 'ok',
    },
    {
      tab: 'lighting',
      label: 'Corridor Lighting',
      icon: Lightbulb,
      value: `${state.lighting.reduce((a, f) => a + f.lines.filter((l) => l.on).length, 0)}/12 lines ON`,
      status: state.lighting.every((f) => f.auto) ? 'Auto schedule' : 'Manual override',
      tone: 'ok',
    },
    {
      tab: 'fire',
      label: 'Fire Alarm (FACP)',
      icon: Flame,
      value: state.fire.active ? 'ALARM' : 'Normal',
      status: 'Read-only gateway',
      tone: state.fire.active ? 'alarm' : 'ok',
    },
    {
      tab: 'water',
      label: 'Water & Fire Tanks',
      icon: Droplets,
      value: `Roof ${Math.round(state.water.roof)}%`,
      status: `Fire tank ${Math.round(state.water.fireTank)}%`,
      tone: state.water.fireLowAlarm ? 'alarm' : state.water.roof < 30 ? 'warn' : 'ok',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="pillars" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 id="pillars" className="text-2xl font-bold text-slate-900 md:text-3xl text-balance">
              Building Management System — Live Simulation
            </h1>
            <p className="text-lg font-semibold text-slate-600">Trực quan • Chân thực • Tiết kiệm • An toàn</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill tone="info">{`Outdoor ${state.oat.toFixed(1)} °C / ${Math.round(state.oarh)}% RH`}</Pill>
            <Pill tone="neutral">{`Building load ${Math.round(state.load * 100)}%`}</Pill>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((p) => (
            <article key={p.vi} className={cn('flex flex-col gap-2 rounded-xl border border-t-4 border-slate-300 bg-slate-50 p-4 shadow-sm', p.ring)}>
              <div className="flex items-center gap-3">
                <span className={cn('rounded-lg bg-slate-200 p-2', p.color)}>
                  <p.icon className="size-6" aria-hidden />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{p.vi}</h2>
                  <p className="text-sm font-semibold text-slate-600">{p.en}</p>
                </div>
              </div>
              <p className="text-base leading-relaxed text-slate-700">{p.desc}</p>
              <div className="mt-auto border-t border-slate-300 pt-2">
                <div className="text-sm font-semibold text-slate-600">{p.kpiLabel}</div>
                <div className={cn('text-3xl font-bold tabular-nums', p.color)}>
                  {p.kpi}
                  <span className="ml-1 text-base font-semibold text-slate-500">{p.unit}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Panel title="Global Scenario Simulator" icon={<Activity className="size-5" aria-hidden />} right={<span className="text-base text-slate-600">Changes physics across every subsystem</span>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SCENARIOS.map((s) => {
            const active = state.scenario === s.id
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => send({ type: 'scenario', scenario: s.id })}
                className={cn(
                  'flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600',
                  active ? s.tone : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200',
                )}
              >
                <s.icon className="mt-0.5 size-6 shrink-0" aria-hidden />
                <span>
                  <span className="block text-base font-bold">{s.label}</span>
                  <span className="block text-sm opacity-80">{s.desc}</span>
                  {active && <span className="mt-1 block text-sm font-bold uppercase tracking-wide">● Active</span>}
                </span>
              </button>
            )
          })}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Panel
          title="Power Trend — BMS Optimized vs. Conventional Baseline"
          icon={<Leaf className="size-5" aria-hidden />}
          right={<Pill tone="ok">{`Saved ${state.kwhSaved.toFixed(1)} kWh (1 s = 1 min)`}</Pill>}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={state.history} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                <XAxis dataKey="t" tick={{ fontSize: 13, fill: '#475569' }} minTickGap={40} />
                <YAxis tick={{ fontSize: 13, fill: '#475569' }} unit=" kW" width={72} />
                <Tooltip contentStyle={{ fontSize: 15, borderRadius: 8, borderColor: '#cbd5e1', background: '#f8fafc' }} />
                <Legend wrapperStyle={{ fontSize: 15 }} />
                <Area type="monotone" dataKey="baseline" name="Conventional (no BMS)" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.5} strokeWidth={2} isAnimationActive={false} />
                <Area type="monotone" dataKey="actual" name="BMS Optimized" stroke="#16a34a" fill="#86efac" fillOpacity={0.5} strokeWidth={2.5} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { l: 'Chiller Plant', v: state.breakdown.plant },
              { l: 'Air Side', v: state.breakdown.air },
              { l: 'Lighting', v: state.breakdown.lighting },
              { l: 'Pumps & General', v: state.breakdown.misc },
            ].map((b) => (
              <div key={b.l} className="rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-2">
                <div className="text-sm font-semibold text-slate-600">{b.l}</div>
                <div className="text-xl font-bold tabular-nums">
                  {Math.round(b.v)} <span className="text-base text-slate-500">kW</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="System Status" bodyClassName="grid grid-cols-2 gap-2 p-3">
            {systems.map((s) => (
              <button
                key={s.tab}
                type="button"
                onClick={() => onNavigate(s.tab)}
                className="flex flex-col gap-1 rounded-lg border border-slate-300 bg-slate-100/70 p-3 text-left transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-sky-600"
              >
                <span className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <span
                    className={cn(
                      'size-2.5 rounded-full',
                      s.tone === 'ok' ? 'bg-green-600' : s.tone === 'warn' ? 'bg-amber-500' : s.tone === 'alarm' ? 'bms-blink bg-red-600' : 'bg-slate-400',
                    )}
                    aria-hidden
                  />
                  <s.icon className="size-4 text-slate-600" aria-hidden />
                  {s.label}
                </span>
                <span className="text-lg font-bold tabular-nums text-slate-900">{s.value}</span>
                <span className="text-sm text-slate-600">{s.status}</span>
              </button>
            ))}
          </Panel>
          <Panel title="Active Alarms" right={<Pill tone={alarms.length ? 'alarm' : 'ok'}>{alarms.length}</Pill>}>
            {alarms.length === 0 ? (
              <p className="text-base font-semibold text-green-700">No active alarms — all systems normal.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {alarms.map((a, i) => (
                  <li
                    key={`${a.source}-${i}`}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2 text-base',
                      a.level === 'alarm' ? 'border-red-300 bg-red-50 text-red-900' : 'border-amber-300 bg-amber-50 text-amber-900',
                    )}
                  >
                    <span className="font-bold">{a.source}</span>
                    <span>{a.msg}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
