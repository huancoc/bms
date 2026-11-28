'use client'

import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { createInitialState } from './initial'
import { busLive, reducer } from './reducer'
import type { Action, BmsState, LogLevel, StampedAction } from './types'

interface BmsContextValue {
  state: BmsState
  send: (action: Action) => void
}

const BmsContext = createContext<BmsContextValue | null>(null)

export function BmsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  const send = useCallback((action: Action) => dispatch({ ...action, now: Date.now() } as StampedAction), [])

  useEffect(() => {
    send({ type: 'boot' })
    const id = setInterval(() => send({ type: 'tick' }), 1000)
    return () => clearInterval(id)
  }, [send])

  return <BmsContext.Provider value={{ state, send }}>{children}</BmsContext.Provider>
}

export function useBms() {
  const ctx = useContext(BmsContext)
  if (!ctx) throw new Error('useBms must be used inside BmsProvider')
  return ctx
}

export interface ActiveAlarm {
  source: string
  msg: string
  level: Exclude<LogLevel, 'info' | 'ok'>
}

export function getAlarms(s: BmsState): ActiveAlarm[] {
  const list: ActiveAlarm[] = []
  if (s.fire.active) list.push({ source: 'FACP', msg: 'Fire alarm active — Floor 2 West Wing', level: 'alarm' })
  if (!s.power.gridOk) list.push({ source: 'POWER', msg: 'Utility grid failure', level: 'alarm' })
  if (!busLive(s)) list.push({ source: 'POWER', msg: 'Main busbar de-energized', level: 'alarm' })
  s.chiller.chwp.forEach((p) => p.tripped && list.push({ source: p.id, msg: 'VFD fault trip', level: 'alarm' }))
  if (s.chiller.chws > s.chiller.setpoint + 1.5)
    list.push({ source: 'CHILLER', msg: `CHWS high ${s.chiller.chws.toFixed(1)} °C`, level: 'warn' })
  s.ahus.forEach((a) => a.filterAlarm && list.push({ source: a.id, msg: `Filter ΔP ${a.filterDp} Pa`, level: 'warn' }))
  if (s.water.fireLowAlarm) list.push({ source: 'FIRE TANK', msg: 'Fire water tank low level', level: 'alarm' })
  if (s.water.ug <= 20) list.push({ source: 'WATER', msg: 'Underground tank low', level: 'warn' })
  if (s.water.roof <= 15) list.push({ source: 'WATER', msg: 'Roof tank low-low', level: 'warn' })
  return list
}
