'use client'

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
}

type Props = {
  activePage: PageKey
  points: Equipment[]
  unitStatus: Record<string, boolean>
  faultedPoints: string[]
  editMode: boolean
  selectedEditId: string | null
  setSelectedEditId: (id: string | null) => void
  setPoint: (id: string, on: boolean) => void
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
  onSelect,
  onToggle,
  onPointerDown,
  onResizePointerDown,
}: {
  item: Equipment
  faulted: boolean
  editMode: boolean
  isSelected: boolean
  onSelect: () => void
  onToggle: () => void
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

  const activeGif =
    item.kind === 'chiller'
      ? '/px/kitPxGraphics/Chillers/Mcquay/Chiller_Mcquay_On.gif'
      : item.kind === 'pump'
        ? '/px/kitPxGraphics/Pumps/Pumps_Base/Pump_Base_Right/Pump_Base_Right_On.gif'
        : '/px/kitPxGraphics/Chillers/CoolingTowers/DrawThru/CoolingTower_DrawThru_Right/CoolingTower_DrawThru_Right_On1.gif'

  const handleClick = () => {
    if (editMode) {
      onSelect()
      return
    }
    if (isEquipmentUnit) {
      onToggle()
    }
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editMode) return
    onSelect()
    onPointerDown(event, item.id)
  }

  return (
    <div
      role={isEquipmentUnit || editMode ? 'button' : undefined}
      tabIndex={isEquipmentUnit || editMode ? 0 : undefined}
      className={`equipment-node ${item.kind} ${item.on ? 'is-on' : 'is-off'} ${editMode ? 'is-editable' : ''} ${isSelected ? 'is-selected' : ''}`}
      style={style}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (!editMode && isEquipmentUnit && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onToggle()
        }
      }}
      onPointerDown={handlePointerDown}
      aria-label={
        isEquipmentUnit
          ? `${item.label}, ${item.on ? 'đang chạy' : 'đã dừng'}`
          : `${item.label}: ${item.value ?? ''}${item.unit ?? ''}`
      }
      title={
        editMode
          ? `${item.label} · kéo để di chuyển, kéo góc dưới phải để đổi kích thước`
          : item.label
      }
    >
      {isEquipmentUnit && (
        <>
          {item.on && <AssetImage className="equipment-art" src={activeGif} />}
          <span className="equipment-name">{item.label}</span>
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
  points,
  faultedPoints,
  editMode,
  selectedEditId,
  setSelectedEditId,
  setPoint,
  onPointerDown,
  onResizePointerDown,
}: Pick<
  Props,
  | 'points'
  | 'faultedPoints'
  | 'editMode'
  | 'selectedEditId'
  | 'setSelectedEditId'
  | 'setPoint'
  | 'onPointerDown'
  | 'onResizePointerDown'
>) {
  return (
    <>
      <AssetImage className="chiller-layout" src="/px/Layout/Chillerx.PNG" />
      <div className="schematic-title">
        <span className="eyebrow">SƠ ĐỒ NGUYÊN LÝ</span>
        <strong>Hệ thống Chiller trung tâm</strong>
        <span className="system-state">
          <i className="status-light running" /> ĐANG VẬN HÀNH
        </span>
      </div>
      {points.map((point) => (
        <ChillerNode
          key={point.id}
          item={point}
          faulted={faultedPoints.includes(point.id)}
          editMode={editMode}
          isSelected={editMode && selectedEditId === point.id}
          onSelect={() => setSelectedEditId(point.id)}
          onToggle={() => setPoint(point.id, !point.on)}
          onPointerDown={onPointerDown}
          onResizePointerDown={onResizePointerDown}
        />
      ))}
      <div className="canvas-footer">
        <span>CHILLER PLANT · CENTRAL COOLING</span>
        <span>CẬP NHẬT VỪA XONG</span>
      </div>
    </>
  )
}

