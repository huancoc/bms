export const COLORS = {
  chws: '#0891b2',
  chwr: '#2563eb',
  cws: '#ea580c',
  cwr: '#dc2626',
  oa: '#16a34a',
  ra: '#64748b',
  mix: '#0ea5e9',
  sa: '#0284c7',
  power: '#16a34a',
  water: '#0284c7',
  dead: '#94a3b8',
}

export const valveColor = (pct: number) => (pct <= 2 ? '#dc2626' : pct >= 98 ? '#16a34a' : '#d97706')

const TONE_STROKE = {
  neutral: '#64748b',
  ok: '#16a34a',
  warn: '#d97706',
  alarm: '#dc2626',
  cold: '#0891b2',
  hot: '#ea580c',
}
export type SensorTone = keyof typeof TONE_STROKE

export function Pipe({
  d,
  color,
  active,
  width = 12,
  speed = 1,
  gap = false,
  air = false,
}: {
  d: string
  color: string
  active: boolean
  width?: number
  speed?: number
  gap?: boolean
  air?: boolean
}) {
  return (
    <g>
      {gap && <path d={d} stroke="#f8fafc" strokeWidth={width + 10} fill="none" />}
      <path
        d={d}
        stroke={active ? color : '#94a3b8'}
        strokeOpacity={active ? 0.3 : 0.35}
        strokeWidth={width}
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d={d}
        stroke={active ? color : '#94a3b8'}
        strokeWidth={Math.max(3, width - 6)}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={active ? 1 : 0.55}
        className={active ? (air ? 'bms-flow-air' : 'bms-flow') : undefined}
        style={active ? { animationDuration: `${((air ? 1.1 : 0.9) / Math.max(0.25, speed)).toFixed(2)}s` } : undefined}
      />
    </g>
  )
}

export function spinDuration(hz: number) {
  return Math.max(0.12, Math.round((18 / Math.max(hz, 1)) * 10) / 10)
}

export function Fan({ x, y, r, hz, on }: { x: number; y: number; r: number; hz: number; on: boolean }) {
  const spinning = on && hz > 1
  const blade = `M0 0 C ${r * 0.3} ${-r * 0.15}, ${r * 0.4} ${-r * 0.7}, 0 ${-r * 0.86} C ${-r * 0.32} ${-r * 0.62}, ${-r * 0.22} ${-r * 0.22}, 0 0 Z`
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#f1f5f9" stroke={spinning ? '#16a34a' : '#475569'} strokeWidth={3} />
      <g className={spinning ? 'bms-spin' : undefined} style={spinning ? { animationDuration: `${spinDuration(hz)}s` } : undefined}>
        <circle r={r * 0.9} fill="transparent" />
        {[0, 90, 180, 270].map((a) => (
          <path key={a} d={blade} transform={`rotate(${a})`} fill={spinning ? '#0284c7' : '#94a3b8'} />
        ))}
        <circle r={r * 0.16} fill="#334155" />
      </g>
    </g>
  )
}

export function Pump({
  x,
  y,
  on,
  tripped = false,
  label,
  hz,
  side = 'right',
  r = 22,
}: {
  x: number
  y: number
  on: boolean
  tripped?: boolean
  label: string
  hz?: number
  side?: 'left' | 'right'
  r?: number
}) {
  const stroke = tripped ? '#dc2626' : on ? '#16a34a' : '#475569'
  const fill = tripped ? '#fee2e2' : on ? '#dcfce7' : '#f1f5f9'
  const tx = side === 'right' ? x + r + 10 : x - r - 10
  const anchor = side === 'right' ? 'start' : 'end'
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={3} className={tripped ? 'bms-blink' : undefined} />
      <g transform={`translate(${x} ${y})`}>
        <g className={on ? 'bms-spin' : undefined} style={on && hz ? { animationDuration: `${spinDuration(hz) * 0.8}s` } : undefined}>
          <circle r={r * 0.7} fill="transparent" />
          <path d={`M0 ${-r * 0.6} L${r * 0.52} ${r * 0.3} L${-r * 0.52} ${r * 0.3} Z`} fill={stroke} />
        </g>
      </g>
      <text x={tx} y={y - 4} textAnchor={anchor} fontSize={15} fontWeight={700} fill="#0f172a">
        {label}
      </text>
      <text x={tx} y={y + 15} textAnchor={anchor} fontSize={14} fontWeight={600} fill={tripped ? '#dc2626' : on ? '#15803d' : '#64748b'}>
        {tripped ? 'TRIP' : on ? `${hz?.toFixed(1) ?? ''} Hz` : 'OFF'}
      </text>
    </g>
  )
}

