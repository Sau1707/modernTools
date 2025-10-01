import './popup.css'

// Example of HMR (Hot Module Replacement) in action
console.log('Popup script loaded')

document.addEventListener('DOMContentLoaded', () => {
  const changeColorBtn = document.getElementById('changeColorBtn')
  
  if (changeColorBtn) {
    changeColorBtn.addEventListener('click', async () => {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      // Send a message to the content script
      chrome.tabs.sendMessage(tab.id, { 
        action: 'changeColor',
        color: getRandomColor()
      })
    })
  }
})

function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
  return colors[Math.floor(Math.random() * colors.length)]
}

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('HMR updated!')
  })
}