function AhuDiagram({
  points,
  unitStatus,
  editMode,
  selectedEditId,
  setSelectedEditId,
  setSelectedUnit,
  onPointerDown,
  onResizePointerDown,
}: Pick<
  Props,
  | 'points'
  | 'unitStatus'
  | 'editMode'
  | 'selectedEditId'
  | 'setSelectedEditId'
  | 'setSelectedUnit'
  | 'onPointerDown'
  | 'onResizePointerDown'
>) {
  return (
    <>
      <div className="schematic-title">
        <span className="eyebrow">THIẾT BỊ XỬ LÝ KHÔNG KHÍ</span>
        <strong>Giám sát hệ thống AHU</strong>
        <span className="system-state">
          <i className="status-light running" /> {points.length} THIẾT BỊ
        </span>
      </div>

      {points.map((item) => {
        const overrideState = unitStatus[item.label]
        const isWarning = overrideState === undefined && item.status === 'warning'
        const isOn = overrideState !== undefined ? overrideState : item.on
        const lightClass = isWarning ? 'warning' : isOn ? 'running' : 'stopped'
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
            onClick={() => {
              if (editMode) {
                setSelectedEditId(item.id)
                return
              }
              setSelectedUnit(item.label)
            }}
            onKeyDown={(e) => {
              if (!editMode && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                setSelectedUnit(item.label)
              }
            }}
            onPointerDown={(event) => {
              if (!editMode) return
              setSelectedEditId(item.id)
              onPointerDown(event, item.id)
            }}
            aria-label={`${item.label}, ${isWarning ? 'mất kết nối' : isOn ? 'đang chạy' : 'đã dừng'}`}
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
  editMode,
  selectedEditId,
  setSelectedEditId,
  setSelectedUnit,
  onPointerDown,
  onResizePointerDown,
}: Pick<
  Props,
  | 'points'
  | 'unitStatus'
  | 'editMode'
  | 'selectedEditId'
  | 'setSelectedEditId'
  | 'setSelectedUnit'
  | 'onPointerDown'
  | 'onResizePointerDown'
>) {
  return (
    <>
      <div className="schematic-title">
        <span className="eyebrow">CẤP GIÓ TƯƠI & HÚT ẨM</span>
        <strong>Hệ thống PAU / DHU</strong>
        <span className="system-state">
          <i className="status-light running" /> {points.length} THIẾT BỊ
        </span>
      </div>

      {points.map((item) => {
        const isOn = unitStatus[item.label] !== undefined ? unitStatus[item.label] : item.on
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
            className={`equipment-node pau-overlay-unit ${isOn ? 'is-on' : 'is-off'} ${editMode ? 'is-editable' : ''} ${isSelected ? 'is-selected' : ''}`}
            style={style}
            onClick={() => {
              if (editMode) {
                setSelectedEditId(item.id)
                return
              }
              setSelectedUnit(item.label)
            }}
            onKeyDown={(e) => {
              if (!editMode && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                setSelectedUnit(item.label)
              }
            }}
            onPointerDown={(event) => {
              if (!editMode) return
              setSelectedEditId(item.id)
              onPointerDown(event, item.id)
            }}
            aria-label={`${item.label}, ${isOn ? 'đang chạy' : 'đã dừng'}`}
            title={editMode ? `${item.label} · kéo để chỉnh tọa độ/kích thước` : `${item.label} · Nhấn để điều khiển`}
          >
            <AssetImage className="pau-overlay-art" src={src} />
            <span className="pau-overlay-tag">
              <i className={`status-light ${isOn ? 'running' : 'stopped'}`} />
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
  editMode,
  selectedEditId,
  setSelectedEditId,
  setSelectedUnit,
  onPointerDown,
  onResizePointerDown,
}: Pick<
  Props,
  | 'points'
  | 'unitStatus'
  | 'editMode'
  | 'selectedEditId'
  | 'setSelectedEditId'
  | 'setSelectedUnit'
  | 'onPointerDown'
  | 'onResizePointerDown'
>) {
  return (
    <>
      <div className="schematic-title">
        <span className="eyebrow">THIẾT BỊ ĐIỀU HÒA KHU VỰC</span>
        <strong>Giám sát hệ thống FCU</strong>
        <span className="system-state">
          <i className="status-light running" /> {points.length} THIẾT BỊ
        </span>
      </div>

      {points.map((item) => {
        const isOn = unitStatus[item.label] !== undefined ? unitStatus[item.label] : item.on
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
            className={`equipment-node fcu-overlay-badge ${isOn ? 'is-on' : 'is-off'} ${editMode ? 'is-editable' : ''} ${isSelected ? 'is-selected' : ''}`}
            style={style}
            onClick={() => {
              if (editMode) {
                setSelectedEditId(item.id)
                return
              }
              setSelectedUnit(item.label)
            }}
            onKeyDown={(e) => {
              if (!editMode && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                setSelectedUnit(item.label)
              }
            }}
            onPointerDown={(event) => {
              if (!editMode) return
              setSelectedEditId(item.id)
              onPointerDown(event, item.id)
            }}
            aria-label={`${item.label}, ${isOn ? 'đang chạy' : 'đã dừng'}`}
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
          setPoint={props.setPoint}
          onPointerDown={props.onPointerDown}
          onResizePointerDown={props.onResizePointerDown}
        />
      )}
      {activePage === 'ahu' && (
        <AhuDiagram
          points={props.points}
          unitStatus={props.unitStatus}
          editMode={props.editMode}
          selectedEditId={props.selectedEditId}
          setSelectedEditId={props.setSelectedEditId}
          setSelectedUnit={props.setSelectedUnit}
          onPointerDown={props.onPointerDown}
          onResizePointerDown={props.onResizePointerDown}
        />
      )}
      {activePage === 'pau' && (
        <PauDiagram
          points={props.points}
          unitStatus={props.unitStatus}
          editMode={props.editMode}
          selectedEditId={props.selectedEditId}
          setSelectedEditId={props.setSelectedEditId}
          setSelectedUnit={props.setSelectedUnit}
          onPointerDown={props.onPointerDown}
          onResizePointerDown={props.onResizePointerDown}
        />
      )}
      {activePage === 'fcu' && (
        <FcuDiagram
          points={props.points}
          unitStatus={props.unitStatus}
          editMode={props.editMode}
          selectedEditId={props.selectedEditId}
          setSelectedEditId={props.setSelectedEditId}
          setSelectedUnit={props.setSelectedUnit}
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
