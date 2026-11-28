'use client'

import { Fuel, Gauge, PlugZap, Power as PowerIcon, Zap } from 'lucide-react'
import { useBms } from '@/lib/bms/context'
import { busLive } from '@/lib/bms/reducer'
import type { Power, PowerPhase } from '@/lib/bms/types'
import { COLORS, Pipe, Sensor } from '../svg'
import { Bar, Btn, Diagram, Panel, Pill, Stat } from '../ui'

const STEPS: { phase: PowerPhase[]; label: string }[] = [
  { phase: ['detect'], label: 'Grid lost → 0 V detected' },
  { phase: ['crank'], label: 'GEN-01 start signal • cranking' },
  { phase: ['stabilize'], label: 'Voltage & frequency stabilizing' },
  { phase: ['ongen'], label: 'ATS → Generator • power restored' },
  { phase: ['retransfer', 'cooldown'], label: 'Grid back → re-transfer & cool-down' },
]

function Breaker({ x, y, closed, live }: { x: number; y: number; closed: boolean; live: boolean }) {
  return (
    <g>
      <rect
        x={x - 16}
        y={y - 16}
        width={32}
        height={32}
        rx={4}
        fill={closed ? (live ? '#16a34a' : '#64748b') : '#f8fafc'}
        stroke={closed ? '#14532d' : '#dc2626'}
        strokeWidth={3}
      />
      <text x={x} y={y + 5} textAnchor="middle" fontSize={12} fontWeight={800} fill={closed ? '#f8fafc' : '#dc2626'}>
        {closed ? 'ON' : 'OFF'}
      </text>
    </g>
  )
}

