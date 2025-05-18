// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
    // 启用侧边栏
    chrome.sidePanel.setOptions({
        enabled: true,
        tabId: tab.id,
        path: 'sidepanel.html'
    });
    
    // 打开侧边栏
    chrome.sidePanel.open({ tabId: tab.id! });
});

// 初始化右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'openSidePanel',
        title: '打开 Magic DOM 工具',
        contexts: ['page']
    });
});

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openSidePanel' && tab?.id) {
        chrome.sidePanel.setOptions({
            enabled: true,
            tabId: tab.id,
            path: 'sidepanel.html'
        });
        chrome.sidePanel.open({ tabId: tab.id });
    }
});