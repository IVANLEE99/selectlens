const detectedTypeElement = document.getElementById('detected-type');
const inputPreviewElement = document.getElementById('input-preview');
const outputPreviewElement = document.getElementById('output-preview');
const statusMessageElement = document.getElementById('status-message');
const copyButton = document.getElementById('copy-button');

let currentCopyText = '';

function setCopyState(enabled, text) {
  currentCopyText = text || '';
  copyButton.disabled = !enabled;
}

function renderResult(result) {
  detectedTypeElement.textContent = result.label;
  inputPreviewElement.textContent = result.inputPreview || '—';
  outputPreviewElement.textContent = result.outputPreview || '—';
  statusMessageElement.textContent = result.message;
  setCopyState(Boolean(result.copyText), result.copyText);
}

function renderError(message) {
  detectedTypeElement.textContent = '读取失败';
  inputPreviewElement.textContent = '—';
  outputPreviewElement.textContent = '—';
  statusMessageElement.textContent = message;
  setCopyState(false, '');
}

async function requestAnalysis() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      renderError('未找到当前活动标签页。');
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'GET_SELECTION_ANALYSIS'
    });

    if (!response?.ok) {
      renderError(response?.error || '无法读取当前页面选区。');
      return;
    }

    renderResult(response.result);
  } catch (error) {
    renderError('当前页面暂不支持读取选区，请切换到普通网页后重试。');
  }
}

copyButton.addEventListener('click', async () => {
  if (!currentCopyText) {
    return;
  }

  try {
    await navigator.clipboard.writeText(currentCopyText);
    statusMessageElement.textContent = '复制成功。';
  } catch (error) {
    statusMessageElement.textContent = '复制失败，请重试。';
  }
});

requestAnalysis();
