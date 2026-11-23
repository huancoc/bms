.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #0f1720;
  color: #e6edf3;
}

.compact-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 40px;
  min-height: 40px;
  max-height: 40px;
  padding: 0 10px;
  background: #141f2b;
  border-bottom: 1px solid #263648;
  z-index: 20;
}

.compact-brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  letter-spacing: 0.04em;
  color: #f0f6fc;
  flex-shrink: 0;
}

.compact-brand-icon {
  width: 16px;
  height: 16px;
  color: #2dd4bf;
}

.compact-nav {
  display: flex;
  align-items: center;
  gap: 3px;
  overflow-x: auto;
  scrollbar-width: none;
}

.compact-nav::-webkit-scrollbar {
  display: none;
}

.compact-nav-btn {
  height: 28px;
  padding: 0 9px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: #9fb0c2;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.compact-nav-btn:hover {
  color: #f0f6fc;
  background: rgba(255, 255, 255, 0.06);
}

.compact-nav-btn.active {
  color: #5eead4;
  background: rgba(20, 184, 166, 0.16);
  border-color: rgba(45, 212, 191, 0.45);
}

.compact-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.compact-stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #cbd5e1;
  white-space: nowrap;
}

.compact-weather {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #263648;
  font-size: 11px;
  color: #e2e8f0;
  white-space: nowrap;
}

.compact-weather svg {
  width: 13px;
  height: 13px;
  color: #fbbf24;
}

.compact-drawer-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 9px;
  border-radius: 5px;
  border: 1px solid #33485e;
  background: #1c2b3b;
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.compact-drawer-btn svg {
  width: 13px;
  height: 13px;
}

.compact-drawer-btn.selected,
.compact-drawer-btn:hover {
  border-color: #2dd4bf;
  color: #5eead4;
}

.workspace {
  display: flex;
  flex: 1;
  min-height: calc(100dvh - 40px);
  width: 100%;
  overflow: hidden;
}

.graphic-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: #0d141c;
  overflow: auto;
}

.graphic-canvas {
  position: relative;
  width: 100%;
  max-width: 100%;
  max-height: calc(100dvh - 48px);
  min-height: 0 !important;
  aspect-ratio: 1855 / 955;
  isolation: isolate;
  background: #9da8af;
  color: #172734;
  overflow: hidden;
}

.graphic-canvas::before,
.graphic-canvas.home-canvas::before {
  content: none;
}

