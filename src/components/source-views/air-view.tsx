'use client'

import { useState } from 'react'
import { Fan as FanIcon, Minus, Plus, Thermometer, Wind } from 'lucide-react'
import { useBms } from '@/lib/bms/context'
import type { FanSpeed } from '@/lib/bms/types'
import { valveColor } from '../svg'
import { Btn, Diagram, Panel, Pill, Segmented, Stat, Toggle } from '../ui'
import { AhuDiagram, PauDiagram } from './air-diagrams'

export function AirView() {
  const { state, send } = useBms()
  const [sel, setSel] = useState(0)
  const a = state.ahus[sel]
  const fire = state.fire.active

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title={`${a.id} — ${a.name} Air Handling Unit`}
        icon={<Wind className="size-5" aria-hidden />}
        right={
          <div className="flex flex-wrap items-center gap-2">
            {fire && <Pill tone="alarm" blink>FIRE SHUTDOWN</Pill>}
            {a.filterAlarm && <Pill tone="warn">FILTER MAINTENANCE</Pill>}
            <Pill tone={a.on ? 'ok' : 'neutral'}>{a.on ? 'RUNNING' : 'STOPPED'}</Pill>
            <Segmented
              label="Select AHU"
              value={String(sel)}
              options={state.ahus.map((x, i) => ({ value: String(i), label: x.id }))}
              onChange={(v) => setSel(Number(v))}
            />
          </div>
        }
      >
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <Diagram label={`${a.id} airflow from outdoor and return air dampers through filters, cooling coil and supply fan`}>
            <AhuDiagram a={a} oat={state.oat} oarh={state.oarh} chws={state.chiller.chws} />
          </Diagram>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-3">
              <span className="text-base font-semibold text-slate-700">{a.id} Start / Stop</span>
              <Toggle checked={a.enabled} onChange={() => send({ type: 'ahuToggle', index: sel })} label={`${a.id} enable`} />
            </div>
            <div className="rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-3">
              <label htmlFor="sa-sp" className="flex items-center justify-between text-base font-semibold text-slate-700">
                Supply air setpoint
                <span className="text-2xl font-bold tabular-nums text-sky-700">{a.sp.toFixed(1)} °C</span>
              </label>
              <input
                id="sa-sp"
                type="range"
                min={12}
                max={18}
                step={0.5}
                value={a.sp}
                onChange={(e) => send({ type: 'ahuSp', index: sel, value: Number(e.target.value) })}
                className="mt-2 w-full accent-sky-700"
              />
              <p className="text-sm text-slate-500">PID loop modulates the 2-way CHW valve to hold this setpoint.</p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-3">
              <span className="text-base font-semibold text-slate-700">Filter maintenance test</span>
              <Btn tone={a.dirty ? 'ok' : 'warn'} onClick={() => send({ type: 'ahuDirty', index: sel, value: !a.dirty })}>
                {a.dirty ? 'Replace Filter (Clean)' : 'Simulate Dirty Filter'}
              </Btn>
              <p className="text-sm text-slate-500">Alarm raised when bag filter ΔP exceeds 250 Pa.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="CHW Valve" value={Math.round(a.valve)} unit="%" />
              <Stat label="Fan Power" value={a.kw.toFixed(1)} unit="kW" />
              <Stat label="Fresh Air" value={Math.round(a.fa)} unit="%" />
              <Stat label="CO₂" value={a.co2} unit="ppm" tone={a.co2 > 1000 ? 'alarm' : a.co2 > 850 ? 'warn' : 'ok'} />
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="PAU-01 — Primary Air Unit with Heat Recovery"
        icon={<Wind className="size-5" aria-hidden />}
        right={
          <div className="flex items-center gap-3">
            <Pill tone={state.pau.on ? 'ok' : 'neutral'}>{state.pau.on ? 'RUNNING' : 'STOPPED'}</Pill>
            <Toggle checked={state.pau.enabled} onChange={() => send({ type: 'pauToggle' })} label="PAU-01 enable" />
          </div>
        }
      >
        <Diagram label="Outdoor air through heat recovery wheel and pre-cooling coil to treated fresh air supply">
          <PauDiagram p={state.pau} oat={state.oat} oarh={state.oarh} chws={state.chiller.chws} />
        </Diagram>
      </Panel>

      <Panel title="Fan Coil Units" icon={<FanIcon className="size-5" aria-hidden />}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {state.fcus.map((f, i) => (
            <FcuCard key={f.id} index={i} />
          ))}
        </div>
      </Panel>
    </div>
  )
}

function FcuCard({ index }: { index: number }) {
  const { state, send } = useBms()
  const f = state.fcus[index]
  const valvePct = f.valveOpen ? 100 : 0
  const set = (patch: { on?: boolean; fan?: FanSpeed; sp?: number }) => send({ type: 'fcu', index, patch })
  const err = f.room - f.sp

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-slate-300 bg-slate-100/70 p-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{f.id}</h3>
          <p className="text-sm text-slate-600">{f.zone}</p>
        </div>
        <Toggle checked={f.on} onChange={(v) => set({ on: v })} label={`${f.id} power`} />
      </header>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-600">
            <Thermometer className="size-4" aria-hidden /> Room
          </div>
          <div className={`text-3xl font-bold tabular-nums ${err > 1.5 ? 'text-amber-700' : 'text-slate-900'}`}>
            {f.room.toFixed(1)}
            <span className="text-base text-slate-500"> °C</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-600">Setpoint</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Decrease setpoint"
              disabled={f.sp <= 18}
              onClick={() => set({ sp: Math.max(18, f.sp - 0.5) })}
              className="rounded-md border border-slate-400 bg-slate-50 p-1 hover:bg-slate-200 disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden />
            </button>
            <span className="w-16 text-center text-2xl font-bold tabular-nums text-sky-700">{f.sp.toFixed(1)}</span>
            <button
              type="button"
              aria-label="Increase setpoint"
              disabled={f.sp >= 28}
              onClick={() => set({ sp: Math.min(28, f.sp + 0.5) })}
              className="rounded-md border border-slate-400 bg-slate-50 p-1 hover:bg-slate-200 disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      <Segmented
        label={`${f.id} fan speed`}
        value={f.fan}
        disabled={!f.on}
        options={[
          { value: 'low', label: 'Low' },
          { value: 'med', label: 'Med' },
          { value: 'high', label: 'High' },
          { value: 'auto', label: 'Auto' },
        ]}
        onChange={(v) => set({ fan: v })}
      />
      <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <svg viewBox="-16 -16 32 32" className="size-8" aria-hidden>
            <path d="M-12 -8 L12 8 L12 -8 L-12 8 Z" fill={valveColor(valvePct)} stroke="#0f172a" strokeWidth={1.5} />
          </svg>
          <span className="text-base font-semibold text-slate-700">2-way valve</span>
        </div>
        <span className={`text-base font-bold ${f.valveOpen ? 'text-green-700' : 'text-red-700'}`}>{f.valveOpen ? 'OPEN' : 'CLOSED'}</span>
      </div>
      <p className="text-sm text-slate-600">
        Fan: <span className="font-bold uppercase text-slate-800">{f.on ? f.actualFan : 'off'}</span>
        {f.fan === 'auto' && f.on ? ' (auto)' : ''}
      </p>
    </article>
  )
}
