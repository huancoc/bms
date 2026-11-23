'use client'

import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  Check,
  ChevronRight,
  CircleHelp,
  CloudSun,
  Copy,
  Fan,
  Gauge,
  Layers3,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  SlidersHorizontal,
  Thermometer,
  X,
} from 'lucide-react'
import BmsDiagram, { type Equipment, type PageKey } from './bms-diagram'
import './bms-diagram.css'

const pages: { id: PageKey; label: string; short: string }[] = [
  { id: 'home', label: 'Tổng quan', short: 'HOME' },
  { id: 'chiller', label: 'Chiller', short: 'CHILLER' },
  { id: 'ahu', label: 'AHU', short: 'AHU' },
  { id: 'pau', label: 'PAU', short: 'PAU' },
  { id: 'fcu', label: 'FCU', short: 'FCU' },
  { id: 'help', label: 'Trợ giúp', short: 'HELP' },
]

const initialPoints: Equipment[] = [
  { id: 'CHILLER_01', label: 'Chiller 1', kind: 'chiller', x: 42.9, y: 54.5, width: 9.4, height: 11, on: true, mode: 'auto', setpoint: 7.0, runHours: 1428 },
  { id: 'CHILLER_02', label: 'Chiller 2', kind: 'chiller', x: 42.9, y: 84.8, width: 9.4, height: 11, on: false, mode: 'auto', setpoint: 7.0, runHours: 1196 },
  { id: 'CTWP_01', label: 'Bơm giải nhiệt CTWP-01', kind: 'pump', x: 17.3, y: 54.5, width: 9.4, height: 11, on: true, mode: 'auto', hz: 46.5, runHours: 2310 },
  { id: 'CTWP_02', label: 'Bơm giải nhiệt CTWP-02', kind: 'pump', x: 17.3, y: 84.8, width: 9.4, height: 11, on: false, mode: 'auto', hz: 0, runHours: 1984 },
  { id: 'CHWP_01', label: 'Bơm nước lạnh CHWP-01', kind: 'pump', x: 65.5, y: 54.5, width: 9.4, height: 11, on: true, mode: 'auto', hz: 45.0, runHours: 2415 },
  { id: 'CHWP_02', label: 'Bơm nước lạnh CHWP-02', kind: 'pump', x: 65.5, y: 84.8, width: 9.4, height: 11, on: false, mode: 'auto', hz: 0, runHours: 2050 },
  { id: 'CT_01_A', label: 'Tháp giải nhiệt CT-01A', kind: 'tower', x: 18.1, y: 22.0, width: 7.5, height: 11.5, on: true, mode: 'auto', hz: 42.0, runHours: 1840 },
  { id: 'CT_01_B', label: 'Tháp giải nhiệt CT-01B', kind: 'tower', x: 25.8, y: 22.0, width: 7.5, height: 11.5, on: true, mode: 'auto', hz: 42.0, runHours: 1812 },
  { id: 'CT_02_A', label: 'Tháp giải nhiệt CT-02A', kind: 'tower', x: 52.8, y: 22.0, width: 7.5, height: 11.5, on: false, mode: 'auto', hz: 0, runHours: 1520 },
  { id: 'CT_02_B', label: 'Tháp giải nhiệt CT-02B', kind: 'tower', x: 60.5, y: 22.0, width: 7.5, height: 11.5, on: false, mode: 'auto', hz: 0, runHours: 1495 },
  { id: 'SENS_CDWR', label: 'Nước giải nhiệt hồi', kind: 'sensor', x: 29.0, y: 36.0, width: 6.2, height: 3.2, on: true, value: '31.2', unit: '°C' },
  { id: 'SENS_CDWS', label: 'Nước giải nhiệt cấp', kind: 'sensor', x: 29.0, y: 41.0, width: 6.2, height: 3.2, on: true, value: '27.8', unit: '°C' },
  { id: 'SENS_CHWR', label: 'Nước lạnh hồi', kind: 'sensor', x: 77.0, y: 36.0, width: 6.2, height: 3.2, on: true, value: '12.4', unit: '°C' },
  { id: 'SENS_CHWS', label: 'Nước lạnh cấp', kind: 'sensor', x: 77.0, y: 41.0, width: 6.2, height: 3.2, on: true, value: '7.1', unit: '°C' },
  { id: 'SENS_DP', label: 'Chênh áp đường ống', kind: 'sensor', x: 77.0, y: 46.0, width: 7.4, height: 3.2, on: true, value: '1.45', unit: ' bar' },
  { id: 'FLOW_BYPASS_VSD', label: 'Bypass VSD', kind: 'flow', x: 55.0, y: 69.0, width: 5.8, height: 3.0, on: true, value: '32', unit: '%' },
  { id: 'FLOW_FS_OPEN', label: 'FS Mở', kind: 'flow', x: 12.0, y: 69.0, width: 5.6, height: 3.0, on: true, value: 'FS MỞ', unit: '' },
  { id: 'FLOW_FS_CLOSE', label: 'FS Đóng', kind: 'flow', x: 12.0, y: 73.5, width: 6.0, height: 3.0, on: false, value: 'FS ĐÓNG', unit: '' },
]

