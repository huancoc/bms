import type { ChillerPlant } from '@/lib/bms/types'
import { COLORS, Fan, Pipe, Pump, Sensor, Valve } from './svg'

const X = [260, 560]
const P = [100, 220]

export function ChillerDiagram({ c, load }: { c: ChillerPlant; load: number }) {
  const anyPump = c.chwp.some((p) => p.on)
  const anyChiller = c.chillers.some((ch) => ch.on)
  const flowing = anyPump && anyChiller
  const speed = anyPump ? Math.max(...c.chwp.map((p) => p.hz)) / 50 : 1

  return (
    <svg viewBox="0 0 1200 690" className="h-auto w-full" role="img" aria-label="Chiller plant piping and instrumentation diagram">
      {/* Legend */}
      <g transform="translate(860 24)">
        <rect width={320} height={196} rx={10} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={2} />
        <text x={16} y={28} fontSize={15} fontWeight={700} fill="#0f172a">
          LEGEND
        </text>
        {[
          { c: COLORS.chws, t: `Chilled Water Supply ${c.chws.toFixed(1)}°C` },
          { c: COLORS.chwr, t: `Chilled Water Return ${c.chwr.toFixed(1)}°C` },
          { c: COLORS.cws, t: `Condenser Supply ${c.cws.toFixed(1)}°C` },
          { c: COLORS.cwr, t: `Condenser Return ${c.cwr.toFixed(1)}°C` },
        ].map((l, i) => (
          <g key={l.t} transform={`translate(16 ${50 + i * 30})`}>
            <line x1={0} y1={0} x2={36} y2={0} stroke={l.c} strokeWidth={7} strokeLinecap="round" />
            <text x={48} y={5} fontSize={14} fontWeight={600} fill="#334155">
              {l.t}
            </text>
          </g>
        ))}
        <text x={16} y={180} fontSize={14} fontWeight={700} fill="#0f172a">
          {`Plant ${c.kw} kW • ${c.kwPerTon.toFixed(2)} kW/TR • ${c.tons} TR`}
        </text>
      </g>

      {/* Chilled water return header → pump station */}
      <Pipe d={`M1020 620 H${P[1]}`} color={COLORS.chwr} active={flowing} speed={speed} />
      <Pipe d={`M${P[1]} 620 H${P[0]}`} color={COLORS.chwr} active={c.chwp[0].on} speed={speed} />
      <Pipe d={`M${P[0]} 620 V440`} color={COLORS.chwr} active={c.chwp[0].on} speed={speed} />
      <Pipe d={`M${P[1]} 620 V440`} color={COLORS.chwr} active={c.chwp[1].on} speed={speed} />
      <Pipe d={`M${P[0]} 440 H${P[1]}`} color={COLORS.chwr} active={c.chwp[0].on} speed={speed} />
      <Pipe d={`M${P[1]} 440 H${X[1] + 50}`} color={COLORS.chwr} active={flowing} speed={speed} />
      <text x={(P[0] + P[1]) / 2} y={430} textAnchor="middle" fontSize={13} fontWeight={600} fill="#334155">
        PRIMARY CHW PUMPS
      </text>
      <text x={620} y={648} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.chwr}>
        CHILLED WATER RETURN HEADER ←
      </text>

      {/* Supply header */}
      <Pipe d={`M${X[0] + 150} 520 H${X[1] + 150}`} color={COLORS.chws} active={c.chillers[0].on && anyPump} speed={speed} />
      <Pipe d={`M${X[1] + 150} 520 H1020`} color={COLORS.chws} active={flowing} speed={speed} />
      <text x={560} y={546} textAnchor="middle" fontSize={13} fontWeight={700} fill={COLORS.chws}>
        CHILLED WATER SUPPLY HEADER →
      </text>

      {/* Bypass */}
      <Pipe d="M900 520 V620" color={COLORS.chws} active={flowing && c.bypass > 2} speed={0.6} width={9} />
      <Valve x={900} y={570} pct={c.bypass} vertical label="BYPASS BV-01" />
      <Sensor x={808} y={590} label="DIFF. PRESSURE" value={`${c.dp.toFixed(1)} kPa`} tone={c.dp > 0 ? 'ok' : 'neutral'} lead={[900, 600]} />

      {/* Load */}
      <g>
        <rect x={1020} y={486} width={165} height={170} rx={10} fill="#f8fafc" stroke="#334155" strokeWidth={3} />
        <text x={1102} y={516} textAnchor="middle" fontSize={15} fontWeight={700} fill="#0f172a">
          BUILDING LOAD
        </text>
        <text x={1102} y={537} textAnchor="middle" fontSize={13} fill="#475569">
          AHU • PAU • FCU
        </text>
        <text x={1102} y={580} textAnchor="middle" fontSize={34} fontWeight={800} fill="#0f172a" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(load * 100)}%
        </text>
        <text x={1102} y={606} textAnchor="middle" fontSize={15} fontWeight={600} fill="#334155">
          {`${c.tons} TR`}
        </text>
        <text x={1102} y={632} textAnchor="middle" fontSize={14} fontWeight={600} fill="#334155">
          {`${c.flow.toFixed(0)} L/s`}
        </text>
      </g>
      <Sensor x={960} y={470} label="CHWS TEMP" value={`${c.chws.toFixed(1)} °C`} tone="cold" lead={[960, 520]} />
      <Sensor x={960} y={662} label="CHWR TEMP" value={`${c.chwr.toFixed(1)} °C`} tone="cold" lead={[960, 620]} />

      {/* Pumps */}
      {c.chwp.map((p, i) => (
        <Pump key={p.id} x={P[i]} y={530} on={p.on} tripped={p.tripped} label={p.id} hz={p.hz} side={i === 0 ? 'left' : 'right'} />
      ))}

      {X.map((x, i) => {
        const ch = c.chillers[i]
        const t = c.towers[i]
        const cwp = c.cwp[i]
        const cw = cwp.on
        const cwSpeed = cwp.hz / 50
        const status = ch.on ? 'RUNNING' : ch.cmd ? 'LOW FLOW' : 'STANDBY'
        const statusColor = ch.on ? '#15803d' : ch.cmd ? '#dc2626' : '#64748b'
        return (
          <g key={ch.id}>
            {/* Condenser water */}
            <Pipe d={`M${x + 150} 270 V230 H${x + 190} V100 H${x + 168}`} color={COLORS.cwr} active={cw} speed={cwSpeed} />
            <Pipe d={`M${x + 50} 162 V270`} color={COLORS.cws} active={cw} speed={cwSpeed} />

            {/* Cooling tower */}
            <path d={`M${x + 30} 162 L${x + 46} 66 L${x + 154} 66 L${x + 170} 162 Z`} fill="#e2e8f0" stroke="#475569" strokeWidth={3} />
            {[90, 108, 126, 144].map((ly) => (
              <line key={ly} x1={x + 44} y1={ly} x2={x + 156} y2={ly} stroke="#94a3b8" strokeWidth={2} />
            ))}
            <rect x={x + 32} y={146} width={136} height={16} fill={cw ? '#7dd3fc' : '#cbd5e1'} opacity={0.8} />
            <Fan x={x + 100} y={48} r={30} hz={t.hz} on={t.on} />
            <text x={x + 100} y={116} textAnchor="middle" fontSize={16} fontWeight={800} fill="#0f172a">
              {t.id}
            </text>
            <text x={x + 100} y={138} textAnchor="middle" fontSize={14} fontWeight={700} fill={t.on ? '#15803d' : '#64748b'}>
              {t.on ? `FAN ${t.hz.toFixed(1)} Hz` : 'FAN OFF'}
            </text>
            <Pump x={x + 50} y={215} on={cwp.on} label={cwp.id} hz={cwp.hz} side="right" r={18} />

            {/* Chiller */}
            <rect x={x} y={270} width={200} height={60} fill="#ffedd5" />
            <rect x={x} y={330} width={200} height={60} fill="#cffafe" />
            <rect x={x} y={270} width={200} height={120} rx={6} fill="none" stroke={ch.on ? '#16a34a' : '#475569'} strokeWidth={ch.on ? 4 : 3} />
            <line x1={x} y1={330} x2={x + 200} y2={330} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" />
            <text x={x + 10} y={288} fontSize={11} fontWeight={700} fill="#9a3412">
              CONDENSER
            </text>
            <text x={x + 10} y={384} fontSize={11} fontWeight={700} fill="#155e75">
              EVAPORATOR
            </text>
            <text x={x + 100} y={312} textAnchor="middle" fontSize={20} fontWeight={800} fill="#0f172a">
              {ch.id}
            </text>
            <text x={x + 100} y={336} textAnchor="middle" fontSize={14} fontWeight={800} fill={statusColor}>
              {status}
            </text>
            <text x={x + 100} y={360} textAnchor="middle" fontSize={15} fontWeight={700} fill="#0f172a" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {ch.on ? `${Math.round(ch.plr * 100)}% • ${ch.kw} kW` : '— • 0 kW'}
            </text>

            {/* Chilled water risers */}
            <Pipe d={`M${x + 50} 440 V390`} color={COLORS.chwr} active={ch.on && anyPump} speed={speed} />
            <Pipe d={`M${x + 150} 390 V520`} color={COLORS.chws} active={ch.on && anyPump} speed={speed} gap={i === 0} />
            <Valve x={x + 150} y={478} pct={ch.valve} vertical label={`MV-0${i + 1}`} />
          </g>
        )
      })}

      <Sensor x={150} y={200} label="CWS TEMP" value={`${c.cws.toFixed(1)} °C`} tone="hot" lead={[X[0] + 50, 180]} />
      <Sensor x={520} y={170} label="CWR TEMP" value={`${c.cwr.toFixed(1)} °C`} tone="hot" lead={[X[0] + 190, 170]} />
    </svg>
  )
}
