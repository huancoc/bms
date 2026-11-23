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
  SlidersHorizontal,
  Thermometer,
  X,
} from 'lucide-react'
import BmsDiagram, { type Equipment, type PageKey } from './bms-diagram'

const pages: { id: PageKey; label: string; short: string }[] = [
  { id: 'home', label: 'Tổng quan', short: 'HOME' },
  { id: 'chiller', label: 'Chiller', short: 'CHILLER' },
  { id: 'ahu', label: 'AHU', short: 'AHU' },
  { id: 'pau', label: 'PAU', short: 'PAU' },
  { id: 'fcu', label: 'FCU', short: 'FCU' },
  { id: 'help', label: 'Trợ giúp', short: 'HELP' },
]

const initialPoints: Equipment[] = [
  { id: 'CHILLER_01', label: 'Chiller 1', kind: 'chiller', x: 42.9, y: 54.5, width: 9.4, height: 11, on: true },
  { id: 'CHILLER_02', label: 'Chiller 2', kind: 'chiller', x: 42.9, y: 84.8, width: 9.4, height: 11, on: false },
  { id: 'CTWP_01', label: 'Bơm giải nhiệt CTWP-01', kind: 'pump', x: 17.3, y: 54.5, width: 9.4, height: 11, on: true },
  { id: 'CTWP_02', label: 'Bơm giải nhiệt CTWP-02', kind: 'pump', x: 17.3, y: 84.8, width: 9.4, height: 11, on: false },
  { id: 'CHWP_01', label: 'Bơm nước lạnh CHWP-01', kind: 'pump', x: 65.5, y: 54.5, width: 9.4, height: 11, on: true },
  { id: 'CHWP_02', label: 'Bơm nước lạnh CHWP-02', kind: 'pump', x: 65.5, y: 84.8, width: 9.4, height: 11, on: false },
  { id: 'CT_01', label: 'Tháp giải nhiệt CT-01', kind: 'tower', x: 18.1, y: 22, width: 13.9, height: 12, on: true },
  { id: 'CT_02', label: 'Tháp giải nhiệt CT-02', kind: 'tower', x: 52.8, y: 22, width: 13.9, height: 12, on: false },
  { id: 'SENS_CDWR', label: 'Nước giải nhiệt hồi', kind: 'sensor', x: 29.0, y: 36.0, width: 6.2, height: 3.2, on: true, value: '31.2', unit: '°C' },
  { id: 'SENS_CDWS', label: 'Nước giải nhiệt cấp', kind: 'sensor', x: 29.0, y: 41.0, width: 6.2, height: 3.2, on: true, value: '27.8', unit: '°C' },
  { id: 'SENS_CHWR', label: 'Nước lạnh hồi', kind: 'sensor', x: 77.0, y: 36.0, width: 6.2, height: 3.2, on: true, value: '12.4', unit: '°C' },
  { id: 'SENS_CHWS', label: 'Nước lạnh cấp', kind: 'sensor', x: 77.0, y: 41.0, width: 6.2, height: 3.2, on: true, value: '7.1', unit: '°C' },
  { id: 'SENS_DP', label: 'Chênh áp', kind: 'sensor', x: 77.0, y: 46.0, width: 7.4, height: 3.2, on: true, value: '1.45', unit: ' bar' },
  { id: 'FLOW_BYPASS_VSD', label: 'Bypass VSD', kind: 'flow', x: 55.0, y: 69.0, width: 5.8, height: 3.0, on: true, value: '32', unit: '%' },
  { id: 'FLOW_FS_OPEN', label: 'FS Mở', kind: 'flow', x: 12.0, y: 69.0, width: 5.6, height: 3.0, on: true, value: 'FS MỞ', unit: '' },
  { id: 'FLOW_FS_CLOSE', label: 'FS Đóng', kind: 'flow', x: 12.0, y: 73.5, width: 6.0, height: 3.0, on: false, value: 'FS ĐÓNG', unit: '' },
]

const round1 = (n: number) => Math.round(n * 10) / 10

