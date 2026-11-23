const PX_WIDTH = 1855;
const PX_HEIGHT = 955;
const CHILLER_SAMPLE_VALUES = ['27.8°C', '31.2°C', '12.4°C', '7.1°C', '1.45bar', '32%'];
const PAGE_CONFIG = {
  home: { title: 'Home', file: '/px/Home.px', background: '/px/Backgound/Home_BG.jpg' },
  chiller: { title: 'Chiller', file: '/px/CHILLER.px', background: '/px/Backgound/BG_Chiller.jpg' },
  help: { title: 'Help', file: '/px/HELP/Help.px', background: '/px/Backgound/BG_Help.jpg' },
  ahu: { title: 'AHU', file: '/px/AHU_Main.px', background: '/px/Backgound/BG_AHU.jpg' },
  pau: { title: 'PAU', file: '/px/PAU_Main.px', background: '/px/Backgound/BG_PAU.jpg' },
  fcu: { title: 'FCU', file: '/px/FCU_Main.px', background: '/px/Backgound/BG_FCU.jpg' },
};

const state = {
  activePage: 'chiller',
  selectedId: null,
  editMode: false,
  showVirtual: true,
  pages: new Map(),
  drag: null,
  toastTimeout: null,
  exportedJson: '',
};

const elements = {
  stage: document.querySelector('#stage'),
  stageBackground: document.querySelector('#stage-background'),
  stageOverlay: document.querySelector('#stage-overlay'),
  stageElements: document.querySelector('#stage-elements'),
  stageLoading: document.querySelector('#canvas-loading'),
  pageStatus: document.querySelector('#page-status'),
  canvasPageTitle: document.querySelector('#canvas-page-title'),
  canvasSize: document.querySelector('#canvas-size'),
  canvasElementCount: document.querySelector('#canvas-element-count'),
  itemCount: document.querySelector('#item-count'),
  elementList: document.querySelector('#element-list'),
  search: document.querySelector('#element-search'),
  emptyInspector: document.querySelector('#empty-inspector'),
  inspectorContent: document.querySelector('#inspector-content'),
  selectedIcon: document.querySelector('#selected-icon'),
  selectedType: document.querySelector('#selected-type'),
  selectedName: document.querySelector('#selected-name'),
  coordX: document.querySelector('#coord-x'),
  coordY: document.querySelector('#coord-y'),
  elementSize: document.querySelector('#element-size'),
  statusRow: document.querySelector('#status-row'),
  statusToggle: document.querySelector('#status-toggle'),
  virtualValueRow: document.querySelector('#virtual-value-row'),
  virtualValue: document.querySelector('#virtual-value'),
  jsonPreview: document.querySelector('#json-preview'),
  copyJson: document.querySelector('#copy-json'),
  toast: document.querySelector('#toast'),
  editToggle: document.querySelector('#edit-toggle'),
  virtualToggle: document.querySelector('#virtual-toggle'),
  editHint: document.querySelector('#edit-hint'),
  copyCoordinates: document.querySelector('#copy-coordinates'),
  resetPage: document.querySelector('#reset-page'),
};

