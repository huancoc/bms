'use client'

import { Droplets, ShieldCheck, Waves } from 'lucide-react'
import { useBms } from '@/lib/bms/context'
import type { Water } from '@/lib/bms/types'
import { COLORS, Pipe, Pump, Sensor, Tank } from '../svg'
import { Btn, Diagram, Panel, Pill, Segmented, Stat, Toggle } from '../ui'

function DomesticDiagram({ w }: { w: Water }) {
  const p1 = w.pumps[0].on
  const p2 = w.pumps[1].on
  const any = p1 || p2
  const refill = w.ug < 92
  return (
    <svg viewBox="0 0 1000 540" className="h-auto w-full" role="img" aria-label="Domestic water underground tank, booster pumps and roof tank">
      <text x={20} y={282} fontSize={13} fontWeight={700} fill="#334155">
        CITY WATER
      </text>
      <Pipe d="M20 300 H110 V330" color={COLORS.water} active={refill} width={9} speed={0.6} />
      <text x={200} y={318} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0f172a">
        UNDERGROUND TANK
      </text>
      <Tank x={60} y={330} w={280} h={180} level={w.ug} id="tank-ug" highSw={{ at: 95, label: 'HIGH' }} lowSw={{ at: 20, label: 'LOW' }} />
      <text x={200} y={430} textAnchor="middle" fontSize={40} fontWeight={800} fill="#0f172a" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {w.ug.toFixed(0)}%
      </text>

      <Pipe d="M340 495 H480" color={COLORS.water} active={any} width={10} />
      <Pipe d="M480 495 H580" color={COLORS.water} active={p2} width={10} />
      <Pipe d="M480 495 V360" color={COLORS.water} active={p1} width={10} />
      <Pipe d="M580 495 V360" color={COLORS.water} active={p2} width={10} />
      <Pipe d="M480 360 H580" color={COLORS.water} active={p1} width={10} />
      <Pipe d="M580 360 H760 V200" color={COLORS.water} active={any} width={10} speed={1.2} />
      <Pump x={480} y={428} on={p1} label="BP-01" hz={p1 ? 50 : 0} side="left" />
      <Pump x={580} y={428} on={p2} label="BP-02" hz={p2 ? 50 : 0} side="right" />
      <text x={530} y={530} textAnchor="middle" fontSize={13} fontWeight={700} fill="#334155">
        BOOSTER PUMPS (DUTY {w.pumps[w.dutyIndex].id})
      </text>
      <Sensor x={690} y={410} label="DISCHARGE" value={any ? '4.2 bar' : '0.3 bar'} tone={any ? 'ok' : 'neutral'} lead={[690, 360]} />

      <text x={760} y={30} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0f172a">
        ROOF TANK
      </text>
      <Tank x={620} y={40} w={280} h={160} level={w.roof} id="tank-roof" highSw={{ at: 90, label: 'HIGH' }} lowSw={{ at: 30, label: 'LOW' }} />
      <text x={760} y={135} textAnchor="middle" fontSize={40} fontWeight={800} fill="#0f172a" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {w.roof.toFixed(0)}%
      </text>
      <Pipe d="M620 185 H540 V280" color={COLORS.water} active={w.roof > 1} width={9} speed={w.draining ? 2.5 : 0.6} />
      <text x={540} y={300} textAnchor="middle" fontSize={13} fontWeight={700} fill="#334155">
        {w.draining ? 'FAST DRAIN TEST ↓' : 'TO FIXTURES ↓'}
      </text>
    </svg>
  )
}

function FireTankDiagram({ w }: { w: Water }) {
  return (
    <svg viewBox="0 0 640 300" className="h-auto w-full" role="img" aria-label="Fire protection water tank with jockey and main fire pump">
      <text x={160} y={28} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0f172a">
        FIRE WATER TANK
      </text>
      <Tank x={30} y={40} w={240} h={220} level={w.fireTank} id="tank-fire" color="#f87171" lowSw={{ at: 60, label: 'LOW' }} />
      <text x={150} y={165} textAnchor="middle" fontSize={40} fontWeight={800} fill="#0f172a" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {w.fireTank.toFixed(0)}%
      </text>
      <Pipe d="M270 245 H380 V110 H560" color="#dc2626" active={w.jockey} width={9} />
      <Pipe d="M380 245 V200 H560" color="#dc2626" active={w.mainFire} width={11} speed={1.6} />
      <Pump x={440} y={110} on={w.jockey} label="JOCKEY" hz={w.jockey ? 50 : 0} side="right" r={18} />
      <Pump x={440} y={200} on={w.mainFire} label="MAIN FIRE" hz={w.mainFire ? 50 : 0} side="right" r={22} />
      <text x={600} y={60} textAnchor="end" fontSize={13} fontWeight={700} fill="#334155">
        → SPRINKLER MAIN
      </text>
      <Sensor x={560} y={270} label="SYSTEM PRESSURE" value={`${w.pressure.toFixed(2)} bar`} tone={w.pressure < 6.8 ? 'warn' : 'ok'} lead={[560, 200]} />
    </svg>
  )
}

