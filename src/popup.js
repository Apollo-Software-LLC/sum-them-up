const prefix = "Result: ";

document.addEventListener('visibilitychange', function() {
    chrome.runtime.sendMessage({action: "com.apollosoftwarellc.sumthemup.close"});
}, false);

function copyToClipboard() {
    var result = document.getElementById("result").innerText;
    navigator.clipboard.writeText(result.substring(prefix.length));
    alert("Copied to clipboard!");
    window.close();
}

document.getElementById("copy").addEventListener("click", copyToClipboard);

chrome.runtime.sendMessage({action: "com.apollosoftwarellc.sumthemup.query"}).then((response) => {
    if (response.sum) {
        document.getElementById("result").innerText = prefix + response.sum;
    }
    if (response.count) {
        if (response.count === 1) {
            document.getElementById("info").innerText = "Found 1 number.";
        } else {
            document.getElementById("info").innerText = "Found " + response.count + " numbers.";
        }
    }
});
