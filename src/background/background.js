console.log('Background service worker loaded')

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details)
  
  // Set some initial storage values
  chrome.storage.local.set({
    installDate: new Date().toISOString(),
    version: chrome.runtime.getManifest().version
  })
})

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message)
  
  if (message.action === 'ping') {
    sendResponse({ status: 'pong' })
  }
  
  return true
})