.graphic-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.nav-hotspot {
  position: absolute;
  z-index: 2;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.nav-hotspot:focus-visible {
  outline: 2px solid #2dd4bf;
  outline-offset: -2px;
}

.chiller-layout {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.equipment-node {
  position: absolute;
  z-index: 3;
  display: block;
  min-height: 0;
  padding: 0;
  overflow: visible;
  transform: none;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #172734;
  box-shadow: none;
  cursor: pointer;
  touch-action: manipulation;
  transition: filter 0.16s ease;
}

.equipment-node:hover {
  z-index: 5;
  transform: none;
  box-shadow: none;
  filter: brightness(1.08);
}

.equipment-node.is-editable {
  border: 1px dashed #087f71;
  cursor: grab;
  touch-action: none;
}

.equipment-node.is-editable:active {
  cursor: grabbing;
}

.equipment-node.is-selected {
  z-index: 6;
  border: 2px dashed #2563eb !important;
  background: rgba(37, 99, 235, 0.08);
}

.resize-handle {
  position: absolute;
  right: -5px;
  bottom: -5px;
  z-index: 10;
  width: 11px;
  height: 11px;
  border-radius: 2px;
  background: #2563eb;
  border: 1.5px solid #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
  cursor: nwse-resize;
  touch-action: none;
}

.equipment-art {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.tower-image-group {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tower-art {
  right: auto;
  width: 73.38%;
  height: 100%;
}

.equipment-node.tower.is-off .tower-art {
  opacity: 0;
}

.equipment-name {
  position: absolute;
  left: 50%;
  bottom: -18px;
  transform: translateX(-50%);
  padding: 3px 5px;
  border: 1px solid #b3c0c5;
  border-radius: 3px;
  background: #e4e9e8ed;
  color: #243947;
  font-size: clamp(6px, 0.5vw, 9px);
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
  pointer-events: none;
}

.trip-icon {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  width: 17%;
  height: 30%;
  object-fit: contain;
  pointer-events: none;
}

.equipment-node.tower .trip-icon {
  width: 12.23%;
  height: 27.5%;
}

.run-dot {
  position: absolute;
  top: 4%;
  left: 4%;
  width: 7%;
  height: 7%;
  border-radius: 50%;
  background: #ef6570;
  pointer-events: none;
}

.equipment-node.is-on .run-dot {
  background: #41c987;
  box-shadow: 0 0 5px #41c987;
}

.equipment-node.is-off {
  opacity: 1;
  filter: none;
}

.equipment-node.sensor,
.equipment-node.flow {
  z-index: 4;
  cursor: default;
}

.equipment-node.sensor.is-editable,
.equipment-node.flow.is-editable {
  cursor: grab;
}

.compact-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 100%;
  height: 100%;
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(15, 23, 32, 0.84);
  border: 1px solid rgba(148, 163, 184, 0.45);
  color: #f8fafc;
  font-size: clamp(7px, 0.58vw, 10px);
  line-height: 1;
  white-space: nowrap;
  pointer-events: none;
}

.compact-badge strong {
  font-weight: 700;
  letter-spacing: -0.01em;
}

.compact-badge small {
  font-size: 0.85em;
  opacity: 0.85;
  font-weight: 600;
}

.compact-badge .status-light {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
}

.ahu-board {
  z-index: 1;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(5, minmax(0, 1fr));
}

.unit-card {
  min-height: 0;
}

.unit-art {
  width: min(35%, 84px);
  height: 72%;
  flex: none;
  object-fit: contain;
}

.unit-card.is-off .unit-art,
.fcu-unit:has(.fcu-art[src$="FCU_Off.png"]) .fcu-art {
  filter: grayscale(0.5);
}

.air-duct {
  z-index: 0;
}

.pau-unit {
  z-index: 1;
  width: 9.5%;
  height: 15%;
  min-width: 54px;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 3px;
}

.pau-art {
  width: 80%;
  height: 72%;
  object-fit: contain;
}

.pau-unit b {
  font-size: clamp(6px, 0.48vw, 9px);
  white-space: nowrap;
}

.pau-unit .status-light {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 5px;
  height: 5px;
}

.pau-unit.is-off .pau-art {
  filter: grayscale(0.65);
}

.fcu-groups {
  z-index: 1;
  grid-template-columns: 1fr 1.45fr 1fr;
}

.fcu-unit {
  min-height: 27px;
}

.fcu-art {
  width: 23px;
  height: 23px;
  flex: none;
  object-fit: contain;
}

.welcome-card {
  left: 2.2%;
  top: 19.9%;
  width: 58.2%;
  height: 71.2%;
  padding: 3%;
  overflow: auto;
}

.edit-inspector {
  margin-top: 10px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.35);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inspector-select-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: #cbd5e1;
}

.inspector-select-row select {
  padding: 5px 7px;
  border-radius: 6px;
  border: 1px solid #33485e;
  background: #131d28;
  color: #f8fafc;
  font-size: 12px;
}

.coord-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.coord-grid label {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  color: #93c5fd;
}

.coord-grid input {
  width: 100%;
  padding: 5px 6px;
  border-radius: 5px;
  border: 1px solid #33485e;
  background: #0f1720;
  color: #f8fafc;
  font-size: 12px;
}

.inspector-hint {
  margin: 0;
  font-size: 10.5px;
  color: #94a3b8;
  line-height: 1.35;
}

.copy-json-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid #2dd4bf;
  background: rgba(20, 184, 166, 0.18);
  color: #5eead4;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.copy-json-btn svg {
  width: 14px;
  height: 14px;
}

.copy-json-btn:hover {
  background: rgba(20, 184, 166, 0.28);
}

@media (max-width: 1100px) {
  .graphic-canvas {
    min-height: 0 !important;
  }

  .equipment-node {
    min-height: 0;
  }

  .equipment-node.chiller {
    min-height: 0;
  }
}

@media (max-width: 760px) {
  .compact-stat {
    display: none;
  }

  .graphic-canvas {
    min-height: 0 !important;
  }

  .welcome-card {
    padding: 2.5%;
  }

  .welcome-icon {
    margin-bottom: 6px;
  }

  .welcome-card h2 {
    margin: 5px 0;
  }

  .welcome-card > p {
    font-size: 8px;
    line-height: 1.35;
  }

  .welcome-cards {
    gap: 4px;
    margin-top: 8px;
  }

  .welcome-cards button {
    padding: 5px;
  }

  .ahu-board {
    inset: 20% 3% 5%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(6, minmax(0, 1fr));
    gap: 4px;
  }

  .unit-card {
    gap: 4px;
    padding: 4px;
  }

  .unit-art {
    width: 25%;
  }

  .pau-unit {
    min-width: 0;
    padding: 2px;
  }

  .fcu-groups {
    inset: 20% 2% 3%;
    gap: 4px;
  }

  .fcu-group {
    padding: 4px;
  }

  .fcu-group h3 {
    font-size: 6px;
  }

  .fcu-unit {
    gap: 3px;
    padding: 3px;
  }
}
