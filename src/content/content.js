console.log('Content script loaded on:', window.location.href)

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in content script:', message)
  
  if (message.action === 'changeColor') {
    document.body.style.backgroundColor = message.color
    sendResponse({ status: 'Color changed successfully' })
  }
  
  return true
})

// Example: Add a badge to show the extension is active
const badge = document.createElement('div')
badge.id = 'modern-tools-badge'
badge.textContent = '🛠️'
badge.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 999999;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
`

badge.addEventListener('mouseenter', () => {
  badge.style.transform = 'scale(1.1)'
})

badge.addEventListener('mouseleave', () => {
  badge.style.transform = 'scale(1)'
})

badge.addEventListener('click', () => {
  alert('Modern Tools Extension is active!')
})

document.body.appendChild(badge)

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('Content script HMR updated!')
  })
}