const initialAhuPoints: Equipment[] = [
  { id: 'AHU_LM', label: 'AHU-LM', kind: 'ahu', x: 8.5, y: 24.5, width: 9.2, height: 3.4, on: true, status: 'running', value: '22.0' },
  { id: 'AHU_01', label: 'AHU-01', kind: 'ahu', x: 8.5, y: 31.5, width: 9.2, height: 3.4, on: false, status: 'warning', value: '22.7' },
  { id: 'AHU_02', label: 'AHU-02', kind: 'ahu', x: 8.5, y: 38.5, width: 9.2, height: 3.4, on: true, status: 'running', value: '23.4' },
  { id: 'AHU_03', label: 'AHU-03', kind: 'ahu', x: 8.5, y: 45.5, width: 9.2, height: 3.4, on: true, status: 'running', value: '24.1' },
  { id: 'AHU_04', label: 'AHU-04', kind: 'ahu', x: 8.5, y: 52.5, width: 9.2, height: 3.4, on: true, status: 'running', value: '24.8' },
  { id: 'AHU_05', label: 'AHU-05', kind: 'ahu', x: 27.5, y: 24.5, width: 9.2, height: 3.4, on: false, status: 'warning', value: '22.0' },
  { id: 'AHU_06', label: 'AHU-06', kind: 'ahu', x: 27.5, y: 31.5, width: 9.2, height: 3.4, on: true, status: 'running', value: '22.7' },
  { id: 'AHU_07', label: 'AHU-07', kind: 'ahu', x: 27.5, y: 38.5, width: 9.2, height: 3.4, on: true, status: 'running', value: '23.4' },
  { id: 'AHU_08', label: 'AHU-08', kind: 'ahu', x: 27.5, y: 45.5, width: 9.2, height: 3.4, on: true, status: 'running', value: '24.1' },
  { id: 'AHU_09', label: 'AHU-09', kind: 'ahu', x: 27.5, y: 52.5, width: 9.2, height: 3.4, on: false, status: 'warning', value: '24.8' },
  { id: 'AHU_10', label: 'AHU-10', kind: 'ahu', x: 47.0, y: 24.5, width: 9.2, height: 3.4, on: true, status: 'running', value: '22.0' },
  { id: 'AHU_11', label: 'AHU-11', kind: 'ahu', x: 47.0, y: 31.5, width: 9.2, height: 3.4, on: true, status: 'running', value: '22.7' },
  { id: 'AHU_12', label: 'AHU-12', kind: 'ahu', x: 47.0, y: 38.5, width: 9.2, height: 3.4, on: true, status: 'running', value: '23.4' },
  { id: 'AHU_QC', label: 'AHU-QC', kind: 'ahu', x: 47.0, y: 45.5, width: 9.2, height: 3.4, on: false, status: 'warning', value: '24.1' },
  { id: 'AHU_RD', label: 'AHU-R&D', kind: 'ahu', x: 67.5, y: 24.5, width: 9.6, height: 3.4, on: true, status: 'running', value: '24.8' },
  { id: 'AHU_CX_1', label: 'AHU-CX-1', kind: 'ahu', x: 67.5, y: 31.5, width: 9.6, height: 3.4, on: true, status: 'running', value: '22.0' },
  { id: 'AHU_CX_2', label: 'AHU-CX-2', kind: 'ahu', x: 67.5, y: 38.5, width: 9.6, height: 3.4, on: true, status: 'running', value: '22.7' },
  { id: 'AHU_CX_3', label: 'AHU-CX-3', kind: 'ahu', x: 67.5, y: 45.5, width: 9.6, height: 3.4, on: false, status: 'warning', value: '23.4' },
  { id: 'AHU_CX_4', label: 'AHU-CX-4', kind: 'ahu', x: 67.5, y: 52.5, width: 9.6, height: 3.4, on: true, status: 'running', value: '24.1' },
]

const initialPauPoints: Equipment[] = [
  { id: 'PAU_SPAU_01', label: 'SPAU-01', kind: 'pau', iconType: 'spau', x: 1.5, y: 28.0, width: 8.5, height: 11.0, on: true },
  { id: 'PAU_RPAU_01', label: 'R-PAU-01', kind: 'pau', iconType: 'fan', x: 4.5, y: 16.5, width: 7.5, height: 10.0, on: true },
  { id: 'PAU_SPAU_02', label: 'SPAU-02', kind: 'pau', iconType: 'spau', x: 65.5, y: 26.5, width: 8.5, height: 11.0, on: true },
  { id: 'PAU_DHU_04', label: 'DHU-04', kind: 'pau', iconType: 'dhu', x: 78.5, y: 37.5, width: 5.8, height: 10.0, on: true },
  { id: 'PAU_DHU_05', label: 'DHU-05', kind: 'pau', iconType: 'dhu', x: 85.2, y: 37.5, width: 5.8, height: 10.0, on: true },
  { id: 'PAU_AHU_01', label: 'AHU-01', kind: 'pau', iconType: 'ahu', x: 6.0, y: 58.5, width: 7.8, height: 7.5, on: true },
  { id: 'PAU_AHU_02', label: 'AHU-02', kind: 'pau', iconType: 'ahu', x: 22.5, y: 58.5, width: 7.8, height: 7.5, on: true },
  { id: 'PAU_AHU_03', label: 'AHU-03', kind: 'pau', iconType: 'ahu', x: 39.0, y: 58.5, width: 7.8, height: 7.5, on: true },
  { id: 'PAU_AHU_06', label: 'AHU-06', kind: 'pau', iconType: 'ahu', x: 55.5, y: 58.5, width: 7.8, height: 7.5, on: true },
  { id: 'PAU_AHU_08', label: 'AHU-08', kind: 'pau', iconType: 'ahu', x: 72.0, y: 58.5, width: 7.8, height: 7.5, on: true },
  { id: 'PAU_AHU_07', label: 'AHU-07', kind: 'pau', iconType: 'ahu', x: 7.5, y: 76.5, width: 7.8, height: 7.5, on: true },
  { id: 'PAU_AHU_09', label: 'AHU-09', kind: 'pau', iconType: 'ahu', x: 23.5, y: 76.5, width: 7.8, height: 7.5, on: true },
  { id: 'PAU_AHU_10', label: 'AHU-10', kind: 'pau', iconType: 'ahu', x: 39.5, y: 76.5, width: 7.8, height: 7.5, on: true },
  { id: 'PAU_AHU_11', label: 'AHU-11', kind: 'pau', iconType: 'ahu', x: 55.5, y: 76.5, width: 7.8, height: 7.5, on: true },
  { id: 'PAU_AHU_12', label: 'AHU-12', kind: 'pau', iconType: 'ahu', x: 72.0, y: 76.5, width: 7.8, height: 7.5, on: true },
]

const initialFcuPoints: Equipment[] = [
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `FCU_${String(i + 1).padStart(2, '0')}`,
    label: `FCU-${String(i + 1).padStart(2, '0')}`,
    kind: 'fcu' as const,
    x: 9.7,
    y: Number((26.5 + i * 7.2).toFixed(1)),
    width: 11.2,
    height: 3.4,
    on: true,
    value: (22.5 + ((i * 7) % 25) / 10).toFixed(1),
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `FCU_${String(i + 5).padStart(2, '0')}`,
    label: `FCU-${String(i + 5).padStart(2, '0')}`,
    kind: 'fcu' as const,
    x: 36.7,
    y: Number((24.0 + i * 6.4).toFixed(1)),
    width: 11.2,
    height: 3.4,
    on: i !== 7,
    value: (22.5 + (((i + 4) * 7) % 25) / 10).toFixed(1),
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `FCU_${String(i + 15).padStart(2, '0')}`,
    label: `FCU-${String(i + 15).padStart(2, '0')}`,
    kind: 'fcu' as const,
    x: 57.1,
    y: Number((28.0 + i * 8.0).toFixed(1)),
    width: 11.2,
    height: 3.4,
    on: true,
    value: (22.5 + (((i + 14) * 7) % 25) / 10).toFixed(1),
  })),
]

