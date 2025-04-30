var menuTarget = null;
var highlightedElements = [];
var timeoutId = null;

const decimalSeparator = (1.1).toLocaleString().replace(/\d/g, "").trim();
const thousandSeparator = (1000).toLocaleString().replace(/\d/g, "").trim();

document.addEventListener("contextmenu", (event) => {
    menuTarget = event.target;
}, true);

function restoreBackgroundColor() {
    highlightedElements.forEach(({element, backgroundColor}) => {
        element.style.backgroundColor = backgroundColor;
    });
    highlightedElements = [];
}

function getElementDepth(element) {
    var depth = 0;
    while (element) {
        depth++;
        element = element.parentElement;
    }
    return depth;
}

function getElementInfo(element) {
    var elementInfo = {
        tagName: element.tagName,
        className: element.className?.trim(),
        textContent: element.textContent.trim(),
        depth: getElementDepth(element),
    };
    return elementInfo;
}

function getElementInfoFromContextMenu() {
    if (!menuTarget) return null;
    var elementInfo = getElementInfo(menuTarget);
    return elementInfo;
}

function extractNumber(str) {
    var res = str.trim().split(" ")[0]
        .replaceAll(thousandSeparator, ",")
        .replace(/[\\$£€¥₩₽₹,]/g, "")
        .replaceAll(decimalSeparator, ".")
        .replace("\u2212", "-");
    if (!res.match(/^[-+]?[0-9]*\.?[0-9]+$/)) {
        return "";
    }
    return res;
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "com.apollosoftwarellc.sumthemup.calculate") {
        const elementInfo = getElementInfoFromContextMenu();
        if (elementInfo && elementInfo.textContent) {
            const str = extractNumber(elementInfo.textContent);
            const num = parseFloat(str);
            if (!isNaN(num)) {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                restoreBackgroundColor();
                const depth = elementInfo.depth;
                let sel = elementInfo.tagName;
                if (elementInfo.className) {
                    sel += "." + elementInfo.className.split(" ").filter(i => i).join(".");
                }
                const elements = document.querySelectorAll(sel);
                let sum = 0;
                let count = 0;
                let decimals = 0;
                elements.forEach((element) => {
                    if (element.className?.trim() !== elementInfo.className) return;
                    if (getElementDepth(element) !== depth) return;
                    if (element.checkVisibility) {
                        if (!element.checkVisibility()) return;
                    }
                    const elementStr = extractNumber(element.textContent);
                    const elementNum = parseFloat(elementStr);
                    if (!isNaN(elementNum)) {
                        sum += elementNum;
                        count++;
                        const elementDecimals = (elementStr.split(".")[1] || "").length;
                        if (elementDecimals > decimals) {
                            decimals = elementDecimals;
                        }
                        highlightedElements.push({element, backgroundColor: element.style.backgroundColor});
                        element.style.backgroundColor = "yellow";
                    }
                });
                setTimeout(() => {
                    const calculatedSum = sum.toFixed(decimals);
                    chrome.runtime.sendMessage({action: "com.apollosoftwarellc.sumthemup.popup", sum: calculatedSum, count: count});
                }, 250);
            } else {
                alert("The clicked element does not contain a valid number.");
            }
        } else {
            alert("No valid element found.");
        }
    } else if (request.action === "com.apollosoftwarellc.sumthemup.close") {
        timeoutId = setTimeout(() => {
            timeoutId = null;
            restoreBackgroundColor();
        }, 2500);
    }
});
