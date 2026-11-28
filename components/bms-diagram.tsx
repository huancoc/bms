'use client'
import { SvgChillerDiagram, type ChillerPlant } from './source-views/chiller-diagram'
import { useEffect, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import './bms-diagram.css'

export type PageKey = 'home' | 'chiller' | 'ahu' | 'pau' | 'fcu' | 'help'
export type EquipmentKind = 'chiller' | 'pump' | 'tower' | 'sensor' | 'flow' | 'ahu' | 'pau' | 'fcu'

export type Equipment = {
  id: string
  label: string
  kind: EquipmentKind
  x: number
  y: number
  width: number
  height: number
  on: boolean
  value?: string
  unit?: string
  status?: 'running' | 'stopped' | 'warning'
  iconType?: 'spau' | 'fan' | 'dhu' | 'ahu'
  mode?: 'auto' | 'manual'
  hz?: number
  setpoint?: number
  runHours?: number
}

type Props = {
  activePage: PageKey
  points: Equipment[]
  unitStatus: Record<string, boolean>
  faultedPoints: string[]
  editMode: boolean
  selectedEditId: string | null
  setSelectedEditId: (id: string | null) => void
  onSelectEquipment: (id: string) => void
  setSelectedUnit: (name: string) => void
  setActivePage: (page: PageKey) => void
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>, id: string) => void
  onResizePointerDown: (event: ReactPointerEvent<HTMLSpanElement>, id: string) => void
}

const pageBackgrounds: Record<PageKey, string> = {
  home: '/px/Backgound/CVI_Background1.jpg',
  help: '/px/Backgound/CVI_Background1.jpg',
  chiller: '/px/Backgound/BG_Chiller.jpg',
  ahu: '/px/Backgound/CVI_Background.jpg',
  pau: '/px/Backgound/BG_PAU.jpg',
  fcu: '/px/Backgound/BG_FCU.jpg',
}

const navHotspots: { page: PageKey; label: string; style: CSSProperties }[] = [
  { page: 'home', label: 'HOME', style: { left: '0%', top: '0%', width: '12%', height: '14%' } },
  { page: 'chiller', label: 'CHILLER', style: { left: '12.9%', top: '10.5%', width: '8.1%', height: '3.1%' } },
  { page: 'ahu', label: 'AHU', style: { left: '21.5%', top: '10.5%', width: '8.1%', height: '3.1%' } },
  { page: 'pau', label: 'PAU', style: { left: '29.6%', top: '10.5%', width: '8.1%', height: '3.1%' } },
  { page: 'fcu', label: 'FCU', style: { left: '38.0%', top: '10.5%', width: '8.6%', height: '3.1%' } },
  { page: 'help', label: 'HELP', style: { left: '46.9%', top: '10.5%', width: '8.1%', height: '3.1%' } },
]

function AssetImage({
  src,
  className,
  alt = '',
  style,
}: {
  src: string
  className?: string
  alt?: string
  style?: CSSProperties
}) {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return null
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      style={style}
      onError={(event) => {
        event.currentTarget.style.display = 'none'
      }}
    />
  )
}

function TripIcon({ faulted }: { faulted: boolean }) {
  return (
    <AssetImage
      className="trip-icon"
      src={faulted ? '/px/Images/Icon/Trip_On.png' : '/px/Images/Icon/Trip_Off.png'}
    />
  )
}