export function WaterView() {
  const { state, send } = useBms()
  const w = state.water

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <Panel
          title="Domestic Water Supply"
          icon={<Droplets className="size-5" aria-hidden />}
          right={
            <div className="flex gap-2">
              {w.draining && <Pill tone="warn" blink>DRAIN TEST</Pill>}
              <Pill tone={w.pumps.some((p) => p.on) ? 'ok' : 'neutral'}>{w.pumps.some((p) => p.on) ? 'FILLING' : 'IDLE'}</Pill>
            </div>
          }
        >
          <Diagram label="Underground tank feeds two booster pumps lifting water to the roof tank">
            <DomesticDiagram w={w} />
          </Diagram>
        </Panel>
        <Panel title="Booster Pump Control" icon={<Waves className="size-5" aria-hidden />}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-slate-700">Control mode</span>
              <Segmented
                label="Booster pump mode"
                value={w.auto ? 'auto' : 'manual'}
                options={[
                  { value: 'auto', label: 'Auto' },
                  { value: 'manual', label: 'Manual' },
                ]}
                onChange={(v) => send({ type: 'waterAuto', value: v === 'auto' })}
              />
            </div>
            <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-base text-sky-900">
              Auto logic: START duty pump when Roof &lt; 30% and Underground &gt; 20%. STOP at Roof ≥ 90%. Duty/standby alternate each cycle.
            </p>
            <ul className="flex flex-col gap-2">
              {w.pumps.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-2">
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      {p.id} <span className="text-sm font-semibold text-slate-500">{i === w.dutyIndex ? 'DUTY' : 'STANDBY'}</span>
                    </div>
                    <div className={`text-sm font-semibold ${p.on ? 'text-green-700' : 'text-slate-500'}`}>{p.on ? 'RUNNING' : 'STOPPED'}</div>
                  </div>
                  <Toggle checked={p.cmd} disabled={w.auto} onChange={(v) => send({ type: 'boosterCmd', index: i, value: v })} label={`${p.id} manual run`} />
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Roof Tank" value={w.roof.toFixed(1)} unit="%" tone={w.roof < 30 ? 'warn' : 'info'} />
              <Stat label="Underground" value={w.ug.toFixed(1)} unit="%" tone={w.ug < 20 ? 'warn' : 'info'} />
            </div>
            <Btn tone="warn" onClick={() => send({ type: 'drainRoof' })} disabled={w.draining}>
              Drain Roof Tank Fast
            </Btn>
          </div>
        </Panel>
      </div>

      <Panel
        title="Fire Protection Water Tank"
        icon={<ShieldCheck className="size-5" aria-hidden />}
        right={
          <div className="flex flex-wrap gap-2">
            <Pill tone="alarm">MONITORING ONLY (Life Safety Compliance)</Pill>
            {w.fireLowAlarm && <Pill tone="alarm" blink>LOW LEVEL ALARM</Pill>}
          </div>
        }
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
          <Diagram label="Fire water tank with jockey pump and main fire pump status">
            <FireTankDiagram w={w} />
          </Diagram>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Tank Level" value={w.fireTank.toFixed(1)} unit="%" tone={w.fireLowAlarm ? 'alarm' : 'ok'} />
              <Stat label="Pressure" value={w.pressure.toFixed(2)} unit="bar" />
              <Stat label="Jockey Pump" value={w.jockey ? 'RUN' : 'STOP'} tone={w.jockey ? 'ok' : 'neutral'} />
              <Stat label="Main Fire Pump" value={w.mainFire ? 'RUN' : 'STANDBY'} tone={w.mainFire ? 'alarm' : 'neutral'} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-3">
              <span className="text-base font-semibold text-slate-700">Low-level alarm test</span>
              <Toggle checked={w.fireLowTest} onChange={(v) => send({ type: 'fireLowTest', value: v })} label="Fire tank low-level alarm test" />
            </div>
            <p className="text-base text-slate-600">
              Fire pumps are controlled by their own listed controller. The BMS only reads status — no start/stop commands are exposed.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  )
}
