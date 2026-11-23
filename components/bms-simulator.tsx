'use client'

import { useState } from 'react'
import { Activity, AlertTriangle, ArrowDownToLine, ChevronDown, ChevronRight, CircleHelp, CloudSun, Fan, Gauge, Layers3, Menu, SlidersHorizontal, Thermometer, X } from 'lucide-react'
import BmsDiagram from './bms-diagram'

type PageKey = 'home' | 'chiller' | 'ahu' | 'pau' | 'fcu' | 'help'
type Equipment = { id: string; label: string; kind: 'chiller' | 'pump' | 'tower' | 'ahu' | 'pau' | 'fcu'; x: number; y: number; on: boolean; value?: string }

const pages: { id: PageKey; label: string; short: string }[] = [
  { id: 'home', label: 'Tổng quan', short: 'HOME' },
  { id: 'chiller', label: 'Chiller', short: 'CHILLER' },
  { id: 'ahu', label: 'AHU', short: 'AHU' },
  { id: 'pau', label: 'PAU', short: 'PAU' },
  { id: 'fcu', label: 'FCU', short: 'FCU' },
  { id: 'help', label: 'Trợ giúp', short: 'HELP' },
]

const initialPoints: Equipment[] = [
  { id: 'CHILLER_01', label: 'Chiller 1', kind: 'chiller', x: 42.9, y: 54.5, on: true },
  { id: 'CHILLER_02', label: 'Chiller 2', kind: 'chiller', x: 42.9, y: 84.8, on: false },
  { id: 'CTWP_01', label: 'Bơm giải nhiệt CTWP-01', kind: 'pump', x: 17.3, y: 54.5, on: true },
  { id: 'CTWP_02', label: 'Bơm giải nhiệt CTWP-02', kind: 'pump', x: 17.3, y: 84.8, on: false },
  { id: 'CHWP_01', label: 'Bơm nước lạnh CHWP-01', kind: 'pump', x: 65.5, y: 54.5, on: true },
  { id: 'CHWP_02', label: 'Bơm nước lạnh CHWP-02', kind: 'pump', x: 65.5, y: 84.8, on: false },
  { id: 'CT_01', label: 'Tháp giải nhiệt CT-01', kind: 'tower', x: 18.1, y: 22, on: true },
  { id: 'CT_02', label: 'Tháp giải nhiệt CT-02', kind: 'tower', x: 52.8, y: 22, on: false },
]


