'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import './bms-diagram.css'

type PageKey = 'home' | 'chiller' | 'ahu' | 'pau' | 'fcu' | 'help'
type Equipment = { id: string; label: string; kind: 'chiller' | 'pump' | 'tower' | 'ahu' | 'pau' | 'fcu'; x: number; y: number; on: boolean }
type Props = {
  activePage: PageKey
  points: Equipment[]
  unitStatus: Record<string, boolean>
  faultedPoints: string[]
  supplyTemp: number
  returnTemp: number
  pressure: number
  editMode: boolean
  setPoint: (id: string, on: boolean) => void
  setSelectedUnit: (name: string) => void
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>, id: string) => void
}

const pageBackgrounds: Record<PageKey, string> = {
  home: '/px/Backgound/CVI_Background1.jpg',
  help: '/px/Backgound/CVI_Background1.jpg',
  chiller: '/px/Backgound/BG_Chiller.jpg',
  ahu: '/px/Backgound/CVI_Background.jpg',
  pau: '/px/Backgound/BG_PAU.jpg',
  fcu: '/px/Backgound/BG_FCU.jpg',
}

const ahuNames = ['AHU-LM', ...Array.from({ length: 12 }, (_, i) => `AHU-${String(i + 1).padStart(2, '0')}`), 'AHU-QC', 'AHU-R&D', ...Array.from({ length: 4 }, (_, i) => `AHU-CX-${i + 1}`)]
const fcuNames = Array.from({ length: 17 }, (_, i) => `FCU-${String(i + 1).padStart(2, '0')}`)
const pauNames = ['SPAU-01', 'R-PAU-01', 'SPAU-02', 'DHU-04', 'DHU-05', 'AHU-01', 'AHU-02', 'AHU-03', 'AHU-06', 'AHU-08', 'AHU-07', 'AHU-09', 'AHU-10', 'AHU-11', 'AHU-12']
const pauPositions: Record<string, CSSProperties> = {
  'SPAU-01': { left: '0%', top: '27.2%' },
  'R-PAU-01': { left: '3.2%', top: '16.2%' },
  'SPAU-02': { left: '65.2%', top: '26.2%' },
  'DHU-04': { left: '78.4%', top: '37.7%' },
  'DHU-05': { left: '84.9%', top: '37.7%' },
}
const pauFallbackPositions: CSSProperties[] = [
  { left: '5%', top: '58%' }, { left: '22%', top: '58%' }, { left: '39%', top: '58%' }, { left: '56%', top: '58%' }, { left: '73%', top: '58%' },
  { left: '7%', top: '77%' }, { left: '23%', top: '77%' }, { left: '39%', top: '77%' }, { left: '56%', top: '77%' }, { left: '73%', top: '77%' },
]

function AssetImage({ src, className, alt = '', style }: { src: string; className?: string; alt?: string; style?: CSSProperties }) {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return null
  return <img className={className} src={src} alt={alt} aria-hidden={alt ? undefined : true} style={style} onError={(event) => { event.currentTarget.style.display = 'none' }} />
}

function Sensor({ title, value, unit = '', position }: { title: string; value: string; unit?: string; position: string }) {
  return <div className={`sensor ${position}`}><span>{title}</span><strong>{value}<small>{unit}</small></strong></div>
}

function TripIcon({ faulted }: { faulted: boolean }) {
  return <AssetImage className="trip-icon" src={faulted ? '/px/Images/Icon/Trip_On.png' : '/px/Images/Icon/Trip_Off.png'} />
}

function EquipmentImage({ item, faulted, editMode, onClick, onPointerDown }: { item: Equipment; faulted: boolean; editMode: boolean; onClick: () => void; onPointerDown: Props['onPointerDown'] }) {
  const dimensions = item.kind === 'tower' ? { width: '13.9%', height: '12%' } : { width: '9.4%', height: '11%' }
  const style: CSSProperties = { left: `${item.x}%`, top: `${item.y}%`, ...dimensions }
  const image = item.kind === 'chiller'
    ? item.on ? '/px/kitPxGraphics/Chillers/Mcquay/Chiller_Mcquay_On.gif' : '/px/kitPxGraphics/Chillers/Mcquay/Chiller_Mcquay_Off.png'
    : item.kind === 'pump'
      ? item.on ? '/px/kitPxGraphics/Pumps/Pumps_Base/Pump_Base_Right/Pump_Base_Right_On.gif' : '/px/kitPxGraphics/Pumps/Pumps_Base/Pump_Base_Right/Pump_Base_Right_Off.png'
      : '/px/kitPxGraphics/Chillers/CoolingTowers/DrawThru/CoolingTower_DrawThru_Right/CoolingTower_DrawThru_Right_On1.gif'
  const isTower = item.kind === 'tower'
  const towerOffsets = ['0%', '26.62%']

  return <button
    type="button"
    className={`equipment-node ${item.kind} ${item.on ? 'is-on' : 'is-off'} ${editMode ? 'is-editable' : ''}`}
    style={style}
    onClick={onClick}
    onPointerDown={(event) => editMode && onPointerDown(event, item.id)}
    aria-label={`${item.label}, ${item.on ? 'đang chạy' : 'đã dừng'}`}
    title={editMode ? `${item.label} · kéo để chỉnh tọa độ` : item.label}
  >
    {isTower ? <span className="tower-image-group">{towerOffsets.map((offset, index) => <AssetImage key={index} className="equipment-art tower-art" src={image} style={{ left: offset }} />)}</span> : <AssetImage className="equipment-art" src={image} />}
    <span className="equipment-name">{item.label}</span>
    <TripIcon faulted={faulted} />
    <span className="run-dot" />
  </button>
}

