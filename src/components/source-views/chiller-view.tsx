'use client'

import { AlertTriangle, RotateCcw, Snowflake, SlidersHorizontal } from 'lucide-react'
import { useBms } from '@/lib/bms/context'
import { Btn, Diagram, Panel, Pill, Segmented, Stat } from '../ui'
import { ChillerDiagram } from './chiller-diagram'

export function ChillerView() {
  const { state, send } = useBms()
  const c = state.chiller
  const manual = !c.auto

  const rows: { id: string; on: boolean; tripped?: boolean; detail: string; cmd: boolean; onCmd: (v: boolean) => void }[] = [
    ...c.chillers.map((ch, i) => ({
      id: ch.id,
      on: ch.on,
      detail: ch.on ? `${Math.round(ch.plr * 100)}% • ${ch.kw} kW` : 'Stopped',
      cmd: ch.cmd,
      onCmd: (v: boolean) => send({ type: 'chillerCmd', index: i, value: v }),
    })),
    ...c.chwp.map((p, i) => ({
      id: p.id,
      on: p.on,
      tripped: p.tripped,
      detail: p.tripped ? 'VFD FAULT' : p.on ? `${p.hz.toFixed(1)} Hz` : 'Standby',
      cmd: p.cmd,
      onCmd: (v: boolean) => send({ type: 'pumpCmd', group: 'chwp', index: i, value: v }),
    })),
    ...c.cwp.map((p, i) => ({
      id: p.id,
      on: p.on,
      detail: p.on ? `${p.hz.toFixed(1)} Hz` : 'Standby',
      cmd: p.cmd,
      onCmd: (v: boolean) => send({ type: 'pumpCmd', group: 'cwp', index: i, value: v }),
    })),
    ...c.towers.map((t, i) => ({
      id: t.id,
      on: t.on,
      detail: t.on ? `Fan ${t.hz.toFixed(1)} Hz` : 'Standby',
      cmd: t.cmd,
      onCmd: (v: boolean) => send({ type: 'towerCmd', index: i, value: v }),
    })),
  ]

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_400px]">
      <Panel
        title="Chiller Plant — P&ID Schematic"
        icon={<Snowflake className="size-5" aria-hidden />}
        right={
          <div className="flex flex-wrap gap-2">
            <Pill tone={c.auto ? 'ok' : 'warn'}>{c.auto ? 'AUTO SEQUENCING' : 'MANUAL MODE'}</Pill>
            {state.power.ats === 'gen' && <Pill tone="warn">LOCKED OUT — ON GENERATOR</Pill>}
          </div>
        }
      >
        <Diagram label="Two water-cooled chillers with primary pumps, condenser pumps, cooling towers and bypass valve">
          <ChillerDiagram c={c} load={state.load} />
        </Diagram>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <Stat label="CHW Supply" value={c.chws.toFixed(1)} unit="°C" tone={c.chws > c.setpoint + 1.5 ? 'alarm' : 'info'} />
          <Stat label="CHW Return" value={c.chwr.toFixed(1)} unit="°C" tone="info" />
          <Stat label="CW Supply" value={c.cws.toFixed(1)} unit="°C" />
          <Stat label="CW Return" value={c.cwr.toFixed(1)} unit="°C" />
          <Stat label="Diff. Pressure" value={c.dp.toFixed(1)} unit="kPa" />
          <Stat label="Plant Load" value={c.tons} unit="TR" />
          <Stat label="Efficiency" value={c.kwPerTon.toFixed(2)} unit="kW/TR" tone={c.kwPerTon > 0 && c.kwPerTon < 0.7 ? 'ok' : 'warn'} />
        </div>
      </Panel>

      <div className="flex flex-col gap-4">
        <Panel title="Plant Control" icon={<SlidersHorizontal className="size-5" aria-hidden />}>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-base font-semibold text-slate-700">Sequencing mode</span>
              <Segmented
                label="Chiller plant mode"
                value={c.auto ? 'auto' : 'manual'}
                options={[
                  { value: 'auto', label: 'Auto' },
                  { value: 'manual', label: 'Manual' },
                ]}
                onChange={(v) => send({ type: 'chillerAuto', value: v === 'auto' })}
              />
            </div>
            <div>
              <label htmlFor="chw-sp" className="flex items-center justify-between text-base font-semibold text-slate-700">
                CHW supply setpoint
                <span className="text-2xl font-bold tabular-nums text-sky-700">{c.setpoint.toFixed(1)} °C</span>
              </label>
              <input
                id="chw-sp"
                type="range"
                min={6}
                max={10}
                step={0.5}
                value={c.setpoint}
                onChange={(e) => send({ type: 'setpoint', value: Number(e.target.value) })}
                className="mt-2 w-full accent-sky-700"
              />
              <div className="flex justify-between text-sm text-slate-500">
                <span>6.0 °C</span>
                <span>Higher setpoint = lower kW/TR</span>
                <span>10.0 °C</span>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Equipment" bodyClassName="p-0">
          <ul className="divide-y divide-slate-300">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span
                    className={`size-3 rounded-full ${r.tripped ? 'bms-blink bg-red-600' : r.on ? 'bg-green-600' : 'bg-slate-400'}`}
                    aria-hidden
                  />
                  <div>
                    <div className="text-base font-bold text-slate-900">{r.id}</div>
                    <div className={`text-sm tabular-nums ${r.tripped ? 'font-bold text-red-700' : 'text-slate-600'}`}>{r.detail}</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Btn tone={r.cmd ? 'ok' : 'neutral'} disabled={!manual || r.cmd} onClick={() => r.onCmd(true)} className="px-2.5 py-1 text-sm">
                    Start
                  </Btn>
                  <Btn tone={!r.cmd ? 'alarm' : 'neutral'} disabled={!manual || !r.cmd} onClick={() => r.onCmd(false)} className="px-2.5 py-1 text-sm">
                    Stop
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
          {!manual && <p className="border-t border-slate-300 px-4 py-2 text-sm text-slate-500">Switch to Manual to start/stop equipment.</p>}
        </Panel>

        <Panel title="Fault Simulation" icon={<AlertTriangle className="size-5" aria-hidden />}>
          <div className="flex flex-col gap-3">
            <p className="text-base text-slate-600">
              Trips the duty pump VFD. In Auto, the BMS starts standby CHWP-02 within 3 seconds and the chiller restarts on flow proof.
            </p>
            {c.standbyCountdown !== null && (
              <div className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-base font-bold text-amber-900" role="status">
                Standby CHWP-02 starting in {c.standbyCountdown} s…
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Btn tone="alarm" onClick={() => send({ type: 'tripChwp' })} disabled={c.chwp[0].tripped}>
                <AlertTriangle className="size-4" aria-hidden />
                Simulate CHWP-01 Trip
              </Btn>
              <Btn onClick={() => send({ type: 'resetTrip' })} disabled={!c.chwp.some((p) => p.tripped)}>
                <RotateCcw className="size-4" aria-hidden />
                Reset Fault
              </Btn>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
