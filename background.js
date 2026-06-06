const CONTEXT_MENU_ID = 'selectlens-analyze-selection';
const ANALYZE_MESSAGE_TYPE = 'SELECTLENS_CONTEXT_MENU_ANALYZE';

function createSelectionContextMenu() {
  chrome.contextMenus.remove(CONTEXT_MENU_ID, () => {
    void chrome.runtime.lastError;

    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: '用 SelectLens 解析选中文本',
      contexts: ['selection']
    });
  });
}

chrome.runtime.onInstalled.addListener(createSelectionContextMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !info.selectionText || !tab?.id) {
    return;
  }

  chrome.tabs.sendMessage(
    tab.id,
    {
      type: ANALYZE_MESSAGE_TYPE,
      text: info.selectionText
    },
    () => {
      void chrome.runtime.lastError;
    }
  );
});