function ChillerDiagram({ points, faultedPoints, supplyTemp, returnTemp, pressure, editMode, setPoint, onPointerDown }: Pick<Props, 'points' | 'faultedPoints' | 'supplyTemp' | 'returnTemp' | 'pressure' | 'editMode' | 'setPoint' | 'onPointerDown'>) {
  return <>
    <AssetImage className="chiller-layout" src="/px/Layout/Chillerx.PNG" />
    <div className="schematic-title"><span className="eyebrow">SƠ ĐỒ NGUYÊN LÝ</span><strong>Hệ thống Chiller trung tâm</strong><span className="system-state"><i className="status-light running" /> ĐANG VẬN HÀNH</span></div>
    {points.map((point) => <EquipmentImage key={point.id} item={point} faulted={faultedPoints.includes(point.id)} editMode={editMode} onClick={() => setPoint(point.id, !point.on)} onPointerDown={onPointerDown} />)}
    <Sensor title="Nước giải nhiệt hồi" value="31.2" unit="°C" position="sensor-hot-return" />
    <Sensor title="Nước giải nhiệt cấp" value="27.8" unit="°C" position="sensor-hot-supply" />
    <Sensor title="Nước lạnh hồi" value={returnTemp.toFixed(1)} unit="°C" position="sensor-cold-return" />
    <Sensor title="Nước lạnh cấp" value={supplyTemp.toFixed(1)} unit="°C" position="sensor-cold-supply" />
    <div className="sensor pressure-sensor"><span>CHÊNH ÁP ĐƯỜNG ỐNG</span><strong>{pressure.toFixed(2)}<small> bar</small></strong><em>SP 1.50 bar</em></div>
    <div className="sensor bypass-sensor"><span>BYPASS VSD</span><strong>32<small>%</small></strong></div>
    <div className="flow-label flow-one"><i className="status-light running" /> FS MỞ</div>
    <div className="flow-label flow-two"><i className="status-light stopped" /> FS ĐÓNG</div>
    <div className="canvas-footer"><span>CHILLER PLANT · CENTRAL COOLING</span><span>CẬP NHẬT VỪA XONG</span></div>
  </>
}

function AhuDiagram({ unitStatus, setSelectedUnit }: Pick<Props, 'unitStatus' | 'setSelectedUnit'>) {
  return <>
    <div className="schematic-title"><span className="eyebrow">THIẾT BỊ XỬ LÝ KHÔNG KHÍ</span><strong>Giám sát hệ thống AHU</strong><span className="system-state"><i className="status-light running" /> 18 THIẾT BỊ</span></div>
    <div className="ahu-board">{ahuNames.map((name, index) => {
      const isOn = unitStatus[name] !== false
      return <button type="button" key={name} className={`unit-card ${isOn ? '' : 'is-off'}`} onClick={() => setSelectedUnit(name)} aria-label={`${name}, ${isOn ? 'đang chạy' : 'đã dừng'}`}>
        <AssetImage className="unit-art" src={isOn ? '/px/Images/Icon/AHU_150x65.gif' : '/px/Images/Icon/AHU_150x65.png'} />
        <span className="unit-info"><b>{name}</b><small>{index % 4 === 1 ? 'MẤT KẾT NỐI' : isOn ? 'ĐANG CHẠY' : 'DỪNG'}</small></span>
        <i className={`status-light ${index % 4 === 1 ? 'warning' : isOn ? 'running' : 'stopped'}`} />
        <span className="unit-temp">{(22 + (index % 5) * .7).toFixed(1)}°</span>
      </button>
    })}</div>
  </>
}

