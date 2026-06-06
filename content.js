const MAX_PREVIEW_LENGTH = 240;
const FLOATING_CARD_HOST_ID = 'selectlens-floating-card-host';
const SUPPORTED_RESULT_TYPES = new Set(['base64', 'timestamp10', 'timestamp13']);
const SELECTION_ANALYSIS_DELAY = 180;
const CONTEXT_MENU_ANALYZE_MESSAGE_TYPE = 'SELECTLENS_CONTEXT_MENU_ANALYZE';

let floatingCardHost = null;
let floatingCardShadow = null;
let selectionAnalysisTimer = null;
let floatingCardInteractionTimer = null;
let isSuppressingFloatingCardInteraction = false;
let dismissedSelectionText = '';
let currentResultCopyText = '';
let currentOriginalCopyText = '';

function normalizeSelection(rawText) {
  return typeof rawText === 'string' ? rawText.trim() : '';
}

function normalizeBase64Candidate(text) {
  const candidate = text.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const paddingRemainder = candidate.length % 4;

  if (paddingRemainder === 1) {
    return null;
  }

  if (paddingRemainder === 2) {
    return `${candidate}==`;
  }

  if (paddingRemainder === 3) {
    return `${candidate}=`;
  }

  return candidate;
}

function isDigitsOnly(text) {
  return /^\d+$/.test(text);
}

function isTimestampCandidate(text) {
  return isDigitsOnly(text) && (text.length === 10 || text.length === 13);
}

function formatDateParts(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function parseTimestamp(text) {
  if (!isTimestampCandidate(text)) {
    return null;
  }

  const numericValue = Number(text);
  const timestampMs = text.length === 10 ? numericValue * 1000 : numericValue;
  const date = new Date(timestampMs);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    type: text.length === 10 ? 'timestamp10' : 'timestamp13',
    label: text.length === 10 ? '10位时间戳' : '13位时间戳',
    output: `本地时间: ${formatDateParts(date)}\nISO: ${date.toISOString()}`
  };
}

function isLikelyBase64(text) {
  if (!text || text.length < 8 || text.length % 4 !== 0) {
    return false;
  }

  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text);
}

function decodeBase64(text) {
  try {
    const decoded = atob(text);
    const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
    const utf8Text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);

    return utf8Text;
  } catch (error) {
    return null;
  }
}

function parseBase64(text) {
  const candidate = normalizeBase64Candidate(text);

  if (!isLikelyBase64(candidate)) {
    return null;
  }

  const decoded = decodeBase64(candidate);

  if (!decoded) {
    return null;
  }

  return {
    type: 'base64',
    label: 'Base64',
    output: decoded
  };
}

function truncateText(text) {
  if (text.length <= MAX_PREVIEW_LENGTH) {
    return text;
  }

  return `${text.slice(0, MAX_PREVIEW_LENGTH)}…`;
}

function analyzeSelection(rawText) {
  const input = normalizeSelection(rawText);

  if (!input) {
    return {
      type: 'empty',
      label: '未检测到内容',
      input: '',
      inputPreview: '',
      output: '',
      outputPreview: '',
      copyText: '',
      message: '请先在网页中选中文本。'
    };
  }

  const timestampResult = parseTimestamp(input);

  if (timestampResult) {
    return {
      ...timestampResult,
      input,
      inputPreview: truncateText(input),
      outputPreview: truncateText(timestampResult.output),
      copyText: timestampResult.output,
      message: '已识别为时间戳。'
    };
  }

  const base64Result = parseBase64(input);

  if (base64Result) {
    return {
      ...base64Result,
      input,
      inputPreview: truncateText(input),
      outputPreview: truncateText(base64Result.output),
      copyText: base64Result.output,
      message: '已识别为 Base64。'
    };
  }

  return {
    type: 'unknown',
    label: '暂不支持',
    input,
    inputPreview: truncateText(input),
    output: '',
    outputPreview: '',
    copyText: '',
    message: '当前选中内容不是支持的 Base64 或 10/13 位时间戳。'
  };
}

