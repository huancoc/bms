'use client'

import { Lightbulb, Sun } from 'lucide-react'
import { useBms } from '@/lib/bms/context'
import { busLive } from '@/lib/bms/reducer'
import type { Floor } from '@/lib/bms/types'
import { Btn, Panel, Pill, Toggle } from '../ui'

function Bulb({ x, y, on, id }: { x: number; y: number; on: boolean; id: string }) {
  return (
    <g>
      {on && <circle cx={x} cy={y} r={22} fill={`url(#glow-${id})`} />}
      <circle cx={x} cy={y} r={9} fill={on ? '#facc15' : '#cbd5e1'} stroke={on ? '#a16207' : '#64748b'} strokeWidth={2} />
    </g>
  )
}

function CorridorPlan({ f, lit, id }: { f: Floor; lit: boolean[]; id: string }) {
  const west = [60, 110, 160, 210]
  const east = [430, 480, 530, 580]
  const emergency = [40, 200, 320, 440, 600]
  return (
    <svg viewBox="0 0 640 230" className="h-auto w-full" role="img" aria-label={`${f.name} corridor lighting layout`}>
      <defs>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0%" stopColor="#fde047" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#fde047" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={10} y={10} width={620} height={210} rx={8} fill="#f1f5f9" stroke="#334155" strokeWidth={3} />
      {[30, 140].map((x) => (
        <rect key={`tw${x}`} x={x} y={22} width={100} height={60} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />
      ))}
      {[30, 140].map((x) => (
        <rect key={`bw${x}`} x={x} y={140} width={100} height={68} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />
      ))}
      {[400, 510].map((x) => (
        <rect key={`te${x}`} x={x} y={22} width={100} height={60} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />
      ))}
      {[400, 510].map((x) => (
        <rect key={`be${x}`} x={x} y={140} width={100} height={68} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />
      ))}
      <rect x={30} y={90} width={220} height={42} fill={lit[1] ? '#fef9c3' : '#e2e8f0'} stroke="#94a3b8" />
      <rect x={390} y={90} width={220} height={42} fill={lit[0] ? '#fef9c3' : '#e2e8f0'} stroke="#94a3b8" />
      <rect x={260} y={22} width={120} height={186} fill={lit[2] ? '#fef9c3' : '#e2e8f0'} stroke="#94a3b8" />
      <rect x={272} y={30} width={44} height={44} fill="#cbd5e1" stroke="#475569" strokeWidth={2} />
      <rect x={324} y={30} width={44} height={44} fill="#cbd5e1" stroke="#475569" strokeWidth={2} />
      <text x={294} y={57} textAnchor="middle" fontSize={12} fontWeight={700} fill="#334155">
        L1
      </text>
      <text x={346} y={57} textAnchor="middle" fontSize={12} fontWeight={700} fill="#334155">
        L2
      </text>

      {west.map((x) => (
        <Bulb key={`w${x}`} x={x} y={111} on={lit[1]} id={id} />
      ))}
      {east.map((x) => (
        <Bulb key={`e${x}`} x={x} y={111} on={lit[0]} id={id} />
      ))}
      <Bulb x={300} y={120} on={lit[2]} id={id} />
      <Bulb x={340} y={120} on={lit[2]} id={id} />
      <Bulb x={320} y={170} on={lit[2]} id={id} />
      {emergency.map((x) => (
        <g key={`em${x}`}>
          <rect x={x - 12} y={134} width={24} height={10} rx={2} fill={lit[3] ? '#22c55e' : '#94a3b8'} stroke="#14532d" strokeWidth={1} />
        </g>
      ))}
      <text x={140} y={104} textAnchor="middle" fontSize={12} fontWeight={700} fill="#334155">
        WEST CORRIDOR
      </text>
      <text x={500} y={104} textAnchor="middle" fontSize={12} fontWeight={700} fill="#334155">
        EAST CORRIDOR
      </text>
      <text x={320} y={200} textAnchor="middle" fontSize={12} fontWeight={700} fill="#334155">
        ELEVATOR LOBBY
      </text>
    </svg>
  )
}

export function LightingView() {
  const { state, send } = useBms()
  const live = busLive(state)
  const fire = state.fire.active

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3">
        <Lightbulb className="size-5 text-sky-700" aria-hidden />
        <span className="text-base font-semibold text-slate-700">
          Auto schedule: Day = corridors + lobby ON • Night = lobby + night lights only • Fire = emergency lights forced ON
        </span>
        {fire && <Pill tone="alarm" blink>FIRE OVERRIDE ACTIVE</Pill>}
        {!live && <Pill tone="alarm">MAINS DEAD — BATTERY EMERGENCY ONLY</Pill>}
      </div>
      {state.lighting.map((f, fi) => {
        const lit = f.lines.map((l) => l.on && (live || l.emergency))
        const total = f.lines.reduce((a, l, i) => a + (lit[i] ? l.rated + Math.sin(state.tick + i + fi) * 0.05 : 0), 0)
        return (
          <Panel
            key={f.name}
            title={`${f.name} — Corridor Lighting`}
            icon={<Lightbulb className="size-5" aria-hidden />}
            right={
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-2 text-base font-semibold text-slate-700">
                  Auto Energy Schedule
                  <Toggle checked={f.auto} onChange={(v) => send({ type: 'lightAuto', floor: fi, value: v })} label={`${f.name} auto schedule`} />
                </span>
                <Btn tone="ok" onClick={() => send({ type: 'lightFloor', floor: fi, value: true })} className="py-1">
                  Master ON
                </Btn>
                <Btn onClick={() => send({ type: 'lightFloor', floor: fi, value: false })} className="py-1">
                  Master OFF
                </Btn>
              </div>
            }
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_480px]">
              <div className="overflow-hidden rounded-lg border border-slate-300">
                <CorridorPlan f={f} lit={lit} id={`f${fi}`} />
              </div>
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-2">
                    <div className="flex items-center gap-1 text-sm font-semibold text-slate-600">
                      <Sun className="size-4" aria-hidden /> Ambient Lux
                    </div>
                    <div className="text-2xl font-bold tabular-nums">
                      {f.lux} <span className="text-base text-slate-500">lx</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-2">
                    <div className="text-sm font-semibold text-slate-600">Total Current</div>
                    <div className="text-2xl font-bold tabular-nums">
                      {total.toFixed(2)} <span className="text-base text-slate-500">A</span>
                    </div>
                  </div>
                </div>
                <ul className="divide-y divide-slate-300 rounded-lg border border-slate-300 bg-slate-100/70">
                  {f.lines.map((l, li) => {
                    const forced = fire && l.emergency
                    return (
                      <li key={l.name} className="flex items-center justify-between gap-3 px-3 py-2">
                        <div className="flex items-center gap-3">
                          <Lightbulb className={`size-6 ${lit[li] ? 'fill-yellow-300 text-yellow-600' : 'text-slate-400'}`} aria-hidden />
                          <div>
                            <div className="text-base font-semibold text-slate-900">{l.name}</div>
                            <div className="text-sm tabular-nums text-slate-600">
                              {lit[li] ? `${(l.rated + Math.sin(state.tick + li) * 0.05).toFixed(2)} A` : '0.00 A'}
                              {forced && <span className="ml-2 font-bold text-red-700">FORCED BY FIRE</span>}
                            </div>
                          </div>
                        </div>
                        <Toggle
                          checked={l.on}
                          disabled={forced}
                          onChange={(v) => send({ type: 'light', floor: fi, line: li, value: v })}
                          label={`${f.name} ${l.name}`}
                        />
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </Panel>
        )
      })}
    </div>
  )
}
