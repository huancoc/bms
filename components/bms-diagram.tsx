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
}

type Props = {
  activePage: PageKey
  points: Equipment[]
  unitStatus: Record<string, boolean>
  faultedPoints: string[]
  supplyTemp: number
  returnTemp: number
  pressure: number
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

const ahuNames = [
  'AHU-LM',
  ...Array.from({ length: 12 }, (_, i) => `AHU-${String(i + 1).padStart(2, '0')}`),
  'AHU-QC',
  'AHU-R&D',
  ...Array.from({ length: 4 }, (_, i) => `AHU-CX-${i + 1}`),
]
const fcuNames = Array.from({ length: 17 }, (_, i) => `FCU-${String(i + 1).padStart(2, '0')}`)
const pauNames = [
  'SPAU-01',
  'R-PAU-01',
  'SPAU-02',
  'DHU-04',
  'DHU-05',
  'AHU-01',
  'AHU-02',
  'AHU-03',
  'AHU-06',
  'AHU-08',
  'AHU-07',
  'AHU-09',
  'AHU-10',
  'AHU-11',
  'AHU-12',
]
const pauPositions: Record<string, CSSProperties> = {
  'SPAU-01': { left: '0%', top: '27.2%' },
  'R-PAU-01': { left: '3.2%', top: '16.2%' },
  'SPAU-02': { left: '65.2%', top: '26.2%' },
  'DHU-04': { left: '78.4%', top: '37.7%' },
  'DHU-05': { left: '84.9%', top: '37.7%' },
}
const pauFallbackPositions: CSSProperties[] = [
  { left: '5%', top: '58%' },
  { left: '22%', top: '58%' },
  { left: '39%', top: '58%' },
  { left: '56%', top: '58%' },
  { left: '73%', top: '58%' },
  { left: '7%', top: '77%' },
  { left: '23%', top: '77%' },
  { left: '39%', top: '77%' },
  { left: '56%', top: '77%' },
  { left: '73%', top: '77%' },
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

function EquipmentNode({
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

  const image =
    item.kind === 'chiller'
      ? item.on
        ? '/px/kitPxGraphics/Chillers/Mcquay/Chiller_Mcquay_On.gif'
        : '/px/kitPxGraphics/Chillers/Mcquay/Chiller_Mcquay_Off.png'
      : item.kind === 'pump'
        ? item.on
          ? '/px/kitPxGraphics/Pumps/Pumps_Base/Pump_Base_Right/Pump_Base_Right_On.gif'
          : '/px/kitPxGraphics/Pumps/Pumps_Base/Pump_Base_Right/Pump_Base_Right_Off.png'
        : '/px/kitPxGraphics/Chillers/CoolingTowers/DrawThru/CoolingTower_DrawThru_Right/CoolingTower_DrawThru_Right_On1.gif'

  const isTower = item.kind === 'tower'
  const towerOffsets = ['0%', '26.62%']

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
      title={editMode ? `${item.label} · kéo để di chuyển, kéo góc dưới phải để đổi kích thước` : item.label}
    >
      {item.kind === 'chiller' && (
        <>
          <AssetImage className="equipment-art" src={image} />
          <span className="equipment-name">{item.label}</span>
          <TripIcon faulted={faulted} />
          <span className="run-dot" />
        </>
      )}

      {item.kind === 'pump' && (
        <>
          <AssetImage className="equipment-art" src={image} />
          <span className="equipment-name">{item.label}</span>
          <TripIcon faulted={faulted} />
          <span className="run-dot" />
        </>
      )}

      {isTower && (
        <>
          <span className="tower-image-group">
            {towerOffsets.map((offset, index) => (
              <AssetImage
                key={index}
                className="equipment-art tower-art"
                src={image}
                style={{ left: offset }}
              />
            ))}
          </span>
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
        <EquipmentNode
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

function AhuDiagram({ unitStatus, setSelectedUnit }: Pick<Props, 'unitStatus' | 'setSelectedUnit'>) {
  return (
    <>
      <div className="schematic-title">
        <span className="eyebrow">THIẾT BỊ XỬ LÝ KHÔNG KHÍ</span>
        <strong>Giám sát hệ thống AHU</strong>
        <span className="system-state">
          <i className="status-light running" /> 18 THIẾT BỊ
        </span>
      </div>
      <div className="ahu-board">
        {ahuNames.map((name, index) => {
          const isOn = unitStatus[name] !== false
          return (
            <button
              type="button"
              key={name}
              className={`unit-card ${isOn ? '' : 'is-off'}`}
              onClick={() => setSelectedUnit(name)}
              aria-label={`${name}, ${isOn ? 'đang chạy' : 'đã dừng'}`}
            >
              <AssetImage
                className="unit-art"
                src={isOn ? '/px/Images/Icon/AHU_150x65.gif' : '/px/Images/Icon/AHU_150x65.png'}
              />
              <span className="unit-info">
                <b>{name}</b>
                <small>{index % 4 === 1 ? 'MẤT KẾT NỐI' : isOn ? 'ĐANG CHẠY' : 'DỪNG'}</small>
              </span>
              <i
                className={`status-light ${index % 4 === 1 ? 'warning' : isOn ? 'running' : 'stopped'}`}
              />
              <span className="unit-temp">{(22 + (index % 5) * 0.7).toFixed(1)}°</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

function PauDiagram({ unitStatus, setSelectedUnit }: Pick<Props, 'unitStatus' | 'setSelectedUnit'>) {
  return (
    <>
      <div className="schematic-title">
        <span className="eyebrow">CẤP GIÓ TƯƠI & HÚT ẨM</span>
        <strong>Hệ thống PAU / DHU</strong>
        <span className="system-state">
          <i className="status-light running" /> 15 THIẾT BỊ
        </span>
      </div>
      <div className="air-duct">
        <span>Gió tươi ngoài trời</span>
        <span>Không khí xử lý</span>
        <span>Cấp đến khu vực</span>
      </div>
      {pauNames.map((name, index) => {
        const isOn = unitStatus[name] !== false
        const src = name.startsWith('SPAU')
          ? isOn
            ? '/px/Images/Icon/PAU_icon1.png'
            : '/px/Images/Icon/PAU_icon.png'
          : name === 'R-PAU-01'
            ? isOn
              ? '/px/Images/Icon/FAN_150x111_L_on.gif'
              : '/px/Images/Icon/FAN_150x111_L.png'
            : name.startsWith('DHU')
              ? '/px/Images/Icon/DHU.png'
              : isOn
                ? '/px/Images/Icon/AHU_150x65.gif'
                : '/px/Images/Icon/AHU_150x65.png'
        const position = pauPositions[name] ?? pauFallbackPositions[index - 5]
        return (
          <button
            type="button"
            key={name}
            className={`pau-unit pau-${index} ${isOn ? '' : 'is-off'}`}
            style={position}
            onClick={() => setSelectedUnit(name)}
            aria-label={`${name}, ${isOn ? 'đang chạy' : 'đã dừng'}`}
          >
            <AssetImage className="pau-art" src={src} />
            <b>{name}</b>
            <i className={`status-light ${isOn ? 'running' : 'stopped'}`} />
          </button>
        )
      })}
    </>
  )
}

function FcuDiagram({ unitStatus, setSelectedUnit }: Pick<Props, 'unitStatus' | 'setSelectedUnit'>) {
  return (
    <>
      <div className="schematic-title">
        <span className="eyebrow">THIẾT BỊ ĐIỀU HÒA KHU VỰC</span>
        <strong>Giám sát hệ thống FCU</strong>
        <span className="system-state">
          <i className="status-light running" /> 17 THIẾT BỊ
        </span>
      </div>
      <div className="fcu-groups">
        {[
          { title: 'NHÀ XƯỞNG · TẦNG KỸ THUẬT', items: fcuNames.slice(0, 4) },
          { title: 'NHÀ XƯỞNG · TẦNG 1', items: fcuNames.slice(4, 14) },
          { title: 'KHU CHIẾT XUẤT · TẦNG 1', items: fcuNames.slice(14) },
        ].map((group) => (
          <div className="fcu-group" key={group.title}>
            <h3>{group.title}</h3>
            <div className="fcu-list">
              {group.items.map((name, index) => {
                const isOn = unitStatus[name] !== false
                return (
                  <button
                    type="button"
                    key={name}
                    className={`fcu-unit ${isOn ? '' : 'is-off'}`}
                    onClick={() => setSelectedUnit(name)}
                    aria-label={`${name}, ${isOn ? 'đang chạy' : 'đã dừng'}`}
                  >
                    <AssetImage
                      className="fcu-art"
                      src={isOn ? '/px/Images/Icon/FCU_On.png' : '/px/Images/Icon/FCU_Off.png'}
                    />
                    <span>
                      <b>{name}</b>
                      <small>Phòng {String(index + 101).padStart(3, '0')}</small>
                    </span>
                    <strong>{(22.5 + ((index * 7) % 25) / 10).toFixed(1)}°C</strong>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
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
      {activePage === 'chiller' && <ChillerDiagram {...props} />}
      {activePage === 'ahu' && <AhuDiagram unitStatus={props.unitStatus} setSelectedUnit={props.setSelectedUnit} />}
      {activePage === 'pau' && <PauDiagram unitStatus={props.unitStatus} setSelectedUnit={props.setSelectedUnit} />}
      {activePage === 'fcu' && <FcuDiagram unitStatus={props.unitStatus} setSelectedUnit={props.setSelectedUnit} />}
      {(activePage === 'home' || activePage === 'help') && (
        <WelcomeCard activePage={activePage} setActivePage={setActivePage} />
      )}
    </div>
  )
}