function ChillerNode({
  item,
  faulted,
  editMode,
  isSelected,
  onSelectEdit,
  onOpenFaceplate,
  onPointerDown,
  onResizePointerDown,
}: {
  item: Equipment
  faulted: boolean
  editMode: boolean
  isSelected: boolean
  onSelectEdit: () => void
  onOpenFaceplate: () => void
  onPointerDown: Props['onPointerDown']
  onResizePointerDown: Props['onResizePointerDown']
}) {
  const style: CSSProperties = {
    left: `${item.x}%`,
    top: `${item.y}%`,
    width: `${item.width}%`,
    height: `${item.height}%`,
  }

  const isEquipmentUnit = item.kind === 'chiller' || item.kind === 'pump' || item.kind === 'tower'
  const isSensorBadge = item.kind === 'sensor' || item.kind === 'flow'
  const isInteractiveSensor = item.id === 'SENS_DP' || item.id === 'FLOW_BYPASS_VSD'
  const isClickable = editMode || isEquipmentUnit || isInteractiveSensor

  const activeGif =
    item.kind === 'chiller'
      ? '/px/kitPxGraphics/Chillers/Mcquay/Chiller_Mcquay_On.gif'
      : item.kind === 'pump'
        ? '/px/kitPxGraphics/Pumps/Pumps_Base/Pump_Base_Right/Pump_Base_Right_On.gif'
        : '/px/kitPxGraphics/Chillers/CoolingTowers/DrawThru/CoolingTower_DrawThru_Right/CoolingTower_DrawThru_Right_On1.gif'

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (editMode) {
      onSelectEdit()
      return
    }
    if (isEquipmentUnit || isInteractiveSensor) {
      onOpenFaceplate()
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editMode) return
    event.stopPropagation()
    onSelectEdit()
    onPointerDown(event, item.id)
  }

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`equipment-node ${item.kind} ${item.on ? 'is-on' : 'is-off'} ${faulted ? 'is-faulted' : ''} ${isInteractiveSensor ? 'is-interactive-sensor' : ''} ${editMode ? 'is-editable' : ''} ${isSelected ? 'is-selected' : ''}`}
      style={style}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (!editMode && isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          e.stopPropagation()
          onOpenFaceplate()
        }
      }}
      onPointerDown={handlePointerDown}
      aria-label={
        isEquipmentUnit
          ? `${item.label}, ${faulted ? 'đang báo lỗi Trip' : item.on ? 'đang chạy' : 'đã dừng'}`
          : `${item.label}: ${item.value ?? ''}${item.unit ?? ''}`
      }
      title={
        editMode
          ? `${item.label} · kéo để di chuyển, kéo góc dưới phải để đổi kích thước`
          : isEquipmentUnit || isInteractiveSensor
            ? `${item.label} · Nhấn để mở bảng điều khiển & cài đặt`
            : item.label
      }
    >
      {isEquipmentUnit && (
        <>
          {item.on && <AssetImage className="equipment-art" src={activeGif} />}
          <span className="equipment-name">
            {item.label}
            {typeof item.hz === 'number' && (item.kind === 'pump' || item.kind === 'tower')
              ? ` · ${item.on ? item.hz.toFixed(1) : '0.0'}Hz`
              : ''}
          </span>
          <TripIcon faulted={faulted} />
          <span className="run-dot" />
        </>
      )}

      {isSensorBadge && (
        <span className="compact-badge" title={item.label}>
          <i className={`status-light ${item.on ? 'running' : 'stopped'}`} />
          <strong>
            {item.value}
            {item.unit ? <small>{item.unit}</small> : null}
          </strong>
        </span>
      )}

      {editMode && isSelected && (
        <span
          className="resize-handle"
          title="Kéo để thay đổi kích thước (hoặc giữ Shift + phím mũi tên)"
          onPointerDown={(event) => onResizePointerDown(event, item.id)}
          onClick={(event) => event.stopPropagation()}
        />
      )}
    </div>
  )
}