function PauDiagram({ unitStatus, setSelectedUnit }: Pick<Props, 'unitStatus' | 'setSelectedUnit'>) {
  return <>
    <div className="schematic-title"><span className="eyebrow">CẤP GIÓ TƯƠI & HÚT ẨM</span><strong>Hệ thống PAU / DHU</strong><span className="system-state"><i className="status-light running" /> 15 THIẾT BỊ</span></div>
    <div className="air-duct"><span>Gió tươi ngoài trời</span><span>Không khí xử lý</span><span>Cấp đến khu vực</span></div>
    {pauNames.map((name, index) => {
      const isOn = unitStatus[name] !== false
      const src = name.startsWith('SPAU')
        ? isOn ? '/px/Images/Icon/PAU_icon1.png' : '/px/Images/Icon/PAU_icon.png'
        : name === 'R-PAU-01'
          ? isOn ? '/px/Images/Icon/FAN_150x111_L_on.gif' : '/px/Images/Icon/FAN_150x111_L.png'
          : name.startsWith('DHU')
            ? '/px/Images/Icon/DHU.png'
            : isOn ? '/px/Images/Icon/AHU_150x65.gif' : '/px/Images/Icon/AHU_150x65.png'
      const position = pauPositions[name] ?? pauFallbackPositions[index - 5]
      return <button type="button" key={name} className={`pau-unit pau-${index} ${isOn ? '' : 'is-off'}`} style={position} onClick={() => setSelectedUnit(name)} aria-label={`${name}, ${isOn ? 'đang chạy' : 'đã dừng'}`}>
        <AssetImage className="pau-art" src={src} />
        <b>{name}</b>
        <i className={`status-light ${isOn ? 'running' : 'stopped'}`} />
      </button>
    })}
  </>
}

function FcuDiagram({ unitStatus, setSelectedUnit }: Pick<Props, 'unitStatus' | 'setSelectedUnit'>) {
  return <>
    <div className="schematic-title"><span className="eyebrow">THIẾT BỊ ĐIỀU HÒA KHU VỰC</span><strong>Giám sát hệ thống FCU</strong><span className="system-state"><i className="status-light running" /> 17 THIẾT BỊ</span></div>
    <div className="fcu-groups">{[
      { title: 'NHÀ XƯỞNG · TẦNG KỸ THUẬT', items: fcuNames.slice(0, 4) },
      { title: 'NHÀ XƯỞNG · TẦNG 1', items: fcuNames.slice(4, 14) },
      { title: 'KHU CHIẾT XUẤT · TẦNG 1', items: fcuNames.slice(14) },
    ].map((group) => <div className="fcu-group" key={group.title}>
      <h3>{group.title}</h3>
      <div className="fcu-list">{group.items.map((name, index) => {
        const isOn = unitStatus[name] !== false
        return <button type="button" key={name} className={`fcu-unit ${isOn ? '' : 'is-off'}`} onClick={() => setSelectedUnit(name)} aria-label={`${name}, ${isOn ? 'đang chạy' : 'đã dừng'}`}>
          <AssetImage className="fcu-art" src={isOn ? '/px/Images/Icon/FCU_On.png' : '/px/Images/Icon/FCU_Off.png'} />
          <span><b>{name}</b><small>Phòng {String(index + 101).padStart(3, '0')}</small></span>
          <strong>{(22.5 + ((index * 7) % 25) / 10).toFixed(1)}°C</strong>
        </button>
      })}</div>
    </div>)}</div>
  </>
}

function WelcomeCard({ activePage, setActivePage }: { activePage: PageKey; setActivePage: (page: PageKey) => void }) {
  const isHelp = activePage === 'help'
  return <div className="welcome-card">
    <div className="welcome-icon"><AlertTriangle /></div>
    <span className="eyebrow">BMS BUILDING · HVAC/BMS</span>
    <h2>{isHelp ? 'Trung tâm trợ giúp' : 'Mô phỏng Hệ thống Cơ điện'}</h2>
    <p>{isHelp ? 'Chọn khu vực để xem Giao diện Đồ họa Giám sát BMS, theo dõi thông số HVAC và thử các kịch bản Mô phỏng Hệ thống Cơ điện.' : 'Mô phỏng kỹ thuật HVAC/BMS, theo dõi trạng thái và điều khiển thiết bị trong tòa nhà.'}</p>
    <div className="welcome-cards">{[['CHILLER', 'Hệ thống làm lạnh'], ['AHU', 'Xử lý không khí'], ['PAU', 'Cấp gió tươi'], ['FCU', 'Điều hòa khu vực']].map(([title, text], index) => <button type="button" key={title} onClick={() => setActivePage((['chiller', 'ahu', 'pau', 'fcu'] as PageKey[])[index])}><span>0{index + 1}</span><b>{title}</b><small>{text}</small><ChevronRight /></button>)}</div>
  </div>
}

export default function BmsDiagram(props: Props & { setActivePage: (page: PageKey) => void }) {
  const { activePage } = props
  return <div className={`graphic-canvas ${activePage === 'home' || activePage === 'help' ? 'home-canvas' : ''}`}>
    <AssetImage className="graphic-background" src={pageBackgrounds[activePage]} />
    {activePage === 'chiller' && <ChillerDiagram {...props} />}
    {activePage === 'ahu' && <AhuDiagram unitStatus={props.unitStatus} setSelectedUnit={props.setSelectedUnit} />}
    {activePage === 'pau' && <PauDiagram unitStatus={props.unitStatus} setSelectedUnit={props.setSelectedUnit} />}
    {activePage === 'fcu' && <FcuDiagram unitStatus={props.unitStatus} setSelectedUnit={props.setSelectedUnit} />}
    {(activePage === 'home' || activePage === 'help') && <WelcomeCard activePage={activePage} setActivePage={props.setActivePage} />}
  </div>
}
