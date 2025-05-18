let highlightedElements = [];
// 监听来自 side panel 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    try {
        switch(message.type){
            case 'highlight':
                highlightElement(message.selector);
                sendResponse({
                    success: true
                });
                break;
            case 'removeHighlight':
                removeHighlight();
                sendResponse({
                    success: true
                });
                break;
            case 'executeOperations':
                executeOperations(message.operations);
                sendResponse({
                    success: true
                });
                break;
        }
    } catch (error) {
        sendResponse({
            success: false,
            error: error.message
        });
    }
    return false;
});
// 高亮元素
function highlightElement(selector) {
    removeHighlight(); // 先移除之前的高亮
    try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element)=>{
            const htmlElement = element;
            highlightedElements.push(htmlElement);
            htmlElement.style.outline = '2px solid #ff0000';
            htmlElement.style.outlineOffset = '2px';
        });
    } catch (error) {
        console.error('选择器无效:', error);
    }
}
// 移除高亮
function removeHighlight() {
    highlightedElements.forEach((element)=>{
        element.style.outline = '';
        element.style.outlineOffset = '';
    });
    highlightedElements = [];
}
// 执行 DOM 操作
function executeOperations(operations) {
    operations.forEach((operation)=>{
        try {
            const elements = document.querySelectorAll(operation.selector);
            elements.forEach((element)=>{
                const htmlElement = element;
                switch(operation.operationType){
                    case 'modifyAttribute':
                        if (operation.attributeName && operation.attributeValue !== undefined) {
                            htmlElement.setAttribute(operation.attributeName, operation.attributeValue);
                        }
                        break;
                    case 'removeAttribute':
                        if (operation.attributeName) {
                            htmlElement.removeAttribute(operation.attributeName);
                        }
                        break;
                    case 'removeAllAttributes':
                        while(htmlElement.attributes.length > 0){
                            htmlElement.removeAttribute(htmlElement.attributes[0].name);
                        }
                        break;
                    case 'removeDOM':
                        htmlElement.remove();
                        break;
                }
            });
        } catch (error) {
            console.error('执行操作失败:', error);
        }
    });
}
console.info('contentScript is running');