function getSelectedText() {
  const selection = window.getSelection();

  if (selection && selection.toString()) {
    return selection.toString();
  }

  const activeElement = document.activeElement;

  if (
    activeElement &&
    (activeElement.tagName === 'TEXTAREA' ||
      (activeElement.tagName === 'INPUT' && typeof activeElement.value === 'string'))
  ) {
    const { selectionStart, selectionEnd, value } = activeElement;

    if (
      typeof selectionStart === 'number' &&
      typeof selectionEnd === 'number' &&
      selectionStart !== selectionEnd
    ) {
      return value.slice(selectionStart, selectionEnd);
    }
  }

  return '';
}

function stopFloatingCardEvent(event) {
  suppressFloatingCardInteraction();
  event.stopPropagation();
}

function createFloatingCardHost() {
  if (floatingCardHost && floatingCardShadow) {
    return floatingCardHost;
  }

  floatingCardHost = document.getElementById(FLOATING_CARD_HOST_ID);

  if (!floatingCardHost) {
    floatingCardHost = document.createElement('div');
    floatingCardHost.id = FLOATING_CARD_HOST_ID;
    document.documentElement.appendChild(floatingCardHost);
  }

  floatingCardHost.style.position = 'fixed';
  floatingCardHost.style.left = '0';
  floatingCardHost.style.top = '0';
  floatingCardHost.style.zIndex = '2147483647';
  floatingCardHost.style.display = 'none';
  floatingCardHost.style.maxWidth = 'calc(100vw - 24px)';

  if (!floatingCardHost.dataset.selectlensListenersAttached) {
    floatingCardHost.addEventListener('pointerdown', stopFloatingCardEvent);
    floatingCardHost.addEventListener('mouseup', stopFloatingCardEvent);
    floatingCardHost.addEventListener('click', stopFloatingCardEvent);
    floatingCardHost.addEventListener('touchend', stopFloatingCardEvent);
    floatingCardHost.dataset.selectlensListenersAttached = 'true';
  }

  floatingCardShadow = floatingCardHost.shadowRoot || floatingCardHost.attachShadow({ mode: 'open' });

  return floatingCardHost;
}

function isEventFromFloatingCard(event) {
  if (!floatingCardHost) {
    return false;
  }

  const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
  return path.includes(floatingCardHost) || floatingCardHost.contains(event.target);
}

function suppressFloatingCardInteraction() {
  isSuppressingFloatingCardInteraction = true;
  window.clearTimeout(floatingCardInteractionTimer);
  floatingCardInteractionTimer = window.setTimeout(() => {
    isSuppressingFloatingCardInteraction = false;
  }, 350);
}

function shouldIgnoreSelectionTrigger(event) {
  if (event && isEventFromFloatingCard(event)) {
    suppressFloatingCardInteraction();
    return true;
  }

  return isSuppressingFloatingCardInteraction;
}

function getFloatingCardStyles() {
  return `
    :host {
      all: initial;
      color-scheme: light;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    .card {
      width: min(340px, calc(100vw - 24px));
      max-height: min(320px, calc(100vh - 24px));
      overflow: auto;
      padding: 14px;
      color: #111827;
      background: #ffffff;
      border: 1px solid #dbeafe;
      border-radius: 16px;
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
      font-size: 13px;
      line-height: 1.5;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 8px;
      color: #ffffff;
      background: #2563eb;
      font-weight: 800;
      font-size: 12px;
      flex: 0 0 auto;
    }

    .title {
      margin: 0;
      color: #0f172a;
      font-size: 14px;
      font-weight: 700;
    }

    .close {
      appearance: none;
      width: 26px;
      height: 26px;
      border: 0;
      border-radius: 999px;
      color: #64748b;
      background: #f1f5f9;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
    }

    .close:hover {
      color: #0f172a;
      background: #e2e8f0;
    }

    .badge {
      display: inline-block;
      margin-bottom: 10px;
      padding: 3px 9px;
      color: #1d4ed8;
      background: #dbeafe;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }

    .section {
      margin-top: 10px;
    }

    .label {
      display: block;
      margin-bottom: 4px;
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }

    .preview {
      margin: 0;
      padding: 9px 10px;
      color: #0f172a;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .preview--muted {
      color: #475569;
    }

    .status {
      margin: 10px 0 0;
      color: #475569;
      font-size: 12px;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .copy {
      appearance: none;
      flex: 1;
      border: 0;
      border-radius: 11px;
      padding: 9px 12px;
      color: #ffffff;
      background: #2563eb;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
    }

    .copy:hover {
      background: #1d4ed8;
    }
  `;
}