export function Valve({
  x,
  y,
  pct,
  vertical = false,
  label,
  size = 13,
  labelSide = 'right',
}: {
  x: number
  y: number
  pct: number
  vertical?: boolean
  label?: string
  size?: number
  labelSide?: 'right' | 'left' | 'below'
}) {
  const c = valveColor(pct)
  const h = size * 0.75
  const lx = labelSide === 'right' ? x + size + 12 : labelSide === 'left' ? x - size - 12 : x
  const ly = labelSide === 'below' ? y + size + 22 : y
  const anchor = labelSide === 'right' ? 'start' : labelSide === 'left' ? 'end' : 'middle'
  return (
    <g>
      <g transform={`translate(${x} ${y}) rotate(${vertical ? -90 : 0})`}>
        <line x1={0} y1={0} x2={0} y2={-size * 1.3} stroke="#334155" strokeWidth={2.5} />
        <rect x={-size * 0.55} y={-size * 1.75} width={size * 1.1} height={size * 0.6} rx={2} fill="#334155" />
        <path d={`M${-size} ${-h} L${size} ${h} L${size} ${-h} L${-size} ${h} Z`} fill={c} stroke="#0f172a" strokeWidth={1.5} />
      </g>
      {label && (
        <g>
          <text x={lx} y={ly - 2} textAnchor={anchor} fontSize={13} fontWeight={600} fill="#334155">
            {label}
          </text>
          <text x={lx} y={ly + 16} textAnchor={anchor} fontSize={16} fontWeight={800} fill={c}>
            {Math.round(pct)}%
          </text>
        </g>
      )}
    </g>
  )
}

export function Damper({
  x,
  y,
  w,
  h,
  pct,
  airflow = 'horizontal',
  blades = 4,
}: {
  x: number
  y: number
  w: number
  h: number
  pct: number
  airflow?: 'horizontal' | 'vertical'
  blades?: number
}) {
  const c = valveColor(pct)
  const closedAngle = 90 - (pct / 100) * 90
  const items = Array.from({ length: blades }, (_, i) => i)
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#f8fafc" fillOpacity={0.6} stroke="#334155" strokeWidth={2.5} rx={3} />
      {items.map((i) => {
        if (airflow === 'horizontal') {
          const spacing = h / blades
          const len = spacing * 1.05
          const cy = y + spacing * (i + 0.5)
          const cx = x + w / 2
          return (
            <rect
              key={i}
              x={cx - len / 2}
              y={cy - 2}
              width={len}
              height={4}
              rx={1}
              fill={c}
              className="bms-rot"
              style={{ transform: `rotate(${closedAngle}deg)` }}
            />
          )
        }
        const spacing = w / blades
        const len = spacing * 1.05
        const cx = x + spacing * (i + 0.5)
        const cy = y + h / 2
        return (
          <rect
            key={i}
            x={cx - 2}
            y={cy - len / 2}
            width={4}
            height={len}
            rx={1}
            fill={c}
            className="bms-rot"
            style={{ transform: `rotate(${closedAngle}deg)` }}
          />
        )
      })}
    </g>
  )
}

export function Sensor({
  x,
  y,
  label,
  value,
  tone = 'neutral',
  lead,
}: {
  x: number
  y: number
  label: string
  value: string
  tone?: SensorTone
  lead?: [number, number]
}) {
  const w = Math.max(label.length * 7.4, value.length * 10.2) + 22
  const h = 48
  const stroke = TONE_STROKE[tone]
  return (
    <g>
      {lead && (
        <g>
          <line x1={lead[0]} y1={lead[1]} x2={x} y2={y} stroke="#475569" strokeWidth={1.5} strokeDasharray="4 3" />
          <circle cx={lead[0]} cy={lead[1]} r={4.5} fill="#0f172a" stroke="#f8fafc" strokeWidth={1.5} />
        </g>
      )}
      <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
        <rect width={w} height={h} rx={8} fill="#f8fafc" stroke={stroke} strokeWidth={2.5} />
        <text x={w / 2} y={18} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="#475569">
          {label}
        </text>
        <text x={w / 2} y={39} textAnchor="middle" fontSize={17} fontWeight={800} fill="#0f172a" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </text>
      </g>
    </g>
  )
}

export function Tank({
  x,
  y,
  w,
  h,
  level,
  id,
  color = '#38bdf8',
  highSw,
  lowSw,
}: {
  x: number
  y: number
  w: number
  h: number
  level: number
  id: string
  color?: string
  highSw?: { at: number; label: string }
  lowSw?: { at: number; label: string }
}) {
  const wy = y + h * (1 - level / 100)
  let wave = `M${x - 80} ${wy}`
  const count = Math.ceil((w + 160) / 80)
  for (let i = 0; i < count; i++) wave += ' q 20 -7 40 0 q 20 7 40 0'
  wave += ` V${y + h} H${x - 80} Z`
  const sw = [highSw, lowSw].filter(Boolean) as { at: number; label: string }[]
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={w} height={h} rx={10} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#f1f5f9" />
      <g clipPath={`url(#${id})`}>
        <g className="bms-wave">
          <path d={wave} fill={color} fillOpacity={0.75} />
        </g>
      </g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke="#334155" strokeWidth={3} />
      {sw.map((s) => {
        const sy = y + h * (1 - s.at / 100)
        const wet = level >= s.at
        return (
          <g key={s.label}>
            <line x1={x + w - 4} y1={sy} x2={x + w + 18} y2={sy} stroke="#334155" strokeWidth={2} />
            <circle cx={x + w - 14} cy={sy} r={7} fill={wet ? '#16a34a' : '#cbd5e1'} stroke="#334155" strokeWidth={1.5} />
            <text x={x + w + 22} y={sy + 5} fontSize={13} fontWeight={600} fill="#334155">
              {s.label} {wet ? '●' : '○'}
            </text>
          </g>
        )
      })}
    </g>
  )
}