function ChillerDiagram({
function ChillerDiagram({
  points,
  faultedPoints,
  onSelectEquipment,
}: Pick<
  Props,
  | 'points'
  | 'faultedPoints'
  | 'editMode'
  | 'selectedEditId'
  | 'setSelectedEditId'
  | 'onSelectEquipment'
  | 'onPointerDown'
  | 'onResizePointerDown'
>) {
  const getPt = (id: string) => points.find((p) => p.id === id)
  const numVal = (id: string, fallback: number) => {
    const v = Number(getPt(id)?.value)
    return Number.isNaN(v) ? fallback : v
  }

  const ch1 = getPt('CHILLER_01')
  const ch2 = getPt('CHILLER_02')
  const chwp1 = getPt('CHWP_01')
  const chwp2 = getPt('CHWP_02')
  const ctwp1 = getPt('CTWP_01')
  const ctwp2 = getPt('CTWP_02')
  const ct1a = getPt('CT_01_A')
  const ct2a = getPt('CT_02_A')

  const chws = numVal('SENS_CHWS', 7.1)
  const chwr = numVal('SENS_CHWR', 12.4)
  const cws = numVal('SENS_CDWS', 27.8)
  const cwr = numVal('SENS_CDWR', 31.2)
  const dpBar = numVal('SENS_DP', 1.45)
  const bypass = numVal('FLOW_BYPASS_VSD', 32)

  const activeChillers = (ch1?.on ? 1 : 0) + (ch2?.on ? 1 : 0)
  const load = activeChillers === 2 ? 0.88 : activeChillers === 1 ? 0.52 : 0
  const tons = Math.round(load * 600)
  const kw = Math.round(tons * 0.62)
  const kwPerTon = tons > 0 ? kw / tons : 0
  const flow = activeChillers * 45 + (chwp1?.on ? 15 : 0) + (chwp2?.on ? 15 : 0)

  const plantData: ChillerPlant = {
    chws,
    chwr,
    cws,
    cwr,
    kw,
    kwPerTon,
    tons,
    flow,
    dp: dpBar * 100, // Đổi bar sang kPa
    bypass,
    chwp: [
      { id: 'CHWP-01', on: !!chwp1?.on, tripped: faultedPoints.includes('CHWP_01'), hz: chwp1?.hz ?? 0 },
      { id: 'CHWP-02', on: !!chwp2?.on, tripped: faultedPoints.includes('CHWP_02'), hz: chwp2?.hz ?? 0 },
    ],
    cwp: [
      { id: 'CTWP-01', on: !!ctwp1?.on, hz: ctwp1?.hz ?? 0 },
      { id: 'CTWP-02', on: !!ctwp2?.on, hz: ctwp2?.hz ?? 0 },
    ],
    towers: [
      { id: 'CT-01', on: !!ct1a?.on, hz: ct1a?.hz ?? 0 },
      { id: 'CT-02', on: !!ct2a?.on, hz: ct2a?.hz ?? 0 },
    ],
    chillers: [
      {
        id: 'CHILLER-01',
        on: !!ch1?.on && !faultedPoints.includes('CHILLER_01'),
        cmd: !!ch1?.on,
        plr: ch1?.on ? (activeChillers === 2 ? 0.88 : 0.72) : 0,
        kw: ch1?.on ? Math.round(kw / Math.max(1, activeChillers)) : 0,
        valve: ch1?.on ? 100 : 0,
      },
      {
        id: 'CHILLER-02',
        on: !!ch2?.on && !faultedPoints.includes('CHILLER_02'),
        cmd: !!ch2?.on,
        plr: ch2?.on ? 0.85 : 0,
        kw: ch2?.on ? Math.round(kw / Math.max(1, activeChillers)) : 0,
        valve: ch2?.on ? 100 : 0,
      },
    ],
  }

  return (
    <div className="relative h-full w-full overflow-auto bg-slate-50 p-3 flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center">
        <SvgChillerDiagram c={plantData} load={load} />
      </div>
      {/* Thanh truy cập nhanh Faceplate điều khiển từng thiết bị */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 border-t border-slate-200 pt-2">
        {points
          .filter((p) => p.kind === 'chiller' || p.kind === 'pump' || p.kind === 'tower' || p.id === 'SENS_DP' || p.id === 'FLOW_BYPASS_VSD')
          .map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectEquipment(item.id)}
              className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                faultedPoints.includes(item.id)
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : item.on
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
      </div>
    </div>
  )
}


function AhuDiagram({
  points,
  unitStatus,
  faultedPoints,
  editMode,
  selectedEditId,
  setSelectedEditId,
  onSelectEquipment,
  onPointerDown,
  onResizePointerDown,
}: Pick<
  Props,
  | 'points'
  | 'unitStatus'
  | 'faultedPoints'
  | 'editMode'
  | 'selectedEditId'
  | 'setSelectedEditId'
  | 'onSelectEquipment'
  | 'onPointerDown'
  | 'onResizePointerDown'
>) {
  return (
    <>
      {points.map((item) => {
        const overrideState = unitStatus[item.label]
        const isWarning = overrideState === undefined && item.status === 'warning'
        const isOn = overrideState !== undefined ? overrideState : item.on
        const isFaulted = faultedPoints.includes(item.id)
        const lightClass = isFaulted || isWarning ? 'warning' : isOn ? 'running' : 'stopped'
        const isSelected = editMode && selectedEditId === item.id

        const style: CSSProperties = {
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: `${item.width}%`,
          height: `${item.height}%`,
        }

        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            className={`equipment-node overlay-badge ahu-badge ${isOn ? 'is-on' : 'is-off'} ${editMode ? 'is-editable' : ''} ${isSelected ? 'is-selected' : ''}`}
            style={style}
            onClick={(event) => {
              event.stopPropagation()
              if (editMode) {
                setSelectedEditId(item.id)
                return
              }
              onSelectEquipment(item.id)
            }}
            onKeyDown={(e) => {
              if (!editMode && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                e.stopPropagation()
                onSelectEquipment(item.id)
              }
            }}
            onPointerDown={(event) => {
              if (!editMode) return
              event.stopPropagation()
              setSelectedEditId(item.id)
              onPointerDown(event, item.id)
            }}
            aria-label={`${item.label}, ${isFaulted ? 'lỗi Trip' : isWarning ? 'mất kết nối' : isOn ? 'đang chạy' : 'đã dừng'}`}
            title={editMode ? `${item.label} · kéo để chỉnh tọa độ/kích thước` : `${item.label} · Nhấn để xem thông số`}
          >
            <span className="ahu-badge-inner">
              <i className={`status-light ${lightClass}`} />
              <b>{item.label}</b>
              <small>{item.value ?? '22.5'}°</small>
            </span>

            {editMode && isSelected && (
              <span
                className="resize-handle"
                title="Kéo để thay đổi kích thước"
                onPointerDown={(event) => onResizePointerDown(event, item.id)}
                onClick={(event) => event.stopPropagation()}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

function PauDiagram({
  points,
  unitStatus,
  faultedPoints,
  editMode,
  selectedEditId,
  setSelectedEditId,
  onSelectEquipment,
  onPointerDown,
  onResizePointerDown,
}: Pick<
  Props,
  | 'points'
  | 'unitStatus'
  | 'faultedPoints'
  | 'editMode'
  | 'selectedEditId'
  | 'setSelectedEditId'
  | 'onSelectEquipment'
  | 'onPointerDown'
  | 'onResizePointerDown'
>) {
  return (
    <>
      {points.map((item) => {
        const isOn = unitStatus[item.label] !== undefined ? unitStatus[item.label] : item.on
        const isFaulted = faultedPoints.includes(item.id)
        const isSelected = editMode && selectedEditId === item.id

        const src =
          item.iconType === 'spau'
            ? isOn
              ? '/px/Images/Icon/PAU_icon1.png'
              : '/px/Images/Icon/PAU_icon.png'
            : item.iconType === 'fan'
              ? isOn
                ? '/px/Images/Icon/FAN_150x111_L_on.gif'
                : '/px/Images/Icon/FAN_150x111_L.png'
              : item.iconType === 'dhu'
                ? '/px/Images/Icon/DHU.png'
                : isOn
                  ? '/px/Images/Icon/AHU_150x65.gif'
                  : '/px/Images/Icon/AHU_150x65.png'

        const style: CSSProperties = {
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: `${item.width}%`,
          height: `${item.height}%`,
        }

        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            className={`equipment-node pau-overlay-unit ${isOn ? 'is-on' : 'is-off'} ${editMode ? 'is-editable' : ''} ${isSelected ? 'is-selected' : ''} ${isFaulted ? 'is-faulted' : ''}`}
            style={style}
            onClick={(event) => {
              event.stopPropagation()
              if (editMode) {
                setSelectedEditId(item.id)
                return
              }
              onSelectEquipment(item.id)
            }}
            onKeyDown={(e) => {
              if (!editMode && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                e.stopPropagation()
                onSelectEquipment(item.id)
              }
            }}
            onPointerDown={(event) => {
              if (!editMode) return
              event.stopPropagation()
              setSelectedEditId(item.id)
              onPointerDown(event, item.id)
            }}
            aria-label={`${item.label}, ${isFaulted ? 'lỗi Trip' : isOn ? 'đang chạy' : 'đã dừng'}`}
            title={editMode ? `${item.label} · kéo để chỉnh tọa độ/kích thước` : `${item.label} · Nhấn để điều khiển`}
          >
            <AssetImage className="pau-overlay-art" src={src} />
            <span className="pau-overlay-tag">
              <i className={`status-light ${isFaulted ? 'warning' : isOn ? 'running' : 'stopped'}`} />
              <b>{item.label}</b>
            </span>

            {editMode && isSelected && (
              <span
                className="resize-handle"
                title="Kéo để thay đổi kích thước"
                onPointerDown={(event) => onResizePointerDown(event, item.id)}
                onClick={(event) => event.stopPropagation()}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

function FcuDiagram({
  points,
  unitStatus,
  faultedPoints,
  editMode,
  selectedEditId,
  setSelectedEditId,
  onSelectEquipment,
  onPointerDown,
  onResizePointerDown,
}: Pick<
  Props,
  | 'points'
  | 'unitStatus'
  | 'faultedPoints'
  | 'editMode'
  | 'selectedEditId'
  | 'setSelectedEditId'
  | 'onSelectEquipment'
  | 'onPointerDown'
  | 'onResizePointerDown'
>) {
  return (
    <>
      {points.map((item) => {
        const isOn = unitStatus[item.label] !== undefined ? unitStatus[item.label] : item.on
        const isFaulted = faultedPoints.includes(item.id)
        const isSelected = editMode && selectedEditId === item.id

        const style: CSSProperties = {
          left: `${item.x}%`,
          top: `${item.y}%`,
          width: `${item.width}%`,
          height: `${item.height}%`,
        }

        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            className={`equipment-node fcu-overlay-badge ${isOn ? 'is-on' : 'is-off'} ${editMode ? 'is-editable' : ''} ${isSelected ? 'is-selected' : ''} ${isFaulted ? 'is-faulted' : ''}`}
            style={style}
            onClick={(event) => {
              event.stopPropagation()
              if (editMode) {
                setSelectedEditId(item.id)
                return
              }
              onSelectEquipment(item.id)
            }}
            onKeyDown={(e) => {
              if (!editMode && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                e.stopPropagation()
                onSelectEquipment(item.id)
              }
            }}
            onPointerDown={(event) => {
              if (!editMode) return
              event.stopPropagation()
              setSelectedEditId(item.id)
              onPointerDown(event, item.id)
            }}
            aria-label={`${item.label}, ${isFaulted ? 'lỗi Trip' : isOn ? 'đang chạy' : 'đã dừng'}`}
            title={editMode ? `${item.label} · kéo để chỉnh tọa độ/kích thước` : `${item.label} · Nhấn để chỉnh nhiệt độ & quạt`}
          >
            <span className="fcu-badge-inner">
              <AssetImage
                className="fcu-badge-icon"
                src={isOn ? '/px/Images/Icon/FCU_On.png' : '/px/Images/Icon/FCU_Off.png'}
              />
              <b>{item.label}</b>
              <strong>{item.value ?? '23.5'}°C</strong>
            </span>

            {editMode && isSelected && (
              <span
                className="resize-handle"
                title="Kéo để thay đổi kích thước"
                onPointerDown={(event) => onResizePointerDown(event, item.id)}
                onClick={(event) => event.stopPropagation()}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

function WelcomeCard({
  activePage,
  setActivePage,
}: {
  activePage: PageKey
  setActivePage: (page: PageKey) => void
}) {
  const isHelp = activePage === 'help'
  return (
    <div className="welcome-card">
      <div className="welcome-icon">
        <AlertTriangle />
      </div>
      <span className="eyebrow">BMS BUILDING · HVAC/BMS</span>
      <h2>{isHelp ? 'Trung tâm trợ giúp' : 'Mô phỏng Hệ thống Cơ điện'}</h2>
      <p>
        {isHelp
          ? 'Chọn khu vực để xem Giao diện Đồ họa Giám sát BMS, theo dõi thông số HVAC và thử các kịch bản Mô phỏng Hệ thống Cơ điện.'
          : 'Mô phỏng kỹ thuật HVAC/BMS, theo dõi trạng thái và điều khiển thiết bị trong tòa nhà.'}
      </p>
      <div className="welcome-cards">
        {[
          ['CHILLER', 'Hệ thống làm lạnh'],
          ['AHU', 'Xử lý không khí'],
          ['PAU', 'Cấp gió tươi'],
          ['FCU', 'Điều hòa khu vực'],
        ].map(([title, text], index) => (
          <button
            type="button"
            key={title}
            onClick={() => setActivePage((['chiller', 'ahu', 'pau', 'fcu'] as PageKey[])[index])}
          >
            <span>0{index + 1}</span>
            <b>{title}</b>
            <small>{text}</small>
            <ChevronRight />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function BmsDiagram(props: Props) {
  const { activePage, setActivePage } = props
  return (
    <div className={`graphic-canvas ${activePage === 'home' || activePage === 'help' ? 'home-canvas' : ''}`}>
      <AssetImage className="graphic-background" src={pageBackgrounds[activePage]} />
      {navHotspots.map((hotspot) => (
        <button
          key={hotspot.page}
          type="button"
          className={`nav-hotspot ${activePage === hotspot.page ? 'is-active' : ''}`}
          style={hotspot.style}
          onClick={() => setActivePage(hotspot.page)}
          aria-label={`Chuyển đến ${hotspot.label}`}
          title={hotspot.label}
        />
      ))}
      {activePage === 'chiller' && (
        <ChillerDiagram
          points={props.points}
          faultedPoints={props.faultedPoints}
          editMode={props.editMode}
          selectedEditId={props.selectedEditId}
          setSelectedEditId={props.setSelectedEditId}
          onSelectEquipment={props.onSelectEquipment}
          onPointerDown={props.onPointerDown}
          onResizePointerDown={props.onResizePointerDown}
        />
      )}
      {activePage === 'ahu' && (
        <AhuDiagram
          points={props.points}
          unitStatus={props.unitStatus}
          faultedPoints={props.faultedPoints}
          editMode={props.editMode}
          selectedEditId={props.selectedEditId}
          setSelectedEditId={props.setSelectedEditId}
          onSelectEquipment={props.onSelectEquipment}
          onPointerDown={props.onPointerDown}
          onResizePointerDown={props.onResizePointerDown}
        />
      )}
      {activePage === 'pau' && (
        <PauDiagram
          points={props.points}
          unitStatus={props.unitStatus}
          faultedPoints={props.faultedPoints}
          editMode={props.editMode}
          selectedEditId={props.selectedEditId}
          setSelectedEditId={props.setSelectedEditId}
          onSelectEquipment={props.onSelectEquipment}
          onPointerDown={props.onPointerDown}
          onResizePointerDown={props.onResizePointerDown}
        />
      )}
      {activePage === 'fcu' && (
        <FcuDiagram
          points={props.points}
          unitStatus={props.unitStatus}
          faultedPoints={props.faultedPoints}
          editMode={props.editMode}
          selectedEditId={props.selectedEditId}
          setSelectedEditId={props.setSelectedEditId}
          onSelectEquipment={props.onSelectEquipment}
          onPointerDown={props.onPointerDown}
          onResizePointerDown={props.onResizePointerDown}
        />
      )}
      {(activePage === 'home' || activePage === 'help') && (
        <WelcomeCard activePage={activePage} setActivePage={setActivePage} />
      )}
    </div>
  )
}
