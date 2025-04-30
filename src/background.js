var sum = "0";
var count = 0;
var tabIds = [];

chrome.runtime.onInstalled.addListener(() =>
    chrome.contextMenus.create({
        title: 'Sum them up!',
        contexts: ["page"],
        id: "com.apollosoftwarellc.sumthemup.calculate",
    })
);
    
chrome.contextMenus.onClicked.addListener((info, tab) => {
    tabIds.push(tab.id);
    chrome.tabs.sendMessage(tab.id, {action: info.menuItemId});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "com.apollosoftwarellc.sumthemup.popup") {
        sum = request.sum;
        count = request.count;
        chrome.action.openPopup().then(() => {
            sendResponse({});
        });
    } else if (request.action === "com.apollosoftwarellc.sumthemup.query") {
        sendResponse({sum: sum, count: count});
    } else if (request.action === "com.apollosoftwarellc.sumthemup.close") {
        tabIds.forEach((tabId) => {
            chrome.tabs.sendMessage(tabId, {action: request.action});
        });
        tabIds = [];
        sendResponse({});
    }
});
