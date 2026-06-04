const MAX_PREVIEW_LENGTH = 240;

function normalizeSelection(rawText) {
  return typeof rawText === 'string' ? rawText.trim() : '';
}

function normalizeBase64Candidate(text) {
  return text.replace(/\s+/g, '');
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
  if (text.length < 8 || text.length % 4 !== 0) {
    return false;
  }

  return /^[A-Za-z0-9+/]+=*$/.test(text);
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
      message: '请先在网页中选中文本，再打开插件。'
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'GET_SELECTION_ANALYSIS') {
    return false;
  }

  try {
    const selectedText = getSelectedText();
    const result = analyzeSelection(selectedText);
    sendResponse({ ok: true, result });
  } catch (error) {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }

  return false;
});