function renderFloatingCard(result, anchorRect) {
  if (!SUPPORTED_RESULT_TYPES.has(result.type) || !anchorRect) {
    hideFloatingCard();
    return;
  }

  const host = createFloatingCardHost();
  currentResultCopyText = result.copyText || '';
  currentOriginalCopyText = result.input || '';

  floatingCardShadow.innerHTML = `
    <style>${getFloatingCardStyles()}</style>
    <article class="card" role="dialog" aria-label="SelectLens result">
      <header class="header">
        <div class="brand">
          <span class="logo" aria-hidden="true">SL</span>
          <h2 class="title">SelectLens</h2>
        </div>
        <button class="close" type="button" aria-label="关闭">×</button>
      </header>
      <span class="badge" id="type"></span>
      <section class="section">
        <span class="label">选中内容</span>
        <pre class="preview preview--muted" id="input"></pre>
      </section>
      <section class="section">
        <span class="label">解析结果</span>
        <pre class="preview" id="output"></pre>
      </section>
      <p class="status" id="status"></p>
      <div class="actions">
        <button class="copy copy-original" type="button">复制原文</button>
        <button class="copy copy-result" type="button">复制结果</button>
      </div>
    </article>
  `;

  floatingCardShadow.getElementById('type').textContent = result.label;
  floatingCardShadow.getElementById('input').textContent = result.inputPreview || '—';
  floatingCardShadow.getElementById('output').textContent = result.outputPreview || '—';
  floatingCardShadow.getElementById('status').textContent = result.message;

  floatingCardShadow.querySelector('.close').addEventListener('click', (event) => {
    suppressFloatingCardInteraction();
    event.stopPropagation();
    dismissFloatingCard();
  });
  floatingCardShadow.querySelector('.copy-original').addEventListener('click', async (event) => {
    suppressFloatingCardInteraction();
    event.stopPropagation();
    const copied = await copyResultText(currentOriginalCopyText);
    const statusElement = floatingCardShadow.getElementById('status');
    statusElement.textContent = copied ? '原文已复制。' : '复制失败，请重试。';
  });
  floatingCardShadow.querySelector('.copy-result').addEventListener('click', async (event) => {
    suppressFloatingCardInteraction();
    event.stopPropagation();
    const copied = await copyResultText(currentResultCopyText);
    const statusElement = floatingCardShadow.getElementById('status');
    statusElement.textContent = copied ? '解析结果已复制。' : '复制失败，请重试。';
  });

  host.style.display = 'block';
  host.style.visibility = 'hidden';
  positionFloatingCard(anchorRect);
  host.style.visibility = 'visible';
}

function positionFloatingCard(anchorRect) {
  if (!floatingCardHost) {
    return;
  }

  const margin = 12;
  const offset = 10;
  const cardRect = floatingCardHost.getBoundingClientRect();
  const cardWidth = cardRect.width || 340;
  const cardHeight = cardRect.height || 260;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = anchorRect.left + anchorRect.width / 2 - cardWidth / 2;
  let top = anchorRect.bottom + offset;

  if (top + cardHeight + margin > viewportHeight) {
    top = anchorRect.top - cardHeight - offset;
  }

  left = Math.max(margin, Math.min(left, viewportWidth - cardWidth - margin));
  top = Math.max(margin, Math.min(top, viewportHeight - cardHeight - margin));

  floatingCardHost.style.left = `${Math.round(left)}px`;
  floatingCardHost.style.top = `${Math.round(top)}px`;
}

function hideFloatingCard() {
  window.clearTimeout(selectionAnalysisTimer);
  selectionAnalysisTimer = null;
  currentResultCopyText = '';
  currentOriginalCopyText = '';

  if (floatingCardHost) {
    floatingCardHost.style.display = 'none';
  }
}

function dismissFloatingCard() {
  dismissedSelectionText = normalizeSelection(getSelectedText());
  suppressFloatingCardInteraction();
  hideFloatingCard();
}