export default function BmsSimulator() {
  const [activePage, setActivePage] = useState<PageKey>('chiller')
  const [points, setPoints] = useState(initialPoints)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [outdoorTemp, setOutdoorTemp] = useState(27.5)
  const [supplyTemp, setSupplyTemp] = useState(7.1)
  const [returnTemp, setReturnTemp] = useState(12.4)
  const [pressure, setPressure] = useState(1.45)
  const [fcuSetpoint, setFcuSetpoint] = useState(23)
  const [fanSpeed, setFanSpeed] = useState('Tự động')
  const [fcuRunning, setFcuRunning] = useState(true)
  const [unitStatus, setUnitStatus] = useState<Record<string, boolean>>({})
  const [faultedPoints, setFaultedPoints] = useState<string[]>([])
  const runningCount = points.filter((p) => p.on && (p.kind === 'chiller')).length

  const setPoint = (id: string, on: boolean) => {
    setPoints((current) => current.map((point) => point.id === id ? { ...point, on } : point))
    setFaultedPoints((current) => current.filter((pointId) => pointId !== id))
  }
  const applyScenario = (scenario: 'normal' | 'high' | 'fault') => {
    setPoints((current) => current.map((point) => ({ ...point, on: scenario === 'normal' ? ['CHILLER_01', 'CTWP_01', 'CHWP_01', 'CT_01'].includes(point.id) : scenario === 'high' ? !point.id.includes('02') || ['CHILLER_02', 'CTWP_02', 'CHWP_02', 'CT_02'].includes(point.id) : point.id !== 'CTWP_01' && point.id !== 'CT_01' })))
    setFaultedPoints(scenario === 'fault' ? ['CTWP_01', 'CT_01'] : [])
    if (scenario === 'high') { setSupplyTemp(6.8); setPressure(1.52) }
    if (scenario === 'normal') { setSupplyTemp(7.1); setPressure(1.45) }
  }
  const exportConfig = () => {
    const data = { page: activePage, points, sensors: { outdoorTemp, supplyTemp, returnTemp, pressure }, exportedAt: new Date().toISOString() }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'bms-virtual-points.json'; anchor.click(); URL.revokeObjectURL(url)
  }
  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>, id: string) => {
    if (!editMode) return
    event.preventDefault()
    const canvas = event.currentTarget.closest('.graphic-canvas')
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const nodeRect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - nodeRect.left
    const offsetY = event.clientY - nodeRect.top
    const move = (e: PointerEvent) => setPoints((current) => current.map((point) => {
      if (point.id !== id) return point
      const width = point.kind === 'tower' ? 13.9 : 9.4
      const height = point.kind === 'tower' ? 12 : 11
      return { ...point, x: Math.min(100 - width, Math.max(0, ((e.clientX - rect.left - offsetX) / rect.width) * 100)), y: Math.min(100 - height, Math.max(0, ((e.clientY - rect.top - offsetY) / rect.height) * 100)) }
    }))
    const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop)
  }
  return <main className="app-shell">
    <header className="topbar">
      <div className="brand-lockup"><div className="brand-mark"><Layers3 /></div><div><p>BUILDING MANAGEMENT SYSTEM</p><h1>BMS <span>BUILDING</span></h1></div></div>
      <div className="topbar-right"><div className="connection"><span className="live-dot" /> Hệ thống trực tuyến</div><div className="weather"><CloudSun /><span>Ngoài trời</span><strong>{outdoorTemp.toFixed(1)}°C</strong></div><button className="icon-button mobile-menu" onClick={() => setDrawerOpen(!drawerOpen)} aria-label="Mở bảng điều khiển"><Menu /></button></div>
    </header>
    <nav className="quick-nav" aria-label="Điều hướng hệ thống">{pages.map((page) => <button key={page.id} className={`nav-tab ${activePage === page.id ? 'active' : ''}`} onClick={() => setActivePage(page.id)}><span>{page.short}</span><strong>{page.label}</strong></button>)}</nav>
    <section className="summary-row" aria-label="Trạng thái hệ thống">
      <div className="breadcrumb"><span>BMS BUILDING</span><ChevronRight /><strong>{pages.find((page) => page.id === activePage)?.label}</strong></div>
      <div className="summary-stats"><span><i className="status-light running" /> {runningCount} / 2 Chiller</span><span><Activity /> Tải lạnh <b>{runningCount ? '68%' : '0%'}</b></span><span><Gauge /> Chênh áp <b>{pressure.toFixed(2)} bar</b></span></div>
      <button className={`points-toggle ${drawerOpen ? 'selected' : ''}`} onClick={() => setDrawerOpen(!drawerOpen)}><SlidersHorizontal /> Điểm ảo <ChevronDown className={drawerOpen ? 'turned' : ''} /></button>
    </section>
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
          setPoint={setPoint}
          setSelectedUnit={(name) => setSelectedUnit(name)}
          setActivePage={setActivePage}
          onPointerDown={onPointerDown}
        />
        <div className="canvas-caption"><span><i className="status-light running" /> Dữ liệu mô phỏng trực tiếp</span><span>Hệ thống Quản lý Tòa nhà · BMS Building</span></div>
      </section>
      {drawerOpen && <aside className="control-drawer">
        <div className="drawer-head"><div><span className="eyebrow">BMS SIMULATOR</span><h2>Bảng điều khiển điểm ảo</h2></div><button className="icon-button close-drawer" onClick={() => setDrawerOpen(false)} aria-label="Đóng bảng điều khiển"><X /></button></div>
        <div className="drawer-scroll">
          <section className="scenario-section"><div className="section-label"><span>KỊCH BẢN VẬN HÀNH</span><CircleHelp /></div><div className="scenario-list"><button onClick={() => applyScenario('normal')}><span className="scenario-icon green"><Activity /></span><span><b>Vận hành bình thường</b><small>Chạy 1 Chiller · tải trung bình</small></span><ChevronRight /></button><button onClick={() => applyScenario('high')}><span className="scenario-icon blue"><Gauge /></span><span><b>Cao tải</b><small>Chạy 2 Chiller · tải cao điểm</small></span><ChevronRight /></button><button onClick={() => applyScenario('fault')}><span className="scenario-icon amber"><AlertTriangle /></span><span><b>Giả lập sự cố</b><small>Trip bơm / tháp giải nhiệt</small></span><ChevronRight /></button></div></section>
          <section className="point-section"><div className="section-label"><span>THIẾT BỊ CHILLER</span><span className="count-pill">{points.filter((p) => p.on).length} ĐANG CHẠY</span></div>{points.map((point) => <div className="point-row" key={point.id}><span className={`point-icon ${point.on ? 'on' : ''}`}>{point.kind === 'chiller' ? <Layers3 /> : point.kind === 'tower' ? <Fan /> : <Activity />}</span><span className="point-name"><b>{point.label}</b><small>{point.id}</small></span><button className={`switch ${point.on ? 'on' : ''}`} onClick={() => setPoint(point.id, !point.on)} role="switch" aria-checked={point.on} aria-label={`Bật tắt ${point.label}`}><i /></button></div>)}</section>
          <section className="point-section"><div className="section-label"><span>THÔNG SỐ CẢM BIẾN</span><span className="live-mini"><i className="live-dot" /> TRỰC TIẾP</span></div><label className="range-row"><span><Thermometer /> Nhiệt độ nước lạnh cấp</span><b>{supplyTemp.toFixed(1)}°C</b><input type="range" min="5" max="12" step="0.1" value={supplyTemp} onChange={(e) => setSupplyTemp(Number(e.target.value))} /></label><label className="range-row"><span><Thermometer /> Nhiệt độ nước lạnh hồi</span><b>{returnTemp.toFixed(1)}°C</b><input type="range" min="8" max="18" step="0.1" value={returnTemp} onChange={(e) => setReturnTemp(Number(e.target.value))} /></label><label className="range-row"><span><Gauge /> Chênh áp đường ống</span><b>{pressure.toFixed(2)} bar</b><input type="range" min="0.5" max="2.5" step="0.01" value={pressure} onChange={(e) => setPressure(Number(e.target.value))} /></label><label className="range-row"><span><CloudSun /> Nhiệt độ ngoài trời</span><b>{outdoorTemp.toFixed(1)}°C</b><input type="range" min="15" max="40" step="0.1" value={outdoorTemp} onChange={(e) => setOutdoorTemp(Number(e.target.value))} /></label></section>
          <section className="edit-section"><div><span className="edit-icon"><SlidersHorizontal /></span><span><b>Chỉnh sửa sơ đồ</b><small>Kéo thả thiết bị trên sơ đồ</small></span></div><button className={`switch ${editMode ? 'on' : ''}`} onClick={() => setEditMode(!editMode)} role="switch" aria-checked={editMode} aria-label="Chế độ chỉnh tọa độ"><i /></button></section>
          <button className="export-button" onClick={exportConfig}><ArrowDownToLine /> Xuất cấu hình JSON</button>
        </div>
        <div className="drawer-foot"><span><i className="live-dot" /> Mô phỏng đang hoạt động</span><span>v1.4.2</span></div>
      </aside>}
    </div>
    {selectedUnit && <div className="modal-backdrop" onClick={() => setSelectedUnit(null)}><section className="unit-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><span className="eyebrow">ĐIỂM ẢO · THIẾT BỊ</span><h2 id="modal-title">{selectedUnit}</h2></div><button className="icon-button" onClick={() => setSelectedUnit(null)} aria-label="Đóng"><X /></button></div><div className="modal-status"><i className={`status-light ${unitStatus[selectedUnit] === false ? 'stopped' : 'running'}`} /> {unitStatus[selectedUnit] === false ? 'ĐANG DỪNG' : 'ĐANG VẬN HÀNH'} <button className={`switch ${unitStatus[selectedUnit] !== false ? 'on' : ''}`} onClick={() => setUnitStatus((s) => ({ ...s, [selectedUnit]: s[selectedUnit] === false }))} role="switch" aria-checked={unitStatus[selectedUnit] !== false}><i /></button></div>{selectedUnit.startsWith('FCU') ? <><label className="modal-range">Nhiệt độ cài đặt <b>{fcuSetpoint.toFixed(1)}°C</b><input type="range" min="18" max="30" step="0.5" value={fcuSetpoint} onChange={(e) => setFcuSetpoint(Number(e.target.value))} /></label><label className="modal-select">Tốc độ quạt<select value={fanSpeed} onChange={(e) => setFanSpeed(e.target.value)}>{['Thấp','Trung bình','Cao','Tự động'].map((speed) => <option key={speed}>{speed}</option>)}</select></label></> : <div className="parameter-grid"><div><small>Nhiệt độ gió cấp</small><b>14.2°C</b></div><div><small>Nhiệt độ gió hồi</small><b>24.6°C</b></div><div><small>Tốc độ quạt</small><b>42.0 Hz</b></div><div><small>Độ mở damper</small><b>68%</b></div><div><small>Chênh áp lọc</small><b>112 Pa</b></div><div><small>Độ mở van</small><b>54%</b></div></div>}<button className="modal-done" onClick={() => setSelectedUnit(null)}>Hoàn tất</button></section></div>}
  </main>
}
