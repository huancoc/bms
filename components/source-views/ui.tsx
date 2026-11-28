import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Tone = 'neutral' | 'ok' | 'warn' | 'alarm' | 'info'

const PILL: Record<Tone, string> = {
  neutral: 'bg-slate-200 text-slate-700 border-slate-300',
  ok: 'bg-green-100 text-green-800 border-green-300',
  warn: 'bg-amber-100 text-amber-800 border-amber-300',
  alarm: 'bg-red-100 text-red-800 border-red-300',
  info: 'bg-sky-100 text-sky-800 border-sky-300',
}

export function Panel({
  title,
  icon,
  right,
  children,
  className,
  bodyClassName,
}: {
  title: ReactNode
  icon?: ReactNode
  right?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('rounded-xl border border-slate-300 bg-slate-50 shadow-sm', className)}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 px-4 py-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          {icon && <span className="text-sky-700">{icon}</span>}
          {title}
        </h2>
        {right}
      </header>
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  )
}

export function Pill({ tone = 'neutral', children, blink }: { tone?: Tone; children: ReactNode; blink?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-bold uppercase tracking-wide',
        PILL[tone],
        blink && 'bms-blink',
      )}
    >
      {children}
    </span>
  )
}

export function Stat({
  label,
  value,
  unit,
  tone = 'neutral',
  hint,
}: {
  label: string
  value: ReactNode
  unit?: string
  tone?: Tone
  hint?: ReactNode
}) {
  const color = {
    neutral: 'text-slate-900',
    ok: 'text-green-700',
    warn: 'text-amber-700',
    alarm: 'text-red-700',
    info: 'text-sky-700',
  }[tone]
  return (
    <div className="rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-2">
      <div className="text-sm font-semibold text-slate-600">{label}</div>
      <div className={cn('text-2xl font-bold tabular-nums', color)}>
        {value}
        {unit && <span className="ml-1 text-base font-semibold text-slate-500">{unit}</span>}
      </div>
      {hint && <div className="text-sm text-slate-500">{hint}</div>}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-13 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-green-700 bg-green-600' : 'border-slate-400 bg-slate-300',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-slate-50 shadow transition-transform',
          checked ? 'translate-x-7' : 'translate-x-1',
        )}
      />
    </button>
  )
}

const BTN: Record<Tone, string> = {
  neutral: 'bg-slate-50 text-slate-800 border-slate-400 hover:bg-slate-200',
  ok: 'bg-green-600 text-white border-green-700 hover:bg-green-700',
  warn: 'bg-amber-500 text-slate-950 border-amber-600 hover:bg-amber-400',
  alarm: 'bg-red-600 text-white border-red-700 hover:bg-red-700',
  info: 'bg-sky-700 text-white border-sky-800 hover:bg-sky-800',
}

export function Btn({
  tone = 'neutral',
  onClick,
  disabled,
  children,
  className,
  active,
}: {
  tone?: Tone
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  className?: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:opacity-50',
        BTN[tone],
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
  disabled?: boolean
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-slate-400 bg-slate-200 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md px-3 py-1 text-base font-semibold transition-colors disabled:opacity-50',
            value === o.value ? 'bg-slate-800 text-slate-50 shadow' : 'text-slate-700 hover:bg-slate-300',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Bar({ value, tone = 'info' }: { value: number; tone?: Tone }) {
  const color = { neutral: 'bg-slate-500', ok: 'bg-green-600', warn: 'bg-amber-500', alarm: 'bg-red-600', info: 'bg-sky-600' }[tone]
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-300" aria-hidden>
      <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function Diagram({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="overflow-x-auto rounded-lg border border-slate-300 bg-[#eef2f7]">
      <div className="min-w-[760px]">{children}</div>
      <figcaption className="sr-only">{label}</figcaption>
    </figure>
  )
}