async function copyResultText(text) {
  if (!text) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  suppressFloatingCardInteraction();

  const activeElement = document.activeElement;
  const selection = window.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index)) : [];
  const inputSelection = activeElement &&
    (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') &&
    typeof activeElement.selectionStart === 'number'
      ? {
          element: activeElement,
          start: activeElement.selectionStart,
          end: activeElement.selectionEnd
        }
      : null;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch (error) {
    return false;
  } finally {
    textarea.remove();

    if (selection) {
      selection.removeAllRanges();
      ranges.forEach((range) => selection.addRange(range));
    }

    if (inputSelection) {
      inputSelection.element.focus();
      inputSelection.element.setSelectionRange(inputSelection.start, inputSelection.end);
    } else if (activeElement && typeof activeElement.focus === 'function') {
      activeElement.focus();
    }

    suppressFloatingCardInteraction();
  }
}

function getSelectionAnchorRect() {
  const activeElement = document.activeElement;

  if (
    activeElement &&
    (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')
  ) {
    const { selectionStart, selectionEnd } = activeElement;

    if (
      typeof selectionStart === 'number' &&
      typeof selectionEnd === 'number' &&
      selectionStart !== selectionEnd
    ) {
      return activeElement.getBoundingClientRect();
    }
  }

  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || !selection.toString()) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  if (rect.width || rect.height) {
    return rect;
  }

  const rects = Array.from(range.getClientRects()).filter((item) => item.width || item.height);
  return rects.length ? rects[rects.length - 1] : null;
}

function getViewportFallbackRect() {
  const left = Math.round(window.innerWidth / 2);
  const top = Math.max(12, Math.round(window.innerHeight * 0.25));

  return {
    left,
    right: left,
    top,
    bottom: top,
    width: 0,
    height: 0
  };
}

function analyzeTextFromContextMenu(rawText) {
  dismissedSelectionText = '';

  const result = analyzeSelection(rawText);

  if (!SUPPORTED_RESULT_TYPES.has(result.type)) {
    hideFloatingCard();
    return;
  }

  renderFloatingCard(result, getSelectionAnchorRect() || getViewportFallbackRect());
}

function analyzeCurrentSelection() {
  if (isSuppressingFloatingCardInteraction) {
    return;
  }

  const selectedText = getSelectedText();
  const normalizedSelectedText = normalizeSelection(selectedText);

  if (dismissedSelectionText && dismissedSelectionText === normalizedSelectedText) {
    return;
  }

  if (dismissedSelectionText && dismissedSelectionText !== normalizedSelectedText) {
    dismissedSelectionText = '';
  }

  const result = analyzeSelection(selectedText);

  if (!SUPPORTED_RESULT_TYPES.has(result.type)) {
    hideFloatingCard();
    return;
  }

  renderFloatingCard(result, getSelectionAnchorRect());
}

function scheduleSelectionAnalysis(delay = SELECTION_ANALYSIS_DELAY, event = null) {
  if (shouldIgnoreSelectionTrigger(event)) {
    return;
  }

  window.clearTimeout(selectionAnalysisTimer);
  selectionAnalysisTimer = window.setTimeout(analyzeCurrentSelection, delay);
}

function handlePointerDown(event) {
  if (shouldIgnoreSelectionTrigger(event)) {
    return;
  }

  if (floatingCardHost && floatingCardHost.style.display !== 'none') {
    hideFloatingCard();
  }
}

if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === CONTEXT_MENU_ANALYZE_MESSAGE_TYPE) {
      analyzeTextFromContextMenu(message.text || '');
    }
  });
}

document.addEventListener('selectionchange', (event) => scheduleSelectionAnalysis(SELECTION_ANALYSIS_DELAY, event));
document.addEventListener('mouseup', (event) => scheduleSelectionAnalysis(0, event));
document.addEventListener('keyup', (event) => scheduleSelectionAnalysis(0, event));
document.addEventListener('touchend', (event) => scheduleSelectionAnalysis(0, event));
document.addEventListener('pointerdown', handlePointerDown, true);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    dismissFloatingCard();
  }
});
window.addEventListener('scroll', dismissFloatingCard, true);
window.addEventListener('resize', dismissFloatingCard);
