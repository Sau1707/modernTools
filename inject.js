

function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}


// Inject all scripts
injectScript(chrome.runtime.getURL('src/scripts/MinDailyReward.user.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/QuickFarmTowns.user.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/SentinelButton.user.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/SentinelIndicator.user.js'), 'body');
// injectScript(chrome.runtime.getURL('src/scripts/TownBBCode.js'), 'body');
//injectScript(chrome.runtime.getURL('src/scripts/Trade.js'), 'body');

injectScript(chrome.runtime.getURL('src/scripts/Patches.js'), 'body');
injectScript(chrome.runtime.getURL('src/scripts/QuickPlan.user.js'), 'body');
// injectScript(chrome.runtime.getURL('src/content/FlaskTool.user.js'), 'body');
