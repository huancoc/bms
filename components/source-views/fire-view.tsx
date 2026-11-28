'use client'

import { ArrowRight, BellRing, CheckCircle2, Circle, Flame, Lock, RotateCcw, Server, ShieldAlert } from 'lucide-react'
import { useBms } from '@/lib/bms/context'
import { Btn, Panel, Pill } from '../ui'

export function FireView() {
  const { state, send } = useBms()
  const f = state.fire
  const interlocks = [
    { label: 'Stop AHU-01 supply fan', done: f.active && !state.ahus[0].on },
    { label: 'Stop AHU-02 supply fan', done: f.active && !state.ahus[1].on },
    { label: 'Stop PAU-01 fresh air unit', done: f.active && !state.pau.on },
    { label: 'Close fire/smoke dampers FSD-01/02/03', done: f.active && state.ahus.every((a) => a.fsd < 5) && state.pau.fsd < 5 },
    { label: 'Force ON corridor emergency lights (all floors)', done: f.active && state.lighting.every((l) => l.lines[3].on) },
    { label: 'Main fire pump status monitored', done: f.active && state.water.mainFire },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 size-6 shrink-0 text-red-700" aria-hidden />
          <p className="text-base font-bold uppercase leading-relaxed tracking-wide text-red-900 md:text-lg">
            Read-only high-level integration via FACP Modbus/BACnet gateway
            <span className="block text-base font-semibold normal-case tracking-normal text-red-800">
              Life Safety Compliance — No Remote Reset. Silence/Reset can only be performed at the Fire Alarm Control Panel.
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn tone="alarm" onClick={() => send({ type: 'fireTrigger' })} disabled={f.active}>
            <Flame className="size-4" aria-hidden />
            Trigger Test Fire Alarm (Floor 2 - West Wing)
          </Btn>
          <Btn onClick={() => send({ type: 'fireReset' })} disabled={!f.active}>
            <RotateCcw className="size-4" aria-hidden />
            Simulate Local FACP Reset
          </Btn>
        </div>
      </div>

      <Panel title="Integration Architecture" icon={<Server className="size-5" aria-hidden />}>
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          {[
            { t: 'FACP', d: 'Addressable fire panel • detectors, MCPs, flow switches', tone: 'border-red-400 bg-red-50' },
            { t: 'Gateway', d: 'FACP → BACnet/IP & Modbus TCP (one-way)', tone: 'border-amber-400 bg-amber-50' },
            { t: 'BMS Server', d: 'Monitor, log, execute HVAC & lighting interlocks', tone: 'border-sky-400 bg-sky-50' },
          ].map((b, i, arr) => (
            <div key={b.t} className="flex flex-1 items-center gap-3">
              <div className={`flex-1 rounded-lg border-2 px-4 py-3 ${b.tone}`}>
                <div className="text-lg font-bold text-slate-900">{b.t}</div>
                <div className="text-base text-slate-700">{b.d}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="flex flex-col items-center text-sm font-bold text-slate-600">
                  <ArrowRight className="size-7 rotate-90 md:rotate-0" aria-hidden />
                  READ
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Panel
          title="Zone Status Matrix — 3 Floors × 3 Zones"
          icon={<BellRing className="size-5" aria-hidden />}
          right={<Pill tone={f.active ? 'alarm' : 'ok'} blink={f.active}>{f.active ? 'FIRE ALARM' : 'ALL NORMAL'}</Pill>}
        >
          <div className="flex flex-col gap-3">
            {[...f.floors].reverse().map((fl) => (
              <div key={fl.name} className="grid grid-cols-[90px_repeat(3,minmax(0,1fr))] items-stretch gap-3">
                <div className="flex items-center text-lg font-bold text-slate-800">{fl.name}</div>
                {fl.zones.map((z) => {
                  const alarm = z.smoke === 'alarm' || z.heat === 'alarm' || z.flow
                  return (
                    <div
                      key={z.name}
                      className={`rounded-lg border-2 p-3 ${alarm ? 'bms-blink border-red-600 bg-red-100' : 'border-green-300 bg-green-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-slate-900">{z.name}</span>
                        {alarm ? <Flame className="size-5 text-red-700" aria-label="Alarm" /> : <CheckCircle2 className="size-5 text-green-700" aria-label="Normal" />}
                      </div>
                      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 text-sm">
                        <dt className="text-slate-600">Smoke</dt>
                        <dd className={`text-right font-bold ${z.smoke === 'alarm' ? 'text-red-700' : 'text-green-700'}`}>{z.smoke.toUpperCase()}</dd>
                        <dt className="text-slate-600">Heat</dt>
                        <dd className={`text-right font-bold ${z.heat === 'alarm' ? 'text-red-700' : 'text-green-700'}`}>{z.heat.toUpperCase()}</dd>
                        <dt className="text-slate-600">Sprinkler</dt>
                        <dd className={`text-right font-bold ${z.flow ? 'text-red-700' : 'text-green-700'}`}>{z.flow ? 'FLOW' : 'NO FLOW'}</dd>
                      </dl>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="BMS Fire Interlocks" icon={<ShieldAlert className="size-5" aria-hidden />}>
          <ul className="flex flex-col gap-2">
            {interlocks.map((i) => (
              <li
                key={i.label}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-base font-semibold ${
                  i.done ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-300 bg-slate-100 text-slate-600'
                }`}
              >
                {i.done ? <CheckCircle2 className="size-5 shrink-0 text-red-700" aria-hidden /> : <Circle className="size-5 shrink-0 text-slate-400" aria-hidden />}
                {i.label}
                <span className="ml-auto text-sm font-bold">{i.done ? 'EXECUTED' : 'STANDBY'}</span>
              </li>
            ))}
          </ul>
          {f.active && (
            <p className="mt-3 text-base font-semibold text-red-800" role="status">
              {`Alarm elapsed ${f.elapsed} s — interlocks are held until the FACP is reset on-site.`}
            </p>
          )}
        </Panel>
      </div>
    </div>
  )
}