function SingleLine({ p, live, loads }: { p: Power; live: boolean; loads: { name: string; kw: number; shed?: boolean }[] }) {
  const genRunning = p.genState === 'running' || p.genState === 'cooldown'
  const utilLive = p.gridOk
  const utilFlow = utilLive && p.ats === 'grid'
  const genFlow = genRunning && p.ats === 'gen'
  const angle = p.ats === 'grid' ? -50 : p.ats === 'gen' ? 50 : 0
  const bannerText: Record<PowerPhase, string> = {
    normal: 'NORMAL — BUILDING ON UTILITY SUPPLY',
    detect: `GRID LOSS DETECTED — GENERATOR START IN ${p.countdown} s`,
    crank: `GEN-01 CRANKING… (${p.countdown} s)`,
    stabilize: `GEN-01 STABILIZING ${p.genV[0].toFixed(0)} V / ${p.genFreq.toFixed(1)} Hz — TRANSFER IN ${p.countdown} s`,
    ongen: 'ON GENERATOR — ESSENTIAL LOADS SUPPLIED',
    retransfer: `GRID RESTORED — RE-TRANSFER IN ${p.countdown} s (OPEN TRANSITION)`,
    cooldown: `BACK ON UTILITY — GEN-01 COOL-DOWN ${p.countdown} s`,
  }
  const bannerTone = p.phase === 'normal' ? '#16a34a' : p.phase === 'ongen' || p.phase === 'cooldown' ? '#d97706' : '#dc2626'

  return (
    <svg viewBox="0 0 1000 580" className="h-auto w-full" role="img" aria-label="Single line diagram with utility transformer, generator, ATS and main busbar">
      <rect x={180} y={10} width={640} height={36} rx={8} fill={bannerTone} className={p.phase !== 'normal' && p.phase !== 'ongen' ? 'bms-blink' : undefined} />
      <text x={500} y={34} textAnchor="middle" fontSize={16} fontWeight={800} fill="#f8fafc">
        {bannerText[p.phase]}
      </text>

      {/* Utility */}
      <circle cx={220} cy={84} r={26} fill="none" stroke={utilLive ? '#16a34a' : '#dc2626'} strokeWidth={3.5} />
      <circle cx={220} cy={116} r={26} fill="none" stroke={utilLive ? '#16a34a' : '#dc2626'} strokeWidth={3.5} />
      <text x={180} y={90} textAnchor="end" fontSize={15} fontWeight={800} fill="#0f172a">
        UTILITY GRID
      </text>
      <text x={180} y={110} textAnchor="end" fontSize={13} fill="#475569">
        TR-01 22/0.4 kV 2000 kVA
      </text>
      <Pipe d="M220 142 V210 H440 V290" color={COLORS.power} active={utilFlow} width={8} speed={1.4} />
      <Breaker x={220} y={180} closed={utilLive} live={utilLive} />
      <text x={248} y={185} fontSize={13} fontWeight={700} fill="#334155">
        ACB-U
      </text>

      {/* Generator */}
      <circle cx={780} cy={100} r={42} fill={genRunning ? '#dcfce7' : '#f1f5f9'} stroke={genRunning ? '#16a34a' : '#475569'} strokeWidth={3.5} />
      <text x={780} y={110} textAnchor="middle" fontSize={28} fontWeight={800} fill="#0f172a">
        G~
      </text>
      <text x={834} y={92} fontSize={15} fontWeight={800} fill="#0f172a">
        GEN-01
      </text>
      <text x={834} y={112} fontSize={13} fill="#475569">
        Diesel 800 kVA
      </text>
      <text x={834} y={132} fontSize={13} fontWeight={700} fill={genRunning ? '#15803d' : p.genState === 'cranking' ? '#d97706' : '#64748b'}>
        {p.genState.toUpperCase()}
      </text>
      <Pipe d="M780 142 V210 H560 V290" color={COLORS.power} active={genFlow} width={8} speed={1.4} />
      <Breaker x={780} y={180} closed={genRunning} live={genRunning} />
      <text x={752} y={185} textAnchor="end" fontSize={13} fontWeight={700} fill="#334155">
        ACB-G
      </text>

      {/* ATS */}
      <rect x={360} y={250} width={280} height={124} rx={12} fill="#f8fafc" stroke="#334155" strokeWidth={3} />
      <text x={500} y={272} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0f172a">
        ATS-01
      </text>
      <circle cx={440} cy={290} r={7} fill={utilLive ? '#16a34a' : '#94a3b8'} stroke="#0f172a" strokeWidth={2} />
      <circle cx={560} cy={290} r={7} fill={genRunning ? '#16a34a' : '#94a3b8'} stroke="#0f172a" strokeWidth={2} />
      <text x={420} y={300} textAnchor="end" fontSize={12} fontWeight={700} fill="#475569">
        N
      </text>
      <text x={580} y={300} fontSize={12} fontWeight={700} fill="#475569">
        E
      </text>
      <line
        x1={500}
        y1={340}
        x2={500}
        y2={262}
        stroke={live ? '#16a34a' : '#dc2626'}
        strokeWidth={6}
        strokeLinecap="round"
        style={{ transform: `rotate(${angle}deg)`, transformOrigin: '500px 340px', transformBox: 'view-box', transition: 'transform .6s ease' }}
      />
      <circle cx={500} cy={340} r={8} fill="#0f172a" />
      <text x={500} y={364} textAnchor="middle" fontSize={13} fontWeight={800} fill={live ? '#15803d' : '#dc2626'}>
        {p.ats === 'grid' ? 'POSITION: UTILITY' : p.ats === 'gen' ? 'POSITION: GENERATOR' : 'POSITION: OPEN'}
      </text>

      <Pipe d="M500 374 V450" color={COLORS.power} active={live} width={8} speed={1.4} />
      <Sensor x={620} y={412} label="BUS LOAD" value={`${p.kw} kW`} tone={live ? 'ok' : 'alarm'} lead={[500, 412]} />

      {/* Busbar */}
      <line x1={90} y1={450} x2={910} y2={450} stroke={live ? '#16a34a' : '#94a3b8'} strokeWidth={14} strokeLinecap="round" />
      <text x={90} y={436} fontSize={14} fontWeight={800} fill="#0f172a">
        MAIN LV BUSBAR 400 V
      </text>
      {loads.map((l, i) => {
        const x = 190 + i * 210
        const active = live && !l.shed
        return (
          <g key={l.name}>
            <Pipe d={`M${x} 456 V500`} color={COLORS.power} active={active} width={7} speed={1.2} />
            <rect x={x - 92} y={500} width={184} height={66} rx={8} fill={l.shed && live ? '#fef3c7' : '#f8fafc'} stroke={active ? '#16a34a' : '#64748b'} strokeWidth={2.5} />
            <text x={x} y={524} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0f172a">
              {l.name}
            </text>
            <text x={x} y={550} textAnchor="middle" fontSize={15} fontWeight={700} fill={l.shed && live ? '#b45309' : '#334155'}>
              {l.shed && live ? 'SHED (ON GEN)' : `${active ? l.kw : 0} kW`}
            </text>
          </g>
        )
      })}

      <Sensor x={100} y={230} label="GRID L1-N" value={`${p.gridV[0].toFixed(1)} V`} tone={utilLive ? 'ok' : 'alarm'} lead={[220, 230]} />
      <Sensor x={900} y={230} label="GEN L1-N" value={`${p.genV[0].toFixed(1)} V`} tone={genRunning ? 'ok' : 'neutral'} lead={[780, 230]} />
    </svg>
  )
}