const round1 = (n: number) => Math.round(n * 10) / 10

export default function BmsSimulator() {
  const [activePage, setActivePage] = useState<PageKey>('chiller')
  const [points, setPoints] = useState<Equipment[]>(initialPoints)
  const [ahuPoints, setAhuPoints] = useState<Equipment[]>(initialAhuPoints)
  const [pauPoints, setPauPoints] = useState<Equipment[]>(initialPauPoints)
  const [fcuPoints, setFcuPoints] = useState<Equipment[]>(initialFcuPoints)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedEditId, setSelectedEditId] = useState<string | null>(initialPoints[0]?.id ?? null)
  const [copiedJson, setCopiedJson] = useState(false)

  const [outdoorTemp, setOutdoorTemp] = useState(27.5)
  const [supplyTemp, setSupplyTemp] = useState(7.1)
  const [returnTemp, setReturnTemp] = useState(12.4)
  const [condenserSupplyTemp, setCondenserSupplyTemp] = useState(27.8)
  const [condenserReturnTemp, setCondenserReturnTemp] = useState(31.2)
  const [pressure, setPressure] = useState(1.45)
  const [diffPressureSP, setDiffPressureSP] = useState(1.5)
  const [bypassValvePct, setBypassValvePct] = useState(32)
  const [fcuSetpoint, setFcuSetpoint] = useState(23)
  const [fanSpeed, setFanSpeed] = useState('Tự động')
  const [unitStatus, setUnitStatus] = useState<Record<string, boolean>>({})
  const [faultedPoints, setFaultedPoints] = useState<string[]>([])

  const runningCount = points.filter((p) => p.on && p.kind === 'chiller').length

  const currentEditableList: Equipment[] =
    activePage === 'chiller'
      ? points
      : activePage === 'ahu'
        ? ahuPoints
        : activePage === 'pau'
          ? pauPoints
          : activePage === 'fcu'
            ? fcuPoints
            : []

  const updateActiveList = (updater: (prev: Equipment[]) => Equipment[]) => {
    if (activePage === 'chiller') setPoints(updater)
    else if (activePage === 'ahu') setAhuPoints(updater)
    else if (activePage === 'pau') setPauPoints(updater)
    else if (activePage === 'fcu') setFcuPoints(updater)
  }

  useEffect(() => {
    if (currentEditableList.length === 0) {
      setSelectedEditId(null)
      return
    }
    if (!selectedEditId || !currentEditableList.some((p) => p.id === selectedEditId)) {
      setSelectedEditId(currentEditableList[0].id)
    }
  }, [activePage, currentEditableList, selectedEditId])

  useEffect(() => {
    setPoints((current) =>
      current.map((point) => {
        if (point.id === 'SENS_CHWS') return { ...point, value: supplyTemp.toFixed(1) }
        if (point.id === 'SENS_CHWR') return { ...point, value: returnTemp.toFixed(1) }
        if (point.id === 'SENS_CDWS') return { ...point, value: condenserSupplyTemp.toFixed(1) }
        if (point.id === 'SENS_CDWR') return { ...point, value: condenserReturnTemp.toFixed(1) }
        if (point.id === 'SENS_DP') return { ...point, value: pressure.toFixed(2) }
        if (point.id === 'FLOW_BYPASS_VSD') return { ...point, value: String(Math.round(bypassValvePct)) }
        return point
      }),
    )
  }, [supplyTemp, returnTemp, condenserSupplyTemp, condenserReturnTemp, pressure, bypassValvePct])

  useEffect(() => {
    if (!editMode || !selectedEditId || currentEditableList.length === 0) return
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      const step = 0.1
      let dx = 0
      let dy = 0
      let dw = 0
      let dh = 0

      if (event.key === 'ArrowLeft') {
        if (event.shiftKey) dw = -step
        else dx = -step
      } else if (event.key === 'ArrowRight') {
        if (event.shiftKey) dw = step
        else dx = step
      } else if (event.key === 'ArrowUp') {
        if (event.shiftKey) dh = -step
        else dy = -step
      } else if (event.key === 'ArrowDown') {
        if (event.shiftKey) dh = step
        else dy = step
      } else {
        return
      }

      event.preventDefault()
      updateActiveList((current) =>
        current.map((point) => {
          if (point.id !== selectedEditId) return point
          const nextWidth = round1(Math.min(100, Math.max(0.5, point.width + dw)))
          const nextHeight = round1(Math.min(100, Math.max(0.5, point.height + dh)))
          const nextX = round1(Math.min(Math.max(0, 100 - nextWidth), Math.max(0, point.x + dx)))
          const nextY = round1(Math.min(Math.max(0, 100 - nextHeight), Math.max(0, point.y + dy)))
          return {
            ...point,
            x: nextX,
            y: nextY,
            width: nextWidth,
            height: nextHeight,
          }
        }),
      )
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editMode, selectedEditId, activePage, currentEditableList])

  const handleOpenEquipmentFaceplate = (id: string) => {
    if (editMode) return
    setSelectedEquipmentId(id)
  }

  const setPoint = (id: string, on: boolean) => {
    if (on && faultedPoints.includes(id)) {
      setFaultedPoints((current) => current.filter((pointId) => pointId !== id))
    }
    setPoints((current) =>
      current.map((point) => {
        if (point.id !== id) return point
        const defaultHz = point.kind === 'pump' ? 45.0 : point.kind === 'tower' ? 42.0 : point.hz
        const nextHz = on ? (point.hz && point.hz > 0 ? point.hz : defaultHz) : 0
        return { ...point, on, hz: nextHz }
      }),
    )
  }

  const setUnitState = (label: string, on: boolean) => {
    setUnitStatus((current) => ({ ...current, [label]: on }))
  }

  const updateEquipmentProps = (id: string, patch: Partial<Equipment>) => {
    setPoints((current) =>
      current.map((point) => (point.id === id ? { ...point, ...patch } : point)),
    )
    setAhuPoints((current) =>
      current.map((point) => (point.id === id ? { ...point, ...patch } : point)),
    )
    setPauPoints((current) =>
      current.map((point) => (point.id === id ? { ...point, ...patch } : point)),
    )
    setFcuPoints((current) =>
      current.map((point) => (point.id === id ? { ...point, ...patch } : point)),
    )
  }

  const toggleTripFault = (id: string) => {
    const isCurrentlyFaulted = faultedPoints.includes(id)
    if (isCurrentlyFaulted) {
      setFaultedPoints((current) => current.filter((pid) => pid !== id))
    } else {
      setFaultedPoints((current) => [...current, id])
      setPoints((current) =>
        current.map((point) => (point.id === id ? { ...point, on: false, hz: 0 } : point)),
      )
      setAhuPoints((current) =>
        current.map((point) => (point.id === id ? { ...point, on: false } : point)),
      )
      setPauPoints((current) =>
        current.map((point) => (point.id === id ? { ...point, on: false } : point)),
      )
      setFcuPoints((current) =>
        current.map((point) => (point.id === id ? { ...point, on: false } : point)),
      )
    }
  }

  const applyScenario = (scenario: 'normal' | 'high' | 'fault') => {
    setPoints((current) =>
      current.map((point) => {
        if (point.kind !== 'chiller' && point.kind !== 'pump' && point.kind !== 'tower') {
          return point
        }
        const on =
          scenario === 'normal'
            ? ['CHILLER_01', 'CTWP_01', 'CHWP_01', 'CT_01_A', 'CT_01_B'].includes(point.id)
            : scenario === 'high'
              ? true
              : !['CTWP_01', 'CT_01_A', 'CT_01_B'].includes(point.id)
        const targetHz =
          point.kind === 'pump'
            ? on
              ? scenario === 'high'
                ? 49.0
                : 45.0
              : 0
            : point.kind === 'tower'
              ? on
                ? scenario === 'high'
                  ? 48.0
                  : 42.0
                : 0
              : point.hz
        return { ...point, on, hz: targetHz }
      }),
    )
    setFaultedPoints(scenario === 'fault' ? ['CTWP_01', 'CT_01_A', 'CT_01_B'] : [])
    if (scenario === 'high') {
      setSupplyTemp(6.8)
      setReturnTemp(13.2)
      setCondenserSupplyTemp(28.5)
      setCondenserReturnTemp(32.4)
      setPressure(1.52)
      setBypassValvePct(18)
    }
    if (scenario === 'normal') {
      setSupplyTemp(7.1)
      setReturnTemp(12.4)
      setCondenserSupplyTemp(27.8)
      setCondenserReturnTemp(31.2)
      setPressure(1.45)
      setBypassValvePct(32)
    }
    if (scenario === 'fault') {
      setSupplyTemp(9.4)
      setPressure(1.18)
    }
  }

  const resetCoordinates = () => {
    if (activePage === 'chiller') {
      setPoints((current) =>
        initialPoints.map((initPt) => {
          const existing = current.find((c) => c.id === initPt.id)
          return existing
            ? { ...existing, x: initPt.x, y: initPt.y, width: initPt.width, height: initPt.height }
            : initPt
        }),
      )
    } else if (activePage === 'ahu') {
      setAhuPoints(initialAhuPoints)
    } else if (activePage === 'pau') {
      setPauPoints(initialPauPoints)
    } else if (activePage === 'fcu') {
      setFcuPoints(initialFcuPoints)
    }
  }

  const exportConfig = () => {
    const data = {
      page: activePage,
      points,
      ahuPoints,
      pauPoints,
      fcuPoints,
      sensors: {
        outdoorTemp,
        supplyTemp,
        returnTemp,
        condenserSupplyTemp,
        condenserReturnTemp,
        pressure,
        diffPressureSP,
        bypassValvePct,
      },
      exportedAt: new Date().toISOString(),
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'bms-virtual-points.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const copyCoordinatesJson = async () => {
    const targetData = currentEditableList.length > 0 ? currentEditableList : points
    const formatted = JSON.stringify(targetData, null, 2)
    try {
      await navigator.clipboard.writeText(formatted)
      setCopiedJson(true)
      window.setTimeout(() => setCopiedJson(false), 1800)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = formatted
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedJson(true)
      window.setTimeout(() => setCopiedJson(false), 1800)
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
    if (!editMode) return
    event.preventDefault()
    event.stopPropagation()
    const canvas = event.currentTarget.closest('.graphic-canvas')
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const nodeRect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - nodeRect.left
    const offsetY = event.clientY - nodeRect.top

    const move = (e: PointerEvent) => {
      updateActiveList((current) =>
        current.map((point) => {
          if (point.id !== id) return point
          const nextX = round1(
            Math.min(
              Math.max(0, 100 - point.width),
              Math.max(0, ((e.clientX - rect.left - offsetX) / rect.width) * 100),
            ),
          )
          const nextY = round1(
            Math.min(
              Math.max(0, 100 - point.height),
              Math.max(0, ((e.clientY - rect.top - offsetY) / rect.height) * 100),
            ),
          )
          return { ...point, x: nextX, y: nextY }
        }),
      )
    }

    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const onResizePointerDown = (event: ReactPointerEvent<HTMLSpanElement>, id: string) => {
    if (!editMode) return
    event.preventDefault()
    event.stopPropagation()
    const canvas = event.currentTarget.closest('.graphic-canvas')
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const targetPoint = currentEditableList.find((p) => p.id === id)
    if (!targetPoint) return
    const initialW = targetPoint.width
    const initialH = targetPoint.height

    const move = (e: PointerEvent) => {
      const deltaW = ((e.clientX - startX) / rect.width) * 100
      const deltaH = ((e.clientY - startY) / rect.height) * 100

      updateActiveList((current) =>
        current.map((point) => {
          if (point.id !== id) return point
          const nextW = round1(Math.min(100 - point.x, Math.max(0.5, initialW + deltaW)))
          const nextH = round1(Math.min(100 - point.y, Math.max(0.5, initialH + deltaH)))
          return { ...point, width: nextW, height: nextH }
        }),
      )
    }

    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const updateSelectedPointField = (field: 'x' | 'y' | 'width' | 'height', rawValue: string) => {
    if (!selectedEditId) return
    const parsed = Number(rawValue)
    if (Number.isNaN(parsed)) return
    const val = round1(parsed)

    updateActiveList((current) =>
      current.map((point) => {
        if (point.id !== selectedEditId) return point
        if (field === 'width') {
          const nextW = Math.min(100 - point.x, Math.max(0.5, val))
          return { ...point, width: nextW }
        }
        if (field === 'height') {
          const nextH = Math.min(100 - point.y, Math.max(0.5, val))
          return { ...point, height: nextH }
        }
        if (field === 'x') {
          const nextX = Math.min(Math.max(0, 100 - point.width), Math.max(0, val))
          return { ...point, x: nextX }
        }
        const nextY = Math.min(Math.max(0, 100 - point.height), Math.max(0, val))
        return { ...point, y: nextY }
      }),
    )
  }

  const selectedEditPoint = currentEditableList.find((p) => p.id === selectedEditId) ?? null

  const allEquipment: Equipment[] = [...points, ...ahuPoints, ...pauPoints, ...fcuPoints]
  const activeFaceplateItem = allEquipment.find((p) => p.id === selectedEquipmentId) ?? null
  const activeFaceplateFaulted = activeFaceplateItem ? faultedPoints.includes(activeFaceplateItem.id) : false

  const chillerSwitchList = points.filter(
    (p) => p.kind === 'chiller' || p.kind === 'pump' || p.kind === 'tower',
  )

  const drawerEquipmentList: Equipment[] =
    activePage === 'chiller'
      ? chillerSwitchList
      : activePage === 'ahu'
        ? ahuPoints
        : activePage === 'pau'
          ? pauPoints
          : activePage === 'fcu'
            ? fcuPoints
            : chillerSwitchList

  const isUnitOn = (item: Equipment): boolean => {
    const override = unitStatus[item.label]
    return override !== undefined ? override : item.on
  }

  const toggleEquipment = (item: Equipment, nextOn: boolean) => {
    if (item.kind === 'chiller' || item.kind === 'pump' || item.kind === 'tower') {
      setPoint(item.id, nextOn)
    } else {
      setUnitState(item.label, nextOn)
      updateEquipmentProps(item.id, { on: nextOn })
    }
  }

  return (
    <main className="app-shell">
      <header className="compact-header" aria-label="Thanh điều hướng chính">
        <div className="compact-brand">
          <Layers3 className="compact-brand-icon" />
          <strong>BMS</strong>
        </div>

        <nav className="compact-nav" aria-label="Điều hướng trang">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              className={`compact-nav-btn ${activePage === page.id ? 'active' : ''}`}
              onClick={() => setActivePage(page.id)}
            >
              {page.short}
            </button>
          ))}
        </nav>

        <div className="compact-right">
          <span className="compact-stat">
            <i className="status-light running" /> {runningCount}/2 Chiller
          </span>
          <span className="compact-weather" title="Nhiệt độ ngoài trời">
            <CloudSun />
            <b>{outdoorTemp.toFixed(1)}°C</b>
          </span>
          <button
            type="button"
            className={`compact-drawer-btn ${drawerOpen ? 'selected' : ''}`}
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-expanded={drawerOpen}
          >
            {drawerOpen ? <PanelRightClose /> : <PanelRightOpen />}
            <span>{drawerOpen ? 'Ẩn điều khiển' : 'Hiện điều khiển'}</span>
          </button>
        </div>
      </header>

      <div className={`workspace ${drawerOpen ? 'drawer-open' : 'drawer-closed'}`}>
        <section className="graphic-wrap">
          <BmsDiagram
            activePage={activePage}
            points={currentEditableList}
            unitStatus={unitStatus}
            faultedPoints={faultedPoints}
            editMode={editMode}
            selectedEditId={selectedEditId}
            setSelectedEditId={setSelectedEditId}
            onSelectEquipment={handleOpenEquipmentFaceplate}
            setSelectedUnit={(name) => setSelectedUnit(name)}
            setActivePage={setActivePage}
            onPointerDown={onPointerDown}
            onResizePointerDown={onResizePointerDown}
          />
        </section>

        <aside className={`control-drawer ${drawerOpen ? 'is-open' : 'is-collapsed'}`} aria-hidden={!drawerOpen}>
          <div className="drawer-head">
            <div>
              <span className="eyebrow">BMS SIMULATOR</span>
              <h2>Điều khiển nhanh hệ thống</h2>
            </div>
            <button
              type="button"
              className="icon-button close-drawer"
              onClick={() => setDrawerOpen(false)}
              aria-label="Đóng bảng điều khiển"
            >
              <X />
            </button>
          </div>

          <div className="drawer-scroll">
            <section className="drawer-card-section">
              <div className="section-label">
                <span>1. CHUYỂN TRANG NHANH</span>
                <CircleHelp />
              </div>
              <div className="page-quick-list">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    className={`page-quick-btn ${activePage === page.id ? 'active' : ''}`}
                    onClick={() => setActivePage(page.id)}
                  >
                    <span>{page.short}</span>
                    <small>{page.label}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="drawer-card-section">
              <div className="section-label">
                <span>2. KỊCH BẢN VẬN HÀNH NHANH</span>
                <CircleHelp />
              </div>
              <div className="scenario-list">
                <button type="button" onClick={() => applyScenario('normal')}>
                  <span className="scenario-icon green">
                    <Activity />
                  </span>
                  <span>
                    <b>Vận hành bình thường (1 Chiller)</b>
                    <small>Chạy Chiller 1, bơm & tháp giải nhiệt số 1</small>
                  </span>
                  <ChevronRight />
                </button>
                <button type="button" onClick={() => applyScenario('high')}>
                  <span className="scenario-icon blue">
                    <Gauge />
                  </span>
                  <span>
                    <b>Cao tải (Chạy 2 Chiller)</b>
                    <small>Kích hoạt toàn bộ 2 tổ máy làm lạnh</small>
                  </span>
                  <ChevronRight />
                </button>
                <button type="button" onClick={() => applyScenario('fault')}>
                  <span className="scenario-icon amber">
                    <AlertTriangle />
                  </span>
                  <span>
                    <b>Giả lập sự cố Trip</b>
                    <small>Báo lỗi Trip CTWP-01 & tháp giải nhiệt CT-01</small>
                  </span>
                  <ChevronRight />
                </button>
              </div>
            </section>

            <section className="drawer-card-section">
              <div className="section-label">
                <span>3. CÔNG TẮC THIẾT BỊ · {activePage.toUpperCase()}</span>
                <span className="count-pill">
                  {drawerEquipmentList.filter((p) => isUnitOn(p)).length}/{drawerEquipmentList.length} CHẠY
                </span>
              </div>
              <div className="point-list">
                {drawerEquipmentList.map((point) => {
                  const isFaulted = faultedPoints.includes(point.id)
                  const on = isUnitOn(point)
                  return (
                    <div className="point-row" key={point.id}>
                      <span className={`point-icon ${on ? 'on' : isFaulted ? 'fault' : ''}`}>
                        {point.kind === 'chiller' || point.kind === 'ahu' ? (
                          <Layers3 />
                        ) : point.kind === 'tower' ? (
                          <Fan />
                        ) : point.kind === 'pump' || point.kind === 'pau' ? (
                          <Activity />
                        ) : (
                          <Thermometer />
                        )}
                      </span>
                      <span className="point-name">
                        <b>
                          <i
                            className={`status-light ${
                              isFaulted ? 'warning' : on ? 'running' : 'stopped'
                            }`}
                          />{' '}
                          {point.label}
                        </b>
                        <small>
                          {point.id} ·{' '}
                          {isFaulted
                            ? 'LỖI TRIP'
                            : on
                              ? typeof point.hz === 'number'
                                ? `Đang chạy (${point.hz.toFixed(1)} Hz)`
                                : 'Đang chạy'
                              : 'Đang dừng'}
                        </small>
                      </span>
                      <button
                        type="button"
                        className={`switch ${on ? 'on' : ''}`}
                        onClick={() => toggleEquipment(point, !on)}
                        role="switch"
                        aria-checked={on}
                        aria-label={`Bật tắt ${point.label}`}
                      >
                        <i />
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="drawer-card-section">
              <div className="section-label">
                <span>4. THANH TRƯỢT GIẢ LẬP CẢM BIẾN</span>
                <span className="live-mini">
                  <i className="live-dot" /> TRỰC TIẾP
                </span>
              </div>

              <label className="range-row">
                <div className="range-row-head">
                  <span>
                    <Thermometer /> Nước lạnh cấp (CHWS)
                  </span>
                  <b>{supplyTemp.toFixed(1)}°C</b>
                </div>
                <input
                  type="range"
                  min="5"
                  max="12"
                  step="0.1"
                  value={supplyTemp}
                  onChange={(e) => setSupplyTemp(Number(e.target.value))}
                />
              </label>

              <label className="range-row">
                <div className="range-row-head">
                  <span>
                    <Thermometer /> Nước lạnh hồi (CHWR)
                  </span>
                  <b>{returnTemp.toFixed(1)}°C</b>
                </div>
                <input
                  type="range"
                  min="8"
                  max="18"
                  step="0.1"
                  value={returnTemp}
                  onChange={(e) => setReturnTemp(Number(e.target.value))}
                />
              </label>

              <label className="range-row">
                <div className="range-row-head">
                  <span>
                    <Thermometer /> Nước giải nhiệt cấp (CDWS)
                  </span>
                  <b>{condenserSupplyTemp.toFixed(1)}°C</b>
                </div>
                <input
                  type="range"
                  min="22"
                  max="35"
                  step="0.1"
                  value={condenserSupplyTemp}
                  onChange={(e) => setCondenserSupplyTemp(Number(e.target.value))}
                />
              </label>

              <label className="range-row">
                <div className="range-row-head">
                  <span>
                    <Thermometer /> Nước giải nhiệt hồi (CDWR)
                  </span>
                  <b>{condenserReturnTemp.toFixed(1)}°C</b>
                </div>
                <input
                  type="range"
                  min="25"
                  max="42"
                  step="0.1"
                  value={condenserReturnTemp}
                  onChange={(e) => setCondenserReturnTemp(Number(e.target.value))}
                />
              </label>

              <label className="range-row">
                <div className="range-row-head">
                  <span>
                    <Gauge /> Chênh áp đường ống (DP)
                  </span>
                  <b>{pressure.toFixed(2)} bar</b>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.01"
                  value={pressure}
                  onChange={(e) => setPressure(Number(e.target.value))}
                />
              </label>

              <label className="range-row">
                <div className="range-row-head">
                  <span>
                    <CloudSun /> Nhiệt độ ngoài trời (OAT)
                  </span>
                  <b>{outdoorTemp.toFixed(1)}°C</b>
                </div>
                <input
                  type="range"
                  min="15"
                  max="42"
                  step="0.1"
                  value={outdoorTemp}
                  onChange={(e) => setOutdoorTemp(Number(e.target.value))}
                />
              </label>
            </section>

            <section className="drawer-card-section">
              <div className="section-label">
                <span>5. CÔNG CỤ TINH CHỈNH TỌA ĐỘ</span>
                <span className="count-pill">{activePage.toUpperCase()}</span>
              </div>

              <div className="edit-toggle-row">
                <div className="edit-toggle-info">
                  <span className="edit-icon">
                    <SlidersHorizontal />
                  </span>
                  <span>
                    <b>Chỉnh tọa độ trên sơ đồ</b>
                    <small>Kéo thả, resize góc, mũi tên / Shift+mũi tên</small>
                  </span>
                </div>
                <button
                  type="button"
                  className={`switch ${editMode ? 'on' : ''}`}
                  onClick={() => setEditMode(!editMode)}
                  role="switch"
                  aria-checked={editMode}
                  aria-label="Chế độ chỉnh tọa độ"
                >
                  <i />
                </button>
              </div>

              {editMode && currentEditableList.length > 0 && (
                <div className="edit-inspector">
                  <label className="inspector-select-row">
                    <span>Phần tử đang chọn</span>
                    <select
                      value={selectedEditId ?? ''}
                      onChange={(e) => setSelectedEditId(e.target.value || null)}
                    >
                      {currentEditableList.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.label} ({pt.id})
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedEditPoint && (
                    <div className="coord-grid">
                      <label>
                        <span>X%</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={selectedEditPoint.x}
                          onChange={(e) => updateSelectedPointField('x', e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Y%</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={selectedEditPoint.y}
                          onChange={(e) => updateSelectedPointField('y', e.target.value)}
                        />
                      </label>
                      <label>
                        <span>W%</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="100"
                          value={selectedEditPoint.width}
                          onChange={(e) => updateSelectedPointField('width', e.target.value)}
                        />
                      </label>
                      <label>
                        <span>H%</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="100"
                          value={selectedEditPoint.height}
                          onChange={(e) => updateSelectedPointField('height', e.target.value)}
                        />
                      </label>
                    </div>
                  )}

                  <p className="inspector-hint">
                    Mũi tên: ±0.1% vị trí · Shift + Mũi tên: ±0.1% kích thước
                  </p>
                </div>
              )}

              <div className="edit-actions-row">
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={resetCoordinates}
                  title="Đặt lại tọa độ mặc định của trang hiện tại"
                >
                  <RotateCcw />
                  <span>Đặt lại</span>
                </button>
                <button
                  type="button"
                  className="copy-json-btn"
                  onClick={copyCoordinatesJson}
                >
                  {copiedJson ? <Check /> : <Copy />}
                  <span>{copiedJson ? 'Đã copy!' : 'Copy tọa độ'}</span>
                </button>
              </div>
            </section>

            <button type="button" className="export-button" onClick={exportConfig}>
              <ArrowDownToLine /> Xuất file cấu hình JSON
            </button>
          </div>

          <div className="drawer-foot">
            <span>
              <i className="live-dot" /> Mô phỏng đang hoạt động
            </span>
            <span>v2.0.0</span>
          </div>
        </aside>
      </div>

      {activeFaceplateItem && (
        <div className="modal-backdrop" onClick={() => setSelectedEquipmentId(null)}>
          <section
            className="unit-modal faceplate-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="faceplate-title"
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">
                  {activeFaceplateItem.kind === 'chiller'
                    ? 'CHILLER FACEPLATE · ĐIỀU KHIỂN TỔ MÁY'
                    : activeFaceplateItem.kind === 'pump' || activeFaceplateItem.kind === 'tower'
                      ? 'VSD DRIVE FACEPLATE · ĐIỀU KHIỂN ĐỘNG CƠ'
                      : activeFaceplateItem.kind === 'ahu'
                        ? 'AHU FACEPLATE · ĐIỀU KHIỂN XỬ LÝ KHÔNG KHÍ'
                        : activeFaceplateItem.kind === 'pau'
                          ? 'PAU/DHU FACEPLATE · CẤP GIÓ TƯƠI'
                          : 'FCU FACEPLATE · ĐIỀU HÒA KHU VỰC'}
                </span>
                <h2 id="faceplate-title">{activeFaceplateItem.label}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedEquipmentId(null)}
                aria-label="Đóng"
              >
                <X />
              </button>
            </div>

            {(activeFaceplateItem.kind === 'chiller' ||
              activeFaceplateItem.kind === 'pump' ||
              activeFaceplateItem.kind === 'tower' ||
              activeFaceplateItem.kind === 'ahu' ||
              activeFaceplateItem.kind === 'pau' ||
              activeFaceplateItem.kind === 'fcu') && (
              <div className="faceplate-body">
                <div className="faceplate-status-bar">
                  <div className="faceplate-state-pill">
                    <i
                      className={`status-light ${
                        activeFaceplateFaulted
                          ? 'warning'
                          : activeFaceplateItem.on
                            ? 'running'
                            : 'stopped'
                      }`}
                    />
                    <strong>
                      {activeFaceplateFaulted
                        ? 'BÁO LỖI TRIP'
                        : activeFaceplateItem.on
                          ? 'ĐANG VẬN HÀNH (ON)'
                          : 'ĐÃ DỪNG (OFF)'}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className={`switch ${activeFaceplateItem.on ? 'on' : ''}`}
                    onClick={() => toggleEquipment(activeFaceplateItem, !activeFaceplateItem.on)}
                    role="switch"
                    aria-checked={activeFaceplateItem.on}
                    aria-label="Chạy / Dừng thiết bị"
                  >
                    <i />
                  </button>
                </div>

                <div className="faceplate-control-row">
                  <span>Chế độ điều khiển</span>
                  <div className="segmented-control">
                    <button
                      type="button"
                      className={(activeFaceplateItem.mode ?? 'auto') === 'auto' ? 'active' : ''}
                      onClick={() => updateEquipmentProps(activeFaceplateItem.id, { mode: 'auto' })}
                    >
                      Auto
                    </button>
                    <button
                      type="button"
                      className={activeFaceplateItem.mode === 'manual' ? 'active' : ''}
                      onClick={() => updateEquipmentProps(activeFaceplateItem.id, { mode: 'manual' })}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {(activeFaceplateItem.kind === 'pump' || activeFaceplateItem.kind === 'tower') && (
                  <div className="faceplate-slider-card">
                    <div className="faceplate-slider-head">
                      <span>Tần số biến tần VSD</span>
                      <div className="inline-number-box">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="0.5"
                          value={(activeFaceplateItem.hz ?? 0).toFixed(1)}
                          onChange={(e) => {
                            const v = Math.min(50, Math.max(0, Number(e.target.value) || 0))
                            updateEquipmentProps(activeFaceplateItem.id, {
                              hz: round1(v),
                              on: v > 0 ? true : activeFaceplateItem.on,
                            })
                          }}
                        />
                        <span>Hz</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={activeFaceplateItem.hz ?? 0}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        updateEquipmentProps(activeFaceplateItem.id, {
                          hz: v,
                          on: v > 0 ? true : false,
                        })
                        if (v > 0 && activeFaceplateFaulted) {
                          setFaultedPoints((cur) => cur.filter((pid) => pid !== activeFaceplateItem.id))
                        }
                      }}
                    />
                  </div>
                )}

                {(activeFaceplateItem.kind === 'chiller' ||
                  activeFaceplateItem.kind === 'ahu' ||
                  activeFaceplateItem.kind === 'pau' ||
                  activeFaceplateItem.kind === 'fcu') && (
                  <div className="faceplate-slider-card">
                    <div className="faceplate-slider-head">
                      <span>Nhiệt độ cài đặt (Setpoint)</span>
                      <div className="inline-number-box">
                        <input
                          type="number"
                          min="5.0"
                          max="30.0"
                          step="0.1"
                          value={(activeFaceplateItem.setpoint ?? 22.0).toFixed(1)}
                          onChange={(e) => {
                            const v = Math.min(30, Math.max(5, Number(e.target.value) || 22.0))
                            updateEquipmentProps(activeFaceplateItem.id, { setpoint: round1(v) })
                            if (activeFaceplateItem.kind === 'chiller') setSupplyTemp(round1(v))
                          }}
                        />
                        <span>°C</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="30.0"
                      step="0.1"
                      value={activeFaceplateItem.setpoint ?? 22.0}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        updateEquipmentProps(activeFaceplateItem.id, { setpoint: v })
                        if (activeFaceplateItem.kind === 'chiller') setSupplyTemp(v)
                      }}
                    />
                  </div>
                )}

                {(activeFaceplateItem.kind === 'chiller' ||
                  activeFaceplateItem.kind === 'pump' ||
                  activeFaceplateItem.kind === 'tower') && (
                  <div className="parameter-grid">
                    <div>
                      <small>Chế độ vận hành</small>
                      <b>{(activeFaceplateItem.mode ?? 'auto').toUpperCase()}</b>
                    </div>
                    <div>
                      <small>Giờ chạy tích lũy</small>
                      <b>{activeFaceplateItem.runHours ?? 1428} giờ</b>
                    </div>
                    <div>
                      <small>Trạng thái Trip</small>
                      <b>{activeFaceplateFaulted ? 'TRIP_ON' : 'Bình thường'}</b>
                    </div>
                    <div>
                      <small>Điểm dữ liệu</small>
                      <b>{activeFaceplateItem.id}</b>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className={`trip-sim-btn ${activeFaceplateFaulted ? 'is-faulted' : ''}`}
                  onClick={() => toggleTripFault(activeFaceplateItem.id)}
                >
                  <AlertTriangle />
                  <span>
                    {activeFaceplateFaulted ? 'Reset Alarm (Xóa lỗi Trip)' : 'Giả lập lỗi Trip'}
                  </span>
                </button>
              </div>
            )}

            {activeFaceplateItem.id === 'SENS_DP' && (
              <div className="faceplate-body">
                <div className="faceplate-slider-card">
                  <div className="faceplate-slider-head">
                    <span>Giá trị cài đặt chênh áp (DiffPressureSP)</span>
                    <div className="inline-number-box">
                      <input
                        type="number"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={diffPressureSP.toFixed(2)}
                        onChange={(e) => {
                          const v = Math.min(2.5, Math.max(0.5, Number(e.target.value) || 1.5))
                          setDiffPressureSP(Math.round(v * 100) / 100)
                        }}
                      />
                      <span>bar</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={diffPressureSP}
                    onChange={(e) => setDiffPressureSP(Number(e.target.value))}
                  />
                </div>

                <div className="faceplate-slider-card">
                  <div className="faceplate-slider-head">
                    <span>Chênh áp thực tế đường ống (DP Actual)</span>
                    <b>{pressure.toFixed(2)} bar</b>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.01"
                    value={pressure}
                    onChange={(e) => setPressure(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {activeFaceplateItem.id === 'FLOW_BYPASS_VSD' && (
              <div className="faceplate-body">
                <div className="faceplate-slider-card">
                  <div className="faceplate-slider-head">
                    <span>Độ mở van Bypass (0 – 100%)</span>
                    <div className="inline-number-box">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={Math.round(bypassValvePct)}
                        onChange={(e) => {
                          const v = Math.min(100, Math.max(0, Number(e.target.value) || 0))
                          setBypassValvePct(Math.round(v))
                        }}
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={bypassValvePct}
                    onChange={(e) => setBypassValvePct(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              className="modal-done"
              onClick={() => setSelectedEquipmentId(null)}
            >
              Hoàn tất
            </button>
          </section>
        </div>
      )}

      {selectedUnit && (
        <div className="modal-backdrop" onClick={() => setSelectedUnit(null)}>
          <section
            className="unit-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">ĐIỂM ẢO · THIẾT BỊ</span>
                <h2 id="modal-title">{selectedUnit}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedUnit(null)}
                aria-label="Đóng"
              >
                <X />
              </button>
            </div>
            <div className="modal-status">
              <i
                className={`status-light ${unitStatus[selectedUnit] === false ? 'stopped' : 'running'}`}
              />{' '}
              {unitStatus[selectedUnit] === false ? 'ĐANG DỪNG' : 'ĐANG VẬN HÀNH'}{' '}
              <button
                type="button"
                className={`switch ${unitStatus[selectedUnit] !== false ? 'on' : ''}`}
                onClick={() =>
                  setUnitStatus((s) => ({ ...s, [selectedUnit]: s[selectedUnit] === false }))
                }
                role="switch"
                aria-checked={unitStatus[selectedUnit] !== false}
              >
                <i />
              </button>
            </div>
            {selectedUnit.startsWith('FCU') ? (
              <>
                <label className="modal-range">
                  Nhiệt độ cài đặt <b>{fcuSetpoint.toFixed(1)}°C</b>
                  <input
                    type="range"
                    min="18"
                    max="30"
                    step="0.5"
                    value={fcuSetpoint}
                    onChange={(e) => setFcuSetpoint(Number(e.target.value))}
                  />
                </label>
                <label className="modal-select">
                  Tốc độ quạt
                  <select value={fanSpeed} onChange={(e) => setFanSpeed(e.target.value)}>
                    {['Thấp', 'Trung bình', 'Cao', 'Tự động'].map((speed) => (
                      <option key={speed}>{speed}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <div className="parameter-grid">
                <div>
                  <small>Nhiệt độ gió cấp</small>
                  <b>14.2°C</b>
                </div>
                <div>
                  <small>Nhiệt độ gió hồi</small>
                  <b>24.6°C</b>
                </div>
                <div>
                  <small>Tốc độ quạt</small>
                  <b>42.0 Hz</b>
                </div>
                <div>
                  <small>Độ mở damper</small>
                  <b>68%</b>
                </div>
                <div>
                  <small>Chênh áp lọc</small>
                  <b>112 Pa</b>
                </div>
                <div>
                  <small>Độ mở van</small>
                  <b>54%</b>
                </div>
              </div>
            )}
            <button type="button" className="modal-done" onClick={() => setSelectedUnit(null)}>
              Hoàn tất
            </button>
          </section>
        </div>
      )}
    </main>
  )
}
