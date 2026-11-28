'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ListChecks, Trash2 } from 'lucide-react'
import { useBms } from '@/lib/bms/context'
import type { LogEntry, LogLevel } from '@/lib/bms/types'
import { cn } from '@/lib/utils'

const TAG: Record<LogLevel, string> = {
  info: 'bg-sky-100 text-sky-800 border-sky-300',
  ok: 'bg-green-100 text-green-800 border-green-300',
  warn: 'bg-amber-100 text-amber-900 border-amber-300',
  alarm: 'bg-red-600 text-white border-red-700',
}
const TAG_LABEL: Record<LogLevel, string> = { info: 'INFO', ok: 'NORMAL', warn: 'WARNING', alarm: 'ALARM' }

const fmt = (t: number) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

function Row({ e }: { e: LogEntry }) {
  return (
    <li className="flex items-center gap-3 px-4 py-1.5">
      <time className="w-20 shrink-0 font-mono text-base font-semibold tabular-nums text-slate-700">{fmt(e.time)}</time>
      <span className={cn('w-24 shrink-0 rounded border px-1.5 py-0.5 text-center text-xs font-bold', TAG[e.level])}>{TAG_LABEL[e.level]}</span>
      <span className="w-28 shrink-0 truncate text-base font-bold text-slate-800">{e.source}</span>
      <span className="min-w-0 truncate text-base text-slate-700">{e.msg}</span>
    </li>
  )
}

export function EventLog() {
  const { state, send } = useBms()
  const [open, setOpen] = useState(false)
  const latest = state.log[0]

  return (
    <aside aria-label="Live event and alarm log" className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-slate-400 bg-slate-50 shadow-[0_-4px_16px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-3 px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="event-log-list"
          className="flex items-center gap-2 rounded-md px-2 py-1 text-base font-bold text-slate-800 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-sky-600"
        >
          <ListChecks className="size-5 text-sky-700" aria-hidden />
          Live Event &amp; Alarm Log
          <span className="rounded bg-slate-200 px-1.5 text-sm tabular-nums">{state.log.length}</span>
          {open ? <ChevronDown className="size-5" aria-hidden /> : <ChevronUp className="size-5" aria-hidden />}
        </button>
        {!open && latest && (
          <div className="hidden min-w-0 flex-1 md:block">
            <ul>
              <Row e={latest} />
            </ul>
          </div>
        )}
        {open && (
          <button
            type="button"
            onClick={() => send({ type: 'clearLog' })}
            className="ml-auto flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            <Trash2 className="size-4" aria-hidden />
            Clear
          </button>
        )}
      </div>
      {open && (
        <ul id="event-log-list" className="max-h-72 divide-y divide-slate-200 overflow-y-auto border-t border-slate-300 pb-2" aria-live="polite">
          {state.log.length === 0 && <li className="px-4 py-3 text-base text-slate-500">No events.</li>}
          {state.log.map((e) => (
            <Row key={e.id} e={e} />
          ))}
        </ul>
      )}
    </aside>
  )
}