export function PowerView() {
  const { state, send } = useBms()
  const p = state.power
  const live = busLive(state)
  const onGen = p.ats === 'gen'
  const b = state.breakdown
  const loads = [
    { name: 'Chiller Plant', kw: b.plant, shed: onGen },
    { name: 'HVAC AHU/PAU/FCU', kw: Math.round(b.air) },
    { name: 'Lighting', kw: Math.round(b.lighting) },
    { name: 'Pumps & General', kw: b.misc },
  ]
  const activeStep = STEPS.findIndex((s) => s.phase.includes(p.phase))
  const genRunning = p.genState === 'running' || p.genState === 'cooldown'

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <Panel
        title="Single-Line Diagram — Utility / Generator / ATS"
        icon={<Zap className="size-5" aria-hidden />}
        right={
          <div className="flex flex-wrap gap-2">
            <Btn tone="alarm" onClick={() => send({ type: 'gridLoss' })} disabled={p.phase !== 'normal'}>
              <PlugZap className="size-4" aria-hidden />
              Simulate Grid Power Loss
            </Btn>
            <Btn tone="ok" onClick={() => send({ type: 'gridRestore' })} disabled={p.gridOk}>
              <PowerIcon className="size-4" aria-hidden />
              Restore Grid
            </Btn>
          </div>
        }
      >
        <Diagram label="Power flows from utility or generator through the ATS to the main busbar and loads">
          <SingleLine p={p} live={live} loads={loads} />
        </Diagram>
        <ol className="mt-4 grid gap-2 md:grid-cols-5" aria-label="Transfer sequence">
          {STEPS.map((s, i) => {
            const state = activeStep === -1 ? 'idle' : i < activeStep ? 'done' : i === activeStep ? 'active' : 'idle'
            return (
              <li
                key={s.label}
                className={`rounded-lg border px-3 py-2 text-base font-semibold ${
                  state === 'active'
                    ? 'border-amber-400 bg-amber-100 text-amber-900'
                    : state === 'done'
                      ? 'border-green-300 bg-green-100 text-green-800'
                      : 'border-slate-300 bg-slate-100 text-slate-500'
                }`}
              >
                <span className="mr-1 tabular-nums">{i + 1}.</span>
                {s.label}
              </li>
            )
          })}
        </ol>
      </Panel>

      <div className="flex flex-col gap-4">
        <Panel title="Utility / Bus Metering" icon={<Gauge className="size-5" aria-hidden />} right={<Pill tone={p.gridOk ? 'ok' : 'alarm'} blink={!p.gridOk}>{p.gridOk ? 'GRID OK' : 'GRID FAIL'}</Pill>}>
          <div className="grid grid-cols-3 gap-2">
            {['L1-N', 'L2-N', 'L3-N'].map((l, i) => (
              <Stat key={l} label={l} value={p.gridV[i].toFixed(1)} unit="V" tone={p.gridOk ? 'neutral' : 'alarm'} />
            ))}
            {['I L1', 'I L2', 'I L3'].map((l, i) => (
              <Stat key={l} label={l} value={p.amps[i]} unit="A" />
            ))}
            <Stat label="Frequency" value={p.freq.toFixed(2)} unit="Hz" />
            <Stat label="Power Factor" value={live ? p.pf.toFixed(2) : '—'} />
            <Stat label="Active Power" value={p.kw} unit="kW" tone="info" />
          </div>
        </Panel>

        <Panel title="GEN-01 Engine" icon={<Fuel className="size-5" aria-hidden />} right={<Pill tone={genRunning ? 'ok' : p.genState === 'cranking' ? 'warn' : 'neutral'}>{p.genState}</Pill>}>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold text-slate-700">Fuel level</span>
                <span className="text-2xl font-bold tabular-nums">{p.fuel.toFixed(1)}%</span>
              </div>
              <Bar value={p.fuel} tone={p.fuel < 25 ? 'alarm' : 'ok'} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Gen Voltage L1" value={p.genV[0].toFixed(0)} unit="V" />
              <Stat label="Gen Frequency" value={p.genFreq.toFixed(1)} unit="Hz" />
              <Stat label="Engine Speed" value={p.rpm} unit="RPM" />
              <Stat label="Oil Pressure" value={p.oilPressure.toFixed(1)} unit="bar" />
              <Stat label="Coolant Temp" value={p.coolant.toFixed(0)} unit="°C" tone={p.coolant > 95 ? 'alarm' : 'neutral'} />
              <Stat label="Battery" value={p.battery.toFixed(1)} unit="VDC" tone={p.battery < 22 ? 'warn' : 'ok'} />
              <Stat label="Running Hours" value={p.runHours.toFixed(2)} unit="h" />
              <Stat label="Mode" value="AUTO" tone="ok" />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