function cleanText(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function sourcePath(value) {
  if (!value) return '';
  return value.replace(/^file:\^px\//, '/px/').replace(/^file:\/px\//, '/px/');
}

function parseLayout(element) {
  const values = (element.getAttribute('layout') || '').split(',').map(Number);
  if (values.length < 4 || values.slice(0, 4).some((value) => !Number.isFinite(value))) return null;
  return { x: values[0], y: values[1], width: values[2], height: values[3] };
}

function elementTitle(node, binding, index, pageKey) {
  const literal = cleanText(node.getAttribute('text'));
  if (literal) return literal;
  const stateText = Array.from(node.querySelectorAll('String')).map((item) => cleanText(item.getAttribute('value'))).find(Boolean);
  if (stateText && !stateText.includes('file:')) return stateText;
  const popupTitle = node.querySelector('PopupBinding')?.getAttribute('title');
  if (popupTitle) return popupTitle;
  const pointName = binding?.split('/').filter(Boolean).at(-1);
  if (pointName) return pointName.replaceAll('_', ' ');
  return `${PAGE_CONFIG[pageKey].title} element ${String(index).padStart(2, '0')}`;
}

function bindingName(node) {
  const binding = node.querySelector('ValueBinding, BoundLabelBinding');
  return binding?.getAttribute('ord') || '';
}

function imageBinding(node) {
  const trueImage = node.querySelector('Image[name="trueValue"]')?.getAttribute('value');
  const falseImage = node.querySelector('Image[name="falseValue"]')?.getAttribute('value');
  return { on: sourcePath(trueImage), off: sourcePath(falseImage) };
}

function staticImage(node) {
  return sourcePath(node.getAttribute('image'));
}

function isTrip(imagePair, node) {
  const paths = `${imagePair.on} ${imagePair.off} ${node.querySelector('Picture')?.getAttribute('image') || ''}`;
  return /trip/i.test(paths);
}

function sampleValue(binding, index, pageKey) {
  if (pageKey === 'chiller' && index < CHILLER_SAMPLE_VALUES.length) return CHILLER_SAMPLE_VALUES[index];
  if (/temp|temperature/i.test(binding)) return ['22.6°C', '23.1°C', '24.0°C'][index % 3];
  if (/press/i.test(binding)) return ['1.2 bar', '1.4 bar', '1.1 bar'][index % 3];
  if (/humidity|rh/i.test(binding)) return `${48 + (index % 8)}%`;
  return `${21 + (index % 5)}°C`;
}

function classify(node, imagePair, text, binding, pageKey) {
  if (imagePair.on || imagePair.off) return isTrip(imagePair, node) ? 'trip' : 'equipment';
  if (/flow|switch|fs[_\s-]/i.test(`${text} ${binding}`)) return 'flow-switch';
  if (/ObjectToString|temp|press|humidity|\brh\b/i.test(`${node.innerHTML} ${binding}`)) return 'point';
  if (text) return 'label';
  return 'point';
}

function parsePage(xml, pageKey) {
  const parsed = new DOMParser().parseFromString(xml, 'application/xml');
  if (parsed.querySelector('parsererror')) throw new Error(`Could not read ${PAGE_CONFIG[pageKey].file}`);
  const canvas = parsed.querySelector('CanvasPane');
  if (!canvas) throw new Error(`No CanvasPane in ${PAGE_CONFIG[pageKey].file}`);

  const viewSize = (canvas.getAttribute('viewSize') || `${PX_WIDTH},${PX_HEIGHT}`).split(',').map(Number);
  const width = viewSize[0] || PX_WIDTH;
  const height = viewSize[1] || PX_HEIGHT;
  const children = Array.from(canvas.children);
  const backgroundNode = children.find((node) => node.tagName === 'Picture' && staticImage(node));
  const background = PAGE_CONFIG[pageKey].background || (backgroundNode ? staticImage(backgroundNode) : '');
  const output = [];
  let chillerPointIndex = 0;

  children.forEach((node, index) => {
    if (node === backgroundNode) return;
    const layout = parseLayout(node);
    if (!layout || layout.y > height - 35) return;

    const pair = imageBinding(node);
    const image = staticImage(node);
    if (layout.y < 145 && !/Layout\//i.test(image)) return;
    const text = cleanText(node.getAttribute('text'));
    const binding = bindingName(node);
    const hasBoundImage = Boolean(pair.on || pair.off);
    const hasStaticOverlay = Boolean(image && !/\.jpe?g$/i.test(image) && /Layout\//i.test(image));

    if (hasStaticOverlay) {
      output.push({
        id: `${pageKey}-base-overlay-${index}`,
        name: 'Equipment and piping overlay',
        category: 'base-overlay',
        layout,
        xPercent: ((layout.x + layout.width / 2) / width) * 100,
        yPercent: ((layout.y + layout.height / 2) / height) * 100,
        source: image,
        visible: true,
        draggable: false,
      });
      return;
    }

    if (hasBoundImage || (node.tagName === 'Picture' && /trip/i.test(image))) {
      const category = isTrip(pair, node) || /trip/i.test(image) ? 'trip' : classify(node, pair, text, binding, pageKey);
      output.push({
        id: `${pageKey}-item-${index}`,
        name: elementTitle(node, binding, index, pageKey),
        category,
        layout,
        xPercent: ((layout.x + layout.width / 2) / width) * 100,
        yPercent: ((layout.y + layout.height / 2) / height) * 100,
        onImage: pair.on,
        offImage: pair.off,
        isOn: category === 'trip' ? false : true,
        visible: true,
        binding,
        virtual: category === 'point',
      });
      return;
    }

    if (node.tagName === 'Picture' && image) {
      output.push({
        id: `${pageKey}-item-${index}`,
        name: elementTitle(node, binding, index, pageKey),
        category: 'equipment',
        layout,
        xPercent: ((layout.x + layout.width / 2) / width) * 100,
        yPercent: ((layout.y + layout.height / 2) / height) * 100,
        onImage: image,
        offImage: '',
        isOn: true,
        visible: true,
        binding,
      });
      return;
    }

    const nestedText = Array.from(node.querySelectorAll('String'))
      .map((item) => cleanText(item.getAttribute('value')))
      .filter((value) => value && !value.startsWith('file:'));
    const label = text || nestedText.find((value) => !['ON', 'OFF', 'Mở', 'Đóng'].includes(value)) || '';
    const isFlow = /flow|switch|\bfs\b/i.test(`${label} ${binding}`) || nestedText.some((value) => /mở|đóng|open|closed/i.test(value));
    const hasTextValueBinding = Boolean(node.querySelector('ObjectToString') || /temp|press|humidity|flow/i.test(binding));
    if (!label && !isFlow && !hasTextValueBinding) return;

    const category = isFlow ? 'flow-switch' : hasTextValueBinding ? 'point' : 'label';
    let display = label;
    if (hasTextValueBinding) {
      display = sampleValue(binding, chillerPointIndex, pageKey);
      if (pageKey === 'chiller') chillerPointIndex += 1;
    } else if (isFlow) {
      display = nestedText.find((value) => /mở|đóng|open|closed/i.test(value)) || label || 'FS Mở';
    }

    output.push({
      id: `${pageKey}-item-${index}`,
      name: label || elementTitle(node, binding, index, pageKey),
      category,
      layout,
      xPercent: ((layout.x + layout.width / 2) / width) * 100,
      yPercent: ((layout.y + layout.height / 2) / height) * 100,
      text: display,
      isOn: true,
      visible: category !== 'label' && (pageKey !== 'chiller' || category !== 'point' || chillerPointIndex <= CHILLER_SAMPLE_VALUES.length),
      binding,
      virtual: category === 'point',
    });
  });

  return { key: pageKey, title: PAGE_CONFIG[pageKey].title, width, height, background, items: output };
}

function getPage() {
  return state.pages.get(state.activePage);
}

function renderPage(pageKey) {
  const page = state.pages.get(pageKey);
  if (!page) return;
  state.activePage = pageKey;
  state.selectedId = null;
  elements.stageBackground.src = page.background;
  elements.stageBackground.alt = `${page.title} BMS background`;
  elements.canvasPageTitle.textContent = page.title;
  elements.canvasSize.textContent = `${Math.round(page.width)} × ${Math.round(page.height)}`;
  elements.stage.setAttribute('aria-label', `${page.title} sơ đồ BMS. ${state.editMode ? 'Dùng chuột hoặc phím mũi tên để di chuyển phần tử.' : 'Bật chỉnh tọa độ để di chuyển phần tử.'}`);
  elements.stageElements.replaceChildren();
  elements.stageOverlay.replaceChildren();
  renderNavigationHotspots();

  for (const item of page.items) {
    const node = createDiagramItem(item);
    if (item.category === 'base-overlay') elements.stageOverlay.append(node);
    else elements.stageElements.append(node);
  }

  elements.canvasElementCount.textContent = `${page.items.filter((item) => item.draggable !== false).length} phần tử`;
  elements.itemCount.textContent = String(page.items.filter((item) => item.draggable !== false).length);
  renderElementList();
  renderInspector();
  updateModeStyles();
  elements.stageLoading.hidden = true;
}

function renderNavigationHotspots() {
  let layer = elements.stage.querySelector('.stage-hotspots');
  if (!layer) {
    layer = document.createElement('nav');
    layer.className = 'stage-hotspots';
    layer.setAttribute('aria-label', 'Điều hướng trang BMS trên sơ đồ');
    elements.stage.append(layer);
  }
  layer.replaceChildren();
  for (const [pageKey, label] of [['chiller', 'Chiller'], ['ahu', 'AHU'], ['pau', 'PAU'], ['fcu', 'FCU'], ['help', 'Help']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stage-hotspot';
    button.dataset.page = pageKey;
    button.setAttribute('aria-label', `Mở trang ${label}`);
    button.title = label;
    button.addEventListener('click', () => navigateToPage(pageKey));
    layer.append(button);
  }
}

function navigateToPage(pageKey) {
  document.querySelectorAll('.page-tab').forEach((tab) => {
    const active = tab.dataset.page === pageKey;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  elements.search.value = '';
  loadPage(pageKey);
}

function createDiagramItem(item) {
  const node = document.createElement('div');
  node.className = `diagram-item category-${item.category}`;
  node.dataset.id = item.id;
  node.style.left = `${item.xPercent}%`;
  node.style.top = `${item.yPercent}%`;
  const page = getPage();
  node.style.width = `${Math.max(16, item.layout.width) / page.width * 100}%`;
  node.style.height = `${Math.max(16, item.layout.height) / page.height * 100}%`;
  node.tabIndex = item.draggable === false ? -1 : 0;
  node.setAttribute('role', item.draggable === false ? 'img' : 'button');
  node.setAttribute('aria-label', `${item.name}, X ${item.xPercent.toFixed(1)}%, Y ${item.yPercent.toFixed(1)}%`);

  if (item.category === 'base-overlay') {
    node.style.width = `${item.layout.width / PX_WIDTH * 100}%`;
    node.style.height = `${item.layout.height / PX_HEIGHT * 100}%`;
    node.style.pointerEvents = 'none';
    const img = document.createElement('img');
    img.className = 'diagram-image';
    img.src = item.source;
    img.alt = 'Equipment and piping overlay';
    img.draggable = false;
    node.append(img);
    return node;
  }

  if (item.category === 'equipment' && (item.onImage || item.offImage)) {
    const img = document.createElement('img');
    img.className = `diagram-image${item.isOn ? '' : ' is-off'}`;
    img.src = item.isOn ? item.onImage || item.offImage : item.offImage || item.onImage;
    img.alt = '';
    img.draggable = false;
    img.addEventListener('error', () => {
      const fallback = document.createElement('span');
      fallback.className = 'diagram-badge is-status-on';
      fallback.textContent = item.name.slice(0, 13);
      node.replaceChildren(fallback);
    }, { once: true });
    node.append(img);
  } else if (item.category === 'trip') {
    const trip = document.createElement('span');
    trip.className = `trip-mark${item.isOn ? '' : ' is-clear'}`;
    trip.textContent = item.isOn ? '!' : '✓';
    trip.setAttribute('aria-label', item.isOn ? 'Trip alarm' : 'No trip alarm');
    node.append(trip);
  } else {
    const badge = document.createElement('span');
    badge.className = 'diagram-badge';
    if (item.category === 'flow-switch') {
      badge.classList.add(item.isOn ? 'is-status-on' : 'is-status-off');
      badge.textContent = item.isOn ? item.text || 'FS Mở' : 'FS Đóng';
    } else if (item.category === 'point') {
      badge.classList.add('diagram-virtual');
      badge.textContent = item.text || '—';
      badge.title = item.name;
    } else {
      badge.classList.add('diagram-label');
      badge.textContent = item.text || item.name;
      badge.title = item.name;
    }
    node.append(badge);
  }

  node.addEventListener('click', (event) => {
    event.stopPropagation();
    if (state.editMode || item.draggable === false) return;
    if (['equipment', 'trip', 'flow-switch'].includes(item.category)) {
      item.isOn = !item.isOn;
      renderPageElements(getPage());
      renderInspector();
      showToast(`${item.name}: ${item.category === 'trip' ? (item.isOn ? 'Trip giả lập' : 'Bình thường') : item.isOn ? 'Đang chạy' : 'Đã dừng'}`);
      return;
    }
    selectItem(item.id);
    openControlDrawer();
  });
  node.addEventListener('pointerdown', (event) => beginDrag(event, item));
  node.addEventListener('keydown', (event) => handleItemKeydown(event, item));
  if ((item.virtual && !state.showVirtual) || (!item.visible && item.id !== state.selectedId)) node.hidden = true;
  if (item.id === state.selectedId) node.classList.add('is-selected');
  return node;
}

function renderElementList() {
  const page = getPage();
  if (!page) return;
  const query = cleanText(elements.search.value).toLowerCase();
  const fragment = document.createDocumentFragment();
  const visibleItems = page.items.filter((item) => item.draggable !== false);
  for (const item of visibleItems) {
    const button = document.createElement('button');
    button.className = `element-row${item.id === state.selectedId ? ' is-selected' : ''}`;
    button.type = 'button';
    button.role = 'option';
    button.setAttribute('aria-selected', String(item.id === state.selectedId));
    button.dataset.id = item.id;
    const searchValue = `${item.name} ${item.category}`.toLowerCase();
    button.hidden = Boolean(query && !searchValue.includes(query));
    const symbol = document.createElement('span');
    symbol.className = 'element-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = item.category === 'equipment' ? '◇' : item.category === 'trip' ? '!' : item.category === 'point' ? '∿' : item.category === 'flow-switch' ? '↔' : 'T';
    const copy = document.createElement('span');
    copy.className = 'element-row-copy';
    const title = document.createElement('strong');
    title.textContent = item.name;
    const subtitle = document.createElement('small');
    subtitle.textContent = categoryLabel(item.category);
    copy.append(title, subtitle);
    button.append(symbol, copy);
    button.addEventListener('click', () => selectItem(item.id));
    fragment.append(button);
  }
  elements.elementList.replaceChildren(fragment);
}

function categoryLabel(category) {
  return ({ equipment: 'Thiết bị', point: 'Điểm dữ liệu', trip: 'Trip', 'flow-switch': 'Flow switch', label: 'Nhãn' })[category] || category;
}

function selectItem(id) {
  state.selectedId = id;
  const page = getPage();
  if (!page) return;
  renderPageElements(page);
  renderElementList();
  renderInspector();
}

function renderPageElements(page) {
  const fragment = document.createDocumentFragment();
  const overlay = document.createDocumentFragment();
  for (const item of page.items) {
    const node = createDiagramItem(item);
    (item.category === 'base-overlay' ? overlay : fragment).append(node);
  }
  elements.stageElements.replaceChildren(fragment);
  elements.stageOverlay.replaceChildren(overlay);
}

function renderInspector() {
  const page = getPage();
  const item = page?.items.find((candidate) => candidate.id === state.selectedId);
  elements.emptyInspector.hidden = Boolean(item);
  elements.inspectorContent.hidden = !item;
  if (!item) return;

  elements.selectedName.textContent = item.name;
  elements.selectedType.textContent = categoryLabel(item.category).toUpperCase();
  elements.selectedIcon.textContent = item.category === 'equipment' ? '◇' : item.category === 'trip' ? '!' : item.category === 'point' ? '∿' : item.category === 'flow-switch' ? '↔' : 'T';
  elements.coordX.value = item.xPercent.toFixed(1);
  elements.coordY.value = item.yPercent.toFixed(1);
  elements.elementSize.textContent = `${Math.round(item.layout.width)} × ${Math.round(item.layout.height)} px`;
  const hasState = ['equipment', 'trip', 'flow-switch'].includes(item.category);
  elements.statusRow.hidden = !hasState;
  elements.virtualValueRow.hidden = item.category !== 'point' || !item.virtual;
  elements.virtualValue.value = item.text || '';
  elements.statusToggle.setAttribute('aria-pressed', String(item.isOn));
  elements.statusToggle.querySelector('strong').textContent = item.category === 'trip' ? (item.isOn ? 'Báo trip' : 'Bình thường') : item.category === 'flow-switch' ? (item.isOn ? 'FS Mở' : 'FS Đóng') : (item.isOn ? 'Đang chạy' : 'Đang tắt');
}

function setCoordinate(axis, rawValue) {
  const page = getPage();
  const item = page?.items.find((candidate) => candidate.id === state.selectedId);
  if (!item) return;
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return;
  item[axis] = Math.max(0, Math.min(100, value));
  const node = elements.stageElements.querySelector(`[data-id="${CSS.escape(item.id)}"]`);
  if (node) {
    node.style.left = `${item.xPercent}%`;
    node.style.top = `${item.yPercent}%`;
    node.setAttribute('aria-label', `${item.name}, X ${item.xPercent.toFixed(1)}%, Y ${item.yPercent.toFixed(1)}%`);
  }
  renderInspector();
}

function updateItemPosition(item, clientX, clientY) {
  const rect = elements.stage.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  item.xPercent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  item.yPercent = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
  const node = elements.stageElements.querySelector(`[data-id="${CSS.escape(item.id)}"]`);
  if (node) {
    node.style.left = `${item.xPercent}%`;
    node.style.top = `${item.yPercent}%`;
    node.setAttribute('aria-label', `${item.name}, X ${item.xPercent.toFixed(1)}%, Y ${item.yPercent.toFixed(1)}%`);
  }
  if (state.selectedId === item.id) renderInspector();
}

function beginDrag(event, item) {
  if (!state.editMode || item.draggable === false || event.button !== 0) return;
  event.preventDefault();
  selectItem(item.id);
  state.drag = { id: item.id, pointerId: event.pointerId };
  event.currentTarget.setPointerCapture?.(event.pointerId);
}

function handleItemKeydown(event, item) {
  if (!state.editMode) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectItem(item.id);
    }
    return;
  }
  const adjustments = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const adjustment = adjustments[event.key];
  if (!adjustment) return;
  event.preventDefault();
  selectItem(item.id);
  const multiplier = event.shiftKey ? 0.2 : 1;
  setCoordinate('xPercent', item.xPercent + adjustment[0] * multiplier);
  setCoordinate('yPercent', item.yPercent + adjustment[1] * multiplier);
}

function updateModeStyles() {
  document.body.classList.toggle('is-editing', state.editMode);
  elements.stage.classList.toggle('is-edit-mode', state.editMode);
  elements.editToggle.setAttribute('aria-pressed', String(state.editMode));
  elements.virtualToggle.setAttribute('aria-pressed', String(state.showVirtual));
  elements.editHint.textContent = state.editMode ? 'Kéo phần tử hoặc dùng phím mũi tên để căn chỉnh' : 'Bật chỉnh tọa độ để kéo thả phần tử';
  elements.stage.querySelectorAll('.diagram-item').forEach((node) => node.classList.toggle('is-editable', state.editMode && node.dataset.id !== undefined));
  elements.stage.setAttribute('aria-label', `${PAGE_CONFIG[state.activePage].title} sơ đồ BMS. ${state.editMode ? 'Dùng chuột hoặc phím mũi tên để di chuyển phần tử.' : 'Bật chỉnh tọa độ để di chuyển phần tử.'}`);
}

function coordinatesForExport() {
  const screens = {};
  for (const [key, page] of state.pages) {
    screens[key] = {
      source: PAGE_CONFIG[key].file,
      canvas: { width: Math.round(page.width), height: Math.round(page.height) },
      elements: page.items.filter((item) => item.draggable !== false).map((item) => ({
        id: item.id,
        name: item.name,
        type: item.category,
        xPercent: Number(item.xPercent.toFixed(2)),
        yPercent: Number(item.yPercent.toFixed(2)),
      })),
    };
  }
  return { format: 'bms-layout-coordinates/v1', coordinateOrigin: 'element-center', screens };
}

function updateJsonPreview() {
  state.exportedJson = JSON.stringify(coordinatesForExport(), null, 2);
  const code = document.createElement('code');
  code.textContent = state.exportedJson;
  elements.jsonPreview.replaceChildren(code);
  elements.copyJson.disabled = false;
}

async function ensureAllPagesLoaded() {
  await Promise.all(Object.entries(PAGE_CONFIG).map(async ([key, config]) => {
    if (state.pages.has(key)) return;
    const response = await fetch(config.file);
    if (!response.ok) throw new Error(`Unable to load ${config.file}`);
    state.pages.set(key, parsePage(await response.text(), key));
  }));
}

async function copyCoordinates() {
  try {
    await ensureAllPagesLoaded();
    updateJsonPreview();
    await copyText(state.exportedJson);
    showToast('Đã sao chép tọa độ của cả 4 màn hình.');
  } catch (error) {
    console.error('[v0] Coordinate export failed:', error);
    showToast('Không thể tải đủ PX để xuất tọa độ.');
  }
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const temporary = document.createElement('textarea');
    temporary.value = value;
    temporary.setAttribute('readonly', '');
    temporary.style.position = 'fixed';
    temporary.style.opacity = '0';
    document.body.append(temporary);
    temporary.select();
    document.execCommand('copy');
    temporary.remove();
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('is-visible');
  window.clearTimeout(state.toastTimeout);
  state.toastTimeout = window.setTimeout(() => elements.toast.classList.remove('is-visible'), 2600);
}

async function loadPage(pageKey) {
  if (state.pages.has(pageKey)) {
    renderPage(pageKey);
    return;
  }
  elements.stageLoading.hidden = false;
  elements.pageStatus.textContent = `Loading ${PAGE_CONFIG[pageKey].title}…`;
  try {
    const response = await fetch(PAGE_CONFIG[pageKey].file);
    if (!response.ok) throw new Error(`Unable to load ${PAGE_CONFIG[pageKey].file}`);
    const parsed = parsePage(await response.text(), pageKey);
    state.pages.set(pageKey, parsed);
    renderPage(pageKey);
    elements.pageStatus.textContent = 'Layouts ready';
  } catch (error) {
    elements.stageLoading.hidden = false;
    elements.stageLoading.querySelector('span:last-child').textContent = 'Không thể tải sơ đồ PX';
    elements.pageStatus.textContent = 'Layout load failed';
    console.error('[v0] BMS layout load failed:', error);
  }
}

function resetCurrentPage() {
  const page = getPage();
  if (!page) return;
  for (const item of page.items) {
    item.xPercent = ((item.layout.x + item.layout.width / 2) / page.width) * 100;
    item.yPercent = ((item.layout.y + item.layout.height / 2) / page.height) * 100;
  }
  state.selectedId = null;
  renderPage(state.activePage);
  updateJsonPreview();
  showToast(`Đã khôi phục tọa độ trang ${page.title}.`);
}

function setItemState() {
  const page = getPage();
  const item = page?.items.find((candidate) => candidate.id === state.selectedId);
  if (!item) return;
  item.isOn = !item.isOn;
  renderPageElements(page);
  renderInspector();
}

for (const tab of document.querySelectorAll('.page-tab')) {
  tab.addEventListener('click', () => navigateToPage(tab.dataset.page));
}

elements.editToggle.addEventListener('click', () => {
  state.editMode = !state.editMode;
  updateModeStyles();
});
elements.virtualToggle.addEventListener('click', () => {
  state.showVirtual = !state.showVirtual;
  updateModeStyles();
  renderPageElements(getPage());
});
elements.resetPage.addEventListener('click', resetCurrentPage);
elements.copyCoordinates.addEventListener('click', copyCoordinates);
elements.copyJson.addEventListener('click', async () => {
  if (state.exportedJson) {
    await copyText(state.exportedJson);
    showToast('Đã sao chép JSON vào clipboard.');
  }
});
elements.coordX.addEventListener('change', (event) => setCoordinate('xPercent', event.target.value));
elements.coordY.addEventListener('change', (event) => setCoordinate('yPercent', event.target.value));
elements.statusToggle.addEventListener('click', setItemState);
elements.virtualValue.addEventListener('change', (event) => {
  const item = getPage()?.items.find((candidate) => candidate.id === state.selectedId);
  if (!item || item.category !== 'point') return;
  item.text = cleanText(event.target.value).slice(0, 32);
  event.target.value = item.text;
  const node = elements.stageElements.querySelector(`[data-id="${CSS.escape(item.id)}"] .diagram-badge`);
  if (node) node.textContent = item.text;
});
elements.search.addEventListener('input', renderElementList);

document.addEventListener('pointermove', (event) => {
  if (!state.drag || state.drag.pointerId !== event.pointerId) return;
  const item = getPage()?.items.find((candidate) => candidate.id === state.drag.id);
  if (item) updateItemPosition(item, event.clientX, event.clientY);
});
document.addEventListener('pointerup', (event) => {
  if (!state.drag || state.drag.pointerId !== event.pointerId) return;
  state.drag = null;
});
elements.stage.addEventListener('click', (event) => {
  if (event.target === elements.stage || event.target === elements.stageBackground || event.target === elements.stageElements) {
    state.selectedId = null;
    renderPageElements(getPage());
    renderElementList();
    renderInspector();
  }
});

const drawer = document.querySelector('#control-drawer');
const drawerContent = document.querySelector('#drawer-content');
const launcher = document.querySelector('#control-launcher');

function openControlDrawer() {
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  launcher.setAttribute('aria-expanded', 'true');
}

function closeControlDrawer() {
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  launcher.setAttribute('aria-expanded', 'false');
}

for (const selector of ['.page-tabs', '.toolbar', '.element-panel', '.inspector-panel']) {
  const control = document.querySelector(selector);
  if (control) drawerContent.append(control);
}
launcher.addEventListener('click', () => drawer.classList.contains('is-open') ? closeControlDrawer() : openControlDrawer());
document.querySelector('#drawer-close').addEventListener('click', closeControlDrawer);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && drawer.classList.contains('is-open')) closeControlDrawer();
});

loadPage(state.activePage);
