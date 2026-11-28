import type { Ahu, Pau } from '@/lib/bms/types'
import { COLORS, Damper, Fan, Pipe, Sensor, Valve } from '../svg'

function Duct({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} fill="#e2e8f0" stroke="#475569" strokeWidth={3} />
}

function Coil({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  let d = `M${x + 8} ${y + 8}`
  const rows = 6
  for (let i = 0; i < rows; i++) {
    const yy = y + 8 + (i * (h - 16)) / (rows - 1)
    d += i === 0 ? '' : ` V${yy}`
    d += ` H${i % 2 === 0 ? x + w - 8 : x + 8}`
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#cffafe" stroke="#0e7490" strokeWidth={2.5} rx={3} />
      <path d={d} stroke="#0891b2" strokeWidth={3} fill="none" />
    </g>
  )
}

function Filter({ x, y, h, bag = false }: { x: number; y: number; h: number; bag?: boolean }) {
  const n = bag ? 4 : 7
  let d = `M${x} ${y}`
  for (let i = 0; i < n; i++) {
    const step = h / n
    d += bag ? ` L${x + 36} ${y + step * (i + 0.5)} L${x} ${y + step * (i + 1)}` : ` L${x + 14} ${y + step * (i + 0.5)} L${x} ${y + step * (i + 1)}`
  }
  return (
    <g>
      <rect x={x - 3} y={y} width={bag ? 42 : 20} height={h} fill="#fef9c3" stroke="#854d0e" strokeWidth={2} />
      <path d={d} stroke="#a16207" strokeWidth={2} fill="none" />
    </g>
  )
}

const co2Tone = (v: number) => (v > 1000 ? 'alarm' : v > 850 ? 'warn' : 'ok')

export function AhuDiagram({ a, oat, oarh, chws }: { a: Ahu; oat: number; oarh: number; chws: number }) {
  const on = a.on
  const sp = a.hz / 50
  const supplyFlow = on && a.fsd > 5
  const chwFlow = on && a.valve > 2 && chws < 12
  return (
    <svg viewBox="0 0 1200 440" className="h-auto w-full" role="img" aria-label={`${a.id} air handling unit cross-section`}>
      <Duct x={30} y={40} w={1090} h={70} />
      <Duct x={30} y={225} w={1090} h={100} />
      <rect x={180} y={108} width={72} height={120} fill="#e2e8f0" stroke="#475569" strokeWidth={3} />
      <rect x={183} y={105} width={66} height={8} fill="#e2e8f0" />
      <rect x={183} y={220} width={66} height={10} fill="#e2e8f0" />

      <Pipe d="M1110 75 H40" color={COLORS.ra} active={on} width={10} air speed={sp} />
      <Pipe d="M216 75 V275" color={COLORS.ra} active={on && a.ra > 3} width={10} air speed={sp} />
      <Pipe d="M40 275 H216" color={COLORS.oa} active={on && a.fa > 3} width={10} air speed={sp} />
      <Pipe d="M216 275 H440" color={COLORS.mix} active={on} width={10} air speed={sp} />
      <Pipe d="M500 275 H1110" color={COLORS.sa} active={supplyFlow} width={10} air speed={sp} />

      <text x={40} y={32} fontSize={14} fontWeight={700} fill="#334155">
        ← EXHAUST AIR
      </text>
      <text x={1110} y={32} textAnchor="end" fontSize={14} fontWeight={700} fill="#334155">
        RETURN AIR FROM ZONE ←
      </text>
      <text x={40} y={218} fontSize={14} fontWeight={700} fill={COLORS.oa}>
        OUTDOOR AIR →
      </text>
      <text x={1110} y={218} textAnchor="end" fontSize={14} fontWeight={700} fill={COLORS.sa}>
        SUPPLY AIR TO {a.name.toUpperCase()} →
      </text>

      {/* Dampers */}
      <Damper x={100} y={235} w={30} h={80} pct={a.fa} />
      <text x={115} y={343} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0f172a">
        {`FA ${Math.round(a.fa)}%`}
      </text>
      <Damper x={186} y={150} w={60} h={30} pct={a.ra} airflow="vertical" blades={3} />
      <text x={172} y={160} textAnchor="end" fontSize={14} fontWeight={800} fill="#0f172a">
        {`RA ${Math.round(a.ra)}%`}
      </text>
      <text x={172} y={178} textAnchor="end" fontSize={12} fill="#475569">
        CO₂ modulated
      </text>

      {/* Filters */}
      <Filter x={290} y={230} h={90} />
      <Filter x={338} y={230} h={90} bag />
      <text x={300} y={343} textAnchor="middle" fontSize={12} fontWeight={600} fill="#475569">
        PRE
      </text>
      <text x={360} y={343} textAnchor="middle" fontSize={12} fontWeight={600} fill="#475569">
        BAG
      </text>
      <Sensor
        x={336}
        y={168}
        label="FILTER ΔP"
        value={`${a.filterDp} Pa`}
        tone={a.filterDp > 250 ? 'alarm' : a.filterDp > 200 ? 'warn' : 'ok'}
        lead={[336, 225]}
      />

      {/* Coil + valve */}
      <Coil x={440} y={232} w={60} h={86} />
      <Pipe d="M455 430 V320" color={COLORS.chws} active={chwFlow} width={9} />
      <Pipe d="M485 320 V430" color={COLORS.chwr} active={chwFlow} width={9} />
      <Valve x={485} y={382} pct={a.valve} vertical label="CHW 2-WAY" />
      <text x={470} y={218} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0e7490">
        COOLING COIL
      </text>

      {/* Fan */}
      <Fan x={640} y={275} r={44} hz={a.hz} on={on} />
      <Sensor x={702} y={378} label="SUPPLY FAN VFD" value={`${a.hz.toFixed(1)} Hz • ${a.cmh.toLocaleString('en-US')} CMH`} tone={on ? 'ok' : 'neutral'} lead={[640, 322]} />

      {/* Fire smoke damper */}
      <Damper x={790} y={235} w={30} h={80} pct={a.fsd} />
      <text x={805} y={218} textAnchor="middle" fontSize={13} fontWeight={800} fill={a.fsd < 50 ? '#dc2626' : '#15803d'}>
        {`FSD ${a.fsd < 50 ? 'CLOSED' : 'OPEN'}`}
      </text>

      <Sensor x={70} y={384} label="OUTDOOR" value={`${oat.toFixed(1)}°C ${Math.round(oarh)}%`} lead={[70, 325]} />
      <Sensor x={930} y={378} label="SUPPLY AIR T / RH" value={`${a.sat.toFixed(1)}°C ${Math.round(a.sarh)}%`} tone="cold" lead={[930, 325]} />
      <Sensor x={1068} y={378} label="DUCT STATIC" value={`${a.staticPa} Pa`} tone={on ? 'ok' : 'neutral'} lead={[1068, 325]} />
      <Sensor x={880} y={160} label="RETURN AIR T / RH" value={`${a.rat.toFixed(1)}°C ${Math.round(a.rarh)}%`} lead={[880, 110]} />
      <Sensor x={1050} y={160} label="ZONE CO₂" value={`${a.co2} ppm`} tone={co2Tone(a.co2)} lead={[1050, 110]} />
      <Sensor x={560} y={160} label="SA SETPOINT" value={`${a.sp.toFixed(1)} °C`} tone="cold" />
    </svg>
  )
}

export function PauDiagram({ p, oat, oarh, chws }: { p: Pau; oat: number; oarh: number; chws: number }) {
  const on = p.on
  const sp = p.hz / 50
  const chwFlow = on && p.valve > 2 && chws < 12
  return (
    <svg viewBox="0 0 1200 380" className="h-auto w-full" role="img" aria-label="PAU-01 primary air unit with heat recovery wheel">
      <Duct x={30} y={40} w={1090} h={70} />
      <Duct x={30} y={170} w={1090} h={90} />

      <Pipe d="M1110 75 H40" color={COLORS.ra} active={on} width={10} air speed={sp} />
      <Pipe d="M40 215 H540" color={COLORS.oa} active={on && p.fsd > 5} width={10} air speed={sp} />
      <Pipe d="M600 215 H1110" color={COLORS.sa} active={on && p.fsd > 5} width={10} air speed={sp} />

      <text x={40} y={32} fontSize={14} fontWeight={700} fill="#334155">
        ← EXHAUST TO OUTDOOR
      </text>
      <text x={1110} y={32} textAnchor="end" fontSize={14} fontWeight={700} fill="#334155">
        BUILDING EXHAUST (24.5°C) ←
      </text>
      <text x={40} y={162} fontSize={14} fontWeight={700} fill={COLORS.oa}>
        OUTDOOR AIR INTAKE →
      </text>
      <text x={1110} y={162} textAnchor="end" fontSize={14} fontWeight={700} fill={COLORS.sa}>
        TREATED FRESH AIR → AHU / CORRIDORS
      </text>

      <Filter x={170} y={175} h={80} />

      {/* Heat recovery wheel */}
      <rect x={330} y={36} width={80} height={228} rx={8} fill="#f1f5f9" stroke="#334155" strokeWidth={3} />
      <g transform="translate(370 150)">
        <g className={on && p.wheel > 1 ? 'bms-spin' : undefined} style={on ? { animationDuration: '2.4s' } : undefined}>
          <circle r={64} fill="#fde68a" stroke="#92400e" strokeWidth={3} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={0} y1={0} x2={0} y2={-64} stroke="#92400e" strokeWidth={2} transform={`rotate(${i * 30})`} />
          ))}
          <circle r={12} fill="#334155" />
        </g>
      </g>
      <text x={370} y={290} textAnchor="middle" fontSize={14} fontWeight={800} fill="#0f172a">
        HEAT RECOVERY WHEEL
      </text>
      <text x={370} y={310} textAnchor="middle" fontSize={14} fontWeight={700} fill={on ? '#15803d' : '#64748b'}>
        {on ? `${p.wheel.toFixed(0)} RPM • 62% eff.` : 'STOPPED'}
      </text>

      <Coil x={540} y={176} w={60} h={78} />
      <Pipe d="M555 375 V260" color={COLORS.chws} active={chwFlow} width={9} />
      <Pipe d="M585 260 V375" color={COLORS.chwr} active={chwFlow} width={9} />
      <Valve x={585} y={322} pct={p.valve} vertical label="PRE-COOL VALVE" />

      <Fan x={790} y={215} r={38} hz={p.hz} on={on} />
      <text x={790} y={288} textAnchor="middle" fontSize={15} fontWeight={800} fill={on ? '#15803d' : '#64748b'}>
        {on ? `${p.hz.toFixed(1)} Hz • ${p.cmh.toLocaleString('en-US')} CMH` : 'FAN OFF'}
      </text>

      <Damper x={900} y={180} w={28} h={70} pct={p.fsd} />

      <Sensor x={120} y={330} label="OUTDOOR AIR" value={`${oat.toFixed(1)}°C ${Math.round(oarh)}%`} tone="hot" lead={[120, 260]} />
      <Sensor x={470} y={355} label="AFTER WHEEL" value={`${p.wheelOut.toFixed(1)} °C`} lead={[470, 260]} />
      <Sensor x={1020} y={320} label="TREATED FRESH AIR" value={`${p.sat.toFixed(1)}°C ${Math.round(p.sarh)}%`} tone="cold" lead={[1020, 260]} />
    </svg>
  )
}
