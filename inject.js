

function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}


// Inject all scripts

injectScript(chrome.runtime.getURL('src/scripts/QuickPlan.user.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/TownBBCode.user.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/Shortcuts.user.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/IslandTools.user.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/MinDailyReward.user.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/SentinelButton.user.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/SentinelIndicator.user.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/PercentageTrade.user.js'), 'body');


// injectScript(chrome.runtime.getURL('src/scripts/Patches.js'), 'body');
// injectScript(chrome.runtime.getURL('src/content/FlaskTool.user.js'), 'body');