export default function BmsSimulator() {
  const [activePage, setActivePage] = useState<PageKey>('chiller')
  const [points, setPoints] = useState<Equipment[]>(initialPoints)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedEditId, setSelectedEditId] = useState<string | null>(initialPoints[0]?.id ?? null)
  const [copiedJson, setCopiedJson] = useState(false)
  const [outdoorTemp, setOutdoorTemp] = useState(27.5)
  const [supplyTemp, setSupplyTemp] = useState(7.1)
  const [returnTemp, setReturnTemp] = useState(12.4)
  const [pressure, setPressure] = useState(1.45)
  const [fcuSetpoint, setFcuSetpoint] = useState(23)
  const [fanSpeed, setFanSpeed] = useState('Tự động')
  const [unitStatus, setUnitStatus] = useState<Record<string, boolean>>({})
  const [faultedPoints, setFaultedPoints] = useState<string[]>([])

  const runningCount = points.filter((p) => p.on && p.kind === 'chiller').length

  useEffect(() => {
    setPoints((current) =>
      current.map((point) => {
        if (point.id === 'SENS_CHWS') return { ...point, value: supplyTemp.toFixed(1) }
        if (point.id === 'SENS_CHWR') return { ...point, value: returnTemp.toFixed(1) }
        if (point.id === 'SENS_DP') return { ...point, value: pressure.toFixed(2) }
        return point
      }),
    )
  }, [supplyTemp, returnTemp, pressure])

  useEffect(() => {
    if (!editMode || !selectedEditId) return
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
      setPoints((current) =>
        current.map((point) => {
          if (point.id !== selectedEditId) return point
          const nextWidth = round1(Math.min(100, Math.max(1, point.width + dw)))
          const nextHeight = round1(Math.min(100, Math.max(1, point.height + dh)))
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
  }, [editMode, selectedEditId])

  const setPoint = (id: string, on: boolean) => {
    setPoints((current) => current.map((point) => (point.id === id ? { ...point, on } : point)))
    setFaultedPoints((current) => current.filter((pointId) => pointId !== id))
  }

  const applyScenario = (scenario: 'normal' | 'high' | 'fault') => {
    setPoints((current) =>
      current.map((point) => {
        if (point.kind !== 'chiller' && point.kind !== 'pump' && point.kind !== 'tower') {
          return point
        }
        const on =
          scenario === 'normal'
            ? ['CHILLER_01', 'CTWP_01', 'CHWP_01', 'CT_01'].includes(point.id)
            : scenario === 'high'
              ? !point.id.includes('02') || ['CHILLER_02', 'CTWP_02', 'CHWP_02', 'CT_02'].includes(point.id)
              : point.id !== 'CTWP_01' && point.id !== 'CT_01'
        return { ...point, on }
      }),
    )
    setFaultedPoints(scenario === 'fault' ? ['CTWP_01', 'CT_01'] : [])
    if (scenario === 'high') {
      setSupplyTemp(6.8)
      setPressure(1.52)
    }
    if (scenario === 'normal') {
      setSupplyTemp(7.1)
      setPressure(1.45)
    }
  }

  const exportConfig = () => {
    const data = {
      page: activePage,
      points,
      sensors: { outdoorTemp, supplyTemp, returnTemp, pressure },
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
    const formatted = JSON.stringify(points, null, 2)
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
      setPoints((current) =>
        current.map((point) => {
          if (point.id !== id) return point
          const nextX = round1(
            Math.min(Math.max(0, 100 - point.width), Math.max(0, ((e.clientX - rect.left - offsetX) / rect.width) * 100)),
          )
          const nextY = round1(
            Math.min(Math.max(0, 100 - point.height), Math.max(0, ((e.clientY - rect.top - offsetY) / rect.height) * 100)),
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
    const targetPoint = points.find((p) => p.id === id)
    if (!targetPoint) return
    const initialW = targetPoint.width
    const initialH = targetPoint.height

    const move = (e: PointerEvent) => {
      const deltaW = ((e.clientX - startX) / rect.width) * 100
      const deltaH = ((e.clientY - startY) / rect.height) * 100

      setPoints((current) =>
        current.map((point) => {
          if (point.id !== id) return point
          const nextW = round1(Math.min(100 - point.x, Math.max(1, initialW + deltaW)))
          const nextH = round1(Math.min(100 - point.y, Math.max(1, initialH + deltaH)))
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

    setPoints((current) =>
      current.map((point) => {
        if (point.id !== selectedEditId) return point
        if (field === 'width') {
          const nextW = Math.min(100 - point.x, Math.max(1, val))
          return { ...point, width: nextW }
        }
        if (field === 'height') {
          const nextH = Math.min(100 - point.y, Math.max(1, val))
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

  const selectedEditPoint = points.find((p) => p.id === selectedEditId) ?? null

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
            <i className="status-light running" /> {runningCount}/2
          </span>
          <span className="compact-weather" title="Nhiệt độ ngoài trời">
            <CloudSun />
            <b>{outdoorTemp.toFixed(1)}°C</b>
          </span>
          <button
            type="button"
            className={`compact-drawer-btn ${drawerOpen ? 'selected' : ''}`}
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <SlidersHorizontal />
            <span>Bảng ĐK</span>
          </button>
        </div>
      </header>

      <div className="workspace">
        <section className="graphic-wrap">
          <BmsDiagram
            activePage={activePage}
            points={points}
            unitStatus={unitStatus}
            faultedPoints={faultedPoints}
            supplyTemp={supplyTemp}
            returnTemp={returnTemp}
            pressure={pressure}
            editMode={editMode}
            selectedEditId={selectedEditId}
            setSelectedEditId={setSelectedEditId}
            setPoint={setPoint}
            setSelectedUnit={(name) => setSelectedUnit(name)}
            setActivePage={setActivePage}
            onPointerDown={onPointerDown}
            onResizePointerDown={onResizePointerDown}
          />
        </section>

        {drawerOpen && (
          <aside className="control-drawer">
            <div className="drawer-head">
              <div>
                <span className="eyebrow">BMS SIMULATOR</span>
                <h2>Bảng điều khiển điểm ảo</h2>
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
              <section className="scenario-section">
                <div className="section-label">
                  <span>KỊCH BẢN VẬN HÀNH</span>
                  <CircleHelp />
                </div>
                <div className="scenario-list">
                  <button type="button" onClick={() => applyScenario('normal')}>
                    <span className="scenario-icon green">
                      <Activity />
                    </span>
                    <span>
                      <b>Vận hành bình thường</b>
                      <small>Chạy 1 Chiller · tải trung bình</small>
                    </span>
                    <ChevronRight />
                  </button>
                  <button type="button" onClick={() => applyScenario('high')}>
                    <span className="scenario-icon blue">
                      <Gauge />
                    </span>
                    <span>
                      <b>Cao tải</b>
                      <small>Chạy 2 Chiller · tải cao điểm</small>
                    </span>
                    <ChevronRight />
                  </button>
                  <button type="button" onClick={() => applyScenario('fault')}>
                    <span className="scenario-icon amber">
                      <AlertTriangle />
                    </span>
                    <span>
                      <b>Giả lập sự cố</b>
                      <small>Trip bơm / tháp giải nhiệt</small>
                    </span>
                    <ChevronRight />
                  </button>
                </div>
              </section>

              <section className="point-section">
                <div className="section-label">
                  <span>THIẾT BỊ CHILLER</span>
                  <span className="count-pill">
                    {points.filter((p) => (p.kind === 'chiller' || p.kind === 'pump' || p.kind === 'tower') && p.on).length} ĐANG CHẠY
                  </span>
                </div>
                {points
                  .filter((p) => p.kind === 'chiller' || p.kind === 'pump' || p.kind === 'tower')
                  .map((point) => (
                    <div className="point-row" key={point.id}>
                      <span className={`point-icon ${point.on ? 'on' : ''}`}>
                        {point.kind === 'chiller' ? <Layers3 /> : point.kind === 'tower' ? <Fan /> : <Activity />}
                      </span>
                      <span className="point-name">
                        <b>{point.label}</b>
                        <small>{point.id}</small>
                      </span>
                      <button
                        type="button"
                        className={`switch ${point.on ? 'on' : ''}`}
                        onClick={() => setPoint(point.id, !point.on)}
                        role="switch"
                        aria-checked={point.on}
                        aria-label={`Bật tắt ${point.label}`}
                      >
                        <i />
                      </button>
                    </div>
                  ))}
              </section>

              <section className="point-section">
                <div className="section-label">
                  <span>THÔNG SỐ CẢM BIẾN</span>
                  <span className="live-mini">
                    <i className="live-dot" /> TRỰC TIẾP
                  </span>
                </div>
                <label className="range-row">
                  <span>
                    <Thermometer /> Nhiệt độ nước lạnh cấp
                  </span>
                  <b>{supplyTemp.toFixed(1)}°C</b>
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
                  <span>
                    <Thermometer /> Nhiệt độ nước lạnh hồi
                  </span>
                  <b>{returnTemp.toFixed(1)}°C</b>
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
                  <span>
                    <Gauge /> Chênh áp đường ống
                  </span>
                  <b>{pressure.toFixed(2)} bar</b>
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
                  <span>
                    <CloudSun /> Nhiệt độ ngoài trời
                  </span>
                  <b>{outdoorTemp.toFixed(1)}°C</b>
                  <input
                    type="range"
                    min="15"
                    max="40"
                    step="0.1"
                    value={outdoorTemp}
                    onChange={(e) => setOutdoorTemp(Number(e.target.value))}
                  />
                </label>
              </section>

              <section className="edit-section">
                <div>
                  <span className="edit-icon">
                    <SlidersHorizontal />
                  </span>
                  <span>
                    <b>Chỉnh sửa sơ đồ</b>
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
              </section>

              {editMode && (
                <section className="edit-inspector">
                  <div className="section-label">
                    <span>TỌA ĐỘ & KÍCH THƯỚC</span>
                    <span className="count-pill">{selectedEditPoint ? selectedEditPoint.id : 'CHƯA CHỌN'}</span>
                  </div>

                  <label className="inspector-select-row">
                    <span>Phần tử đang chọn</span>
                    <select
                      value={selectedEditId ?? ''}
                      onChange={(e) => setSelectedEditId(e.target.value || null)}
                    >
                      {points.map((pt) => (
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
                          min="1"
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
                          min="1"
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

                  <button
                    type="button"
                    className="copy-json-btn"
                    onClick={copyCoordinatesJson}
                  >
                    {copiedJson ? <Check /> : <Copy />}
                    <span>{copiedJson ? 'Đã copy JSON tọa độ!' : 'Copy JSON tọa độ'}</span>
                  </button>
                </section>
              )}

              <button type="button" className="export-button" onClick={exportConfig}>
                <ArrowDownToLine /> Xuất cấu hình JSON
              </button>
            </div>

            <div className="drawer-foot">
              <span>
                <i className="live-dot" /> Mô phỏng đang hoạt động
              </span>
              <span>v1.4.2</span>
            </div>
          </aside>
        )}
      </div>

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
